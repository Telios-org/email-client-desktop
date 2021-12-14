const { dialog, app } = require('electron').remote;
const path = require('path');
const worker = require('../workers/main.worker');
const Login = require('./login.service');

class MailService {
  static async reloadSession() {
    try {
      const account = await Login.getAccount();

      await Login.loadMailbox();

      // await Login.initSession(
      //   { password: null, email: null },
      //   account.secretBoxPrivKey,
      //   account.secretBoxPubKey
      // );

      return true;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  static loadMailbox(payload) {
    worker.send({ event: 'loadMailbox', payload });

    return new Promise((resolve, reject) => {
      worker.once('loadMailbox', m => {
        const { data, error } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  // Fetches new emails
  static getNewMail() {
    worker.send({ event: 'getNewMailMeta', payload: {} });

    return new Promise((resolve, reject) => {
      worker.once('getNewMailMeta', m => {
        const { data, error } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  // Send new emails
  static send(email) {
    worker.send({ event: 'MAILBOX_SERVICE::sendEmail', payload: { email } });

    return new Promise((resolve, reject) => {
      worker.once('MAILBOX_WORKER::sendEmail', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static markAsSynced(msgArray, opts) {
    worker.send({ event: 'markArrayAsSynced', payload: { msgArray } });

    if (opts.sync) {
      return new Promise((resolve, reject) => {
        worker.once('markArrayAsSynced', m => {
          const { data, error } = m;

          if (error) return reject(error);

          return resolve(data);
        });
      });
    }
    return true;
  }

  static markAsUnread(id, folderId) {
    worker.send({ event: 'markAsUnread', payload: { id, folderId } });

    return new Promise((resolve, reject) => {
      worker.once('markAsUnread', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async saveAttachmentsToDisk(attachments) {
    let options;

    if (attachments.length === 1) {
      options = {
        title: 'Select Path',
        buttonLabel: 'Save Attachment',
        defaultPath: path.join(
          app.getPath('downloads'),
          attachments[0].filename
        ),
        properties: ['showOverwriteConfirmation', 'createDirectory']
      };
    } else {
      options = {
        title: 'Select Path',
        buttonLabel: 'Save Attachments',
        properties: ['openDirectory', 'createDirectory']
      };
    }

    const filepath = await dialog.showSaveDialogSync(options);

    worker.send({ event: 'saveFiles', payload: { filepath, attachments } });

    return new Promise((resolve, reject) => {
      worker.once('saveFiles', m => {
        const { event, data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static save(opts) {
    worker.send({
      event:
        opts.type === 'Sent'
          ? 'MAIL SERVICE::SaveSentMessageToDB'
          : 'MAIL SERVICE::saveMessageToDB',
      payload: { messages: opts.messages, type: opts.type }
    });

    if (opts.async) {
      return new Promise((resolve, reject) => {
        worker.once('MAILBOX_WORKER::saveMessageToDB', m => {
          const { data, error } = m;

          if (error) return reject(error);

          return resolve(data);
        });
      });
    }

    return true;
  }

  static saveMailbox(address) {
    worker.send({ event: 'saveMailbox', payload: address });

    return new Promise((resolve, reject) => {
      worker.once('saveMailbox', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static getMailboxes() {
    worker.send({ event: 'getMailboxes', payload: {} });

    return new Promise((resolve, reject) => {
      worker.once('getMailboxes', async m => {
        const { data, error } = m;

        if (error) {
          reject(error);
          MailService.reloadSession();
        }
        return resolve(data);
      });
    });
  }

  static createFolder(opts) {
    worker.send({ event: 'createFolder', payload: opts });

    return new Promise((resolve, reject) => {
      worker.once('createFolder', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static updateFolder(opts) {
    worker.send({ event: 'updateFolder', payload: opts });

    return new Promise((resolve, reject) => {
      worker.once('updateFolder', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static updateFolderCount(opts) {
    worker.send({ event: 'updateFolderCount', payload: opts });
  }

  static updateAliasCount(opts) {
    worker.send({ event: 'updateAliasCount', payload: opts });
  }

  static deleteFolder(opts) {
    worker.send({ event: 'deleteFolder', payload: opts });

    return new Promise((resolve, reject) => {
      worker.once('deleteFolder', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static getMailboxFolders(id) {
    worker.send({ event: 'MAIL_SERVICE::getMailboxFolders', payload: { id } });

    return new Promise((resolve, reject) => {
      worker.once('MAIL_WORKER::getMailboxFolders', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static getMessagesByFolderId(id, limit, offset) {
    worker.send({
      event: 'MAIL_SERVICE::getMessagesByFolderId',
      payload: { id, limit, offset }
    });

    return new Promise((resolve, reject) => {
      worker.once('MAIL_WORKER::getMessagesByFolderId', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static getMessagesByAliasId(id, limit, offset) {
    worker.send({
      event: 'MAIL_SERVICE::getMessagesByAliasId',
      payload: { id, limit, offset }
    });

    return new Promise((resolve, reject) => {
      worker.once('MAIL_WORKER::getMessagesByAliasId', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static getMessagebyId(id) {
    worker.send({ event: 'MAIL_SERVICE::getMessageById', payload: { id } });

    return new Promise((resolve, reject) => {
      worker.once('MAIL_WORKER::getMessagebyId', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static moveMessages(messages) {
    worker.send({ event: 'moveMessages', payload: { messages } });

    return new Promise((resolve, reject) => {
      worker.once('moveMessages', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static removeMessages(messageIds) {
    worker.send({ event: 'removeMessages', payload: { messageIds } });

    return new Promise((resolve, reject) => {
      worker.once('removeMessages', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static registerMailbox(payload) {
    worker.send({ event: 'registerMailbox', payload });

    return new Promise((resolve, reject) => {
      worker.once('registerMailbox', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static getMailboxNamespaces(id) {
    worker.send({
      event: 'MAIL_SERVICE::getMailboxNamespaces',
      payload: { id }
    });

    return new Promise((resolve, reject) => {
      worker.once('MAIL_WORKER::getMailboxNamespaces', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static getMailboxAliases(namespaceKeys) {
    worker.send({
      event: 'MAIL_SERVICE::getMailboxAliases',
      payload: { namespaceKeys }
    });

    return new Promise((resolve, reject) => {
      worker.once('MAIL_WORKER::getMailboxAliases', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static registerAliasNamespace(payload) {
    worker.send({
      event: 'MAIL_SERVICE::registerAliasNamespace',
      payload
    });

    return new Promise((resolve, reject) => {
      worker.once('MAIL_WORKER::registerAliasNamespace', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static registerAliasAddress(payload) {
    worker.send({
      event: 'MAIL_SERVICE::registerAliasAddress',
      payload
    });

    return new Promise((resolve, reject) => {
      worker.once('MAIL_WORKER::registerAliasAddress', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static updateAliasAddress(payload) {
    worker.send({
      event: 'MAIL_SERVICE::updateAliasAddress',
      payload
    });

    return new Promise((resolve, reject) => {
      worker.once('MAIL_WORKER::updateAliasAddress', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static removeAliasAddress(payload) {
    worker.send({
      event: 'MAIL_SERVICE::removeAliasAddress',
      payload
    });

    return new Promise((resolve, reject) => {
      worker.once('MAIL_WORKER::removeAliasAddress', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static search(searchQuery) {
    worker.send({
      event: 'MAIL_SERVICE::searchMailbox',
      payload: { searchQuery }
    });

    return new Promise((resolve, reject) => {
      worker.once('MAILBOX_WORKER::searchMailbox', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }
}

module.exports = MailService;
