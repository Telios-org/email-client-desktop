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
    this.MAX_RETRY = 1;
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

        if (data._id) {
          this.syncIds.push(data._id);
        }

        MailService.save({
          messages: [email],
          type: 'Incoming',
          async: false
        })
      }
    });

    mainWorker.on('MAILBOX_WORKER::saveMessageToDB', async m => {
      
      const { data, error } = m;

      if(error) {
        console.log('MessageIngess.service::saveMessageToDBError', error);

        this.finished += 1;
        this.handleDone();
        return;
      }

      data.msgArr.forEach(msg => {
        if(!this.incomingMsgBatch.some(item => item.id === msg.id)) {
          this.incomingMsgBatch.push(msg);
        }
      })

      if (data.newAliases.length > 0) {
        data.newAliases.forEach(alias => {
          if(!this.newAliases.some(a => a.name === alias.name))  {
            this.newAliases.push(alias)
          }
        })
      }

      this.finished += 1;
      this.handleDone();
    })

    mainWorker.on('fetchError', async m => {
      const { data } = m;

      console.log('MessageIngess.service::fetchError', m);

      if (data.file && data.file.failed < this.MAX_RETRY) {
        this.retryQueue.push(data.file);
        this.handleDone();
      }

      if (data.file && data.file.failed === this.MAX_RETRY) {
        console.log(`File ${data.file.hash} failed all attempts!`);

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

      this.emit('MESSAGE_INGRESS_SERVICE::messageSyncStarted', meta.length);

      mainWorker.send({
        event: 'MESSAGE_INGRESS_SERVICE::newMessageBatch',
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
      this.emit('MESSAGE_INGRESS_SERVICE::messageSynced', {
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

      this.emit('MESSAGE_INGRESS_SERVICE::messageSynced', {
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
  const email = data.email.content;

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
  };
}
