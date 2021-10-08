const { remote } = require('electron');
const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');
const { fork } = require('child_process');
const MailService = require('./mail.service');
const mainWorker = require('../workers/main.worker');

const appPath = remote.app.getAppPath();

class MessageIngressService extends EventEmitter {
  constructor() {
    super();

    this.getMailLocked = false;
    this.finished = 0;
    this.msgBatchSize = 0;
    this.syncIds = [];
    this.incomingMsgBatch = [];
    this.newAliases = [];
    this.retryQueue = [];
    this.account = null;
    this.MAX_RETRY = 3;
    this.folderCounts = {};

    mainWorker.on('newMessage', async m => {
      const { data, error } = m;

      this.msgBatchSize += 1;

      mainWorker.send({
        event: 'newMessage',
        payload: { meta: data.meta }
      });
    });

    mainWorker.on('fileFetched', async m => {
      const { event, data, error } = m;
      if (!error) {
        const email = transformEmail(data);

        MailService.save({ messages: [email], type: 'Incoming', async: true }).then(msg => {

          this.incomingMsgBatch = [...msg.msgArr, ...this.incomingMsgBatch];

          if (msg.newAliases.length > 0) {
            this.newAliases = [...msg.newAliases, ...this.newAliases];
          }

          if (data._id) {
            this.syncIds.push(data._id);
          }

          this.finished += 1;
          this.handleDone();
        });
      }
    });

    mainWorker.on('fetchError', async m => {
      const { error } = m;

      if (error.file && error.file.failed < this.MAX_RETRY) {
        this.retryQueue.push(error.file);
        this.handleDone();
      }

      if (error.file && error.file.failed === this.MAX_RETRY) {
        console.log(`File ${error.file.hash} failed all attempts!`);

        // Goes into drive's dead letter queue

        this.finished += 1;
        this.handleDone();
      }
    });
  }

  decipherMailMeta(payload) {
    const { meta, account } = payload;

    this.account = account;

    if (!this.getMailLocked) {
      this.getMailLocked = true;
      this.finished = 0;
      this.msgBatchSize = meta.length;

      this.emit('messageSyncStarted', meta.length);

      mainWorker.send({
        event: 'newMessageBatch',
        payload: { meta, account }
      });
    }
  }

  // Start incoming message listener
  initMessageListener() {
    mainWorker.send({ event: 'initMessageListener' });
  }

  handleDone() {
    if (this.syncIds.length > 4) {
      MailService.markAsSynced(this.syncIds, { sync: false });
      this.syncIds = [];
    }

    // Retry failed messages
    if (this.finished + this.retryQueue.length === this.msgBatchSize) {
      mainWorker.send({
        event: 'retryMessageBatch',
        payload: { batch: this.retryQueue }
      });

      this.retryQueue = [];
    }

    if (this.finished < this.msgBatchSize) {
      this.emit('messageSynced', {
        index: this.finished,
        total: this.msgBatchSize,
        done: false
      });

    } else {
      this.getMailLocked = false;

      if (this.syncIds.length) {
        MailService.markAsSynced(this.syncIds, { sync: false });
        this.syncIds = [];
      }

      this.emit('messageSynced', {
        index: this.finished,
        total: this.msgBatchSize,
        messages: this.incomingMsgBatch,
        newAliases: this.newAliases,
        done: true
      });

      this.incomingMsgBatch = [];
      this.finished = 0;
      this.msgBatchSize = 0;
    }
  }
}

const instance = new MessageIngressService();

module.exports = instance;

function transformEmail(data) {
  const { path, key, header } = data.email;
  let email = data.email.content;

  return {
    unread: 1,
    fromJSON: JSON.stringify(email.from),
    toJSON: JSON.stringify(email.to),
    ccJSON: JSON.stringify(email.cc),
    bccJSON: JSON.stringify(email.bcc),
    bodyAsHtml: email.html_body,
    bodyAsText: email.text_body,
    path,
    encKey: key,
    encHeader: header,
    ...email
  }
}
