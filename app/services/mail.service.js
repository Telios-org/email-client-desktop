const { dialog, app } = require('electron').remote;
const path = require('path');
const worker = require('../workers/main.worker');
const Login = require('./login.service');

class MailService {

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
    worker.send({ event: 'mailbox:getNewMailMeta', payload: {} });

    return new Promise((resolve, reject) => {
      worker.once('mailbox:getNewMailMeta:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });
      worker.once('mailbox:getNewMailMeta:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }

  // Send new emails
  static send(email) {
    worker.send({ event: 'email:sendEmail', payload: { email } });

    return new Promise((resolve, reject) => {
      worker.once('email:sendEmail:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });
      worker.once('email:sendEmail:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }

  static markAsSynced(msgArray, opts) {
    worker.send({ event: 'mailbox:markArrayAsSynced', payload: { msgArray } });

    if (opts.sync) {
      return new Promise((resolve, reject) => {
        worker.once('mailbox:markArrayAsSynced:error', m => {
          const { error } = m;
          if (error) return reject(error);
        });
        worker.once('mailbox:markArrayAsSynced:success', m => {
          const { data } = m;
          return resolve(data);
        });
      });
    }
    return true;
  }

  static markAsUnread(id, folderId) {
    worker.send({ event: 'email:markAsUnread', payload: { id, folderId } });

    return new Promise((resolve, reject) => {
      worker.once('email:markAsUnread:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });
      worker.once('email:markAsUnread:success', m => {
        const { data } = m;
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

    worker.send({ event: 'email:saveFiles', payload: { filepath, attachments } });

    return new Promise((resolve, reject) => {
      worker.once('email:saveFiles:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });

      worker.once('email:saveFiles:success', m => {
        const { data } = m;
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
    worker.send({ event: 'mailbox:saveMailbox', payload: address });

    return new Promise((resolve, reject) => {
      worker.once('mailbox:saveMailbox:success', m => {
        const { data, error } = m;
        if (error) return reject(error);
      });
      worker.once('mailbox:saveMailbox:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }

  static getMailboxes() {
    worker.send({ event: 'mailbox:getMailboxes', payload: {} });

    return new Promise((resolve, reject) => {
      worker.once('mailbox:getMailboxes:error', async m => {
        const { error } = m;
        if (error) reject(error);
      });
      
      worker.once('mailbox:getMailboxes:success', async m => {
        const { data, error } = m;

        return resolve(data);
      });
    });
  }

  static createFolder(opts) {
    worker.send({ event: 'folder:createFolder', payload: opts });

    return new Promise((resolve, reject) => {
      worker.once('folder:createFolder:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });

      worker.once('folder:createFolder:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }

  static updateFolder(opts) {
    worker.send({ event: 'folder:updateFolder', payload: opts });

    return new Promise((resolve, reject) => {
      worker.once('folder:updateFolder:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });
      worker.once('folder:updateFolder:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }

  static updateFolderCount(opts) {
    worker.send({ event: 'folder:updateFolderCount', payload: opts });
  }

  static updateAliasCount(opts) {
    worker.send({ event: 'updateAliasCount', payload: opts });
  }

  static deleteFolder(opts) {
    worker.send({ event: 'folder:deleteFolder', payload: opts });

    return new Promise((resolve, reject) => {
      worker.once('folder:deleteFolder:error', m => {
        const { error } = m;
        if (error) return reject(error);
      })
      worker.once('folder:deleteFolder:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }

  static getMailboxFolders(id) {
    worker.send({ event: 'folder:getMailboxFolders', payload: { id } });

    return new Promise((resolve, reject) => {
      worker.once('folder:getMailboxFolders:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });
      worker.once('folder:getMailboxFolders:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }

  static getMessagesByFolderId(id, limit, offset) {
    worker.send({
      event: 'email:getMessagesByFolderId',
      payload: { id, limit, offset }
    });

    return new Promise((resolve, reject) => {
      worker.once('email:getMessagesByFolderId:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });

      worker.once('email:getMessagesByFolderId:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }

  static getMessagesByAliasId(id, limit, offset) {
    worker.send({
      event: 'email:getMessagesByAliasId',
      payload: { id, limit, offset }
    });

    return new Promise((resolve, reject) => {
      worker.once('email:getMessagesByAliasId:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });
      worker.once('email:getMessagesByAliasId:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }

  static getMessagebyId(id) {
    worker.send({ event: 'email:getMessageById', payload: { id } });

    return new Promise((resolve, reject) => {
      worker.once('email:getMessageById:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });
      worker.once('email:getMessageById:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }

  static moveMessages(messages) {
    worker.send({ event: 'email:removeMessages', payload: { messages } });

    return new Promise((resolve, reject) => {
      worker.once('email:removeMessages:error', m => {
        const { data, error } = m;
        if (error) return reject(error);
      });
      worker.once('email:removeMessages:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }

  static removeMessages(messageIds) {
    worker.send({ event: 'email:removeMessages', payload: { messageIds } });

    return new Promise((resolve, reject) => {
      worker.once('email:removeMessages:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });
      worker.once('email:removeMessages:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }

  static registerMailbox(payload) {
    worker.send({ event: 'mailbox:register', payload });

    return new Promise((resolve, reject) => {
      worker.once('mailbox:register:success', m => {
        const { data } = m;

        return resolve(data);
      });

      worker.once('mailbox:register:error', m => {
        const { error } = m;

        if (error) return reject(error);
      });
    });
  }

  static getMailboxNamespaces(id) {
    worker.send({
      event: 'alias:getMailboxNamespaces',
      payload: { id }
    });

    return new Promise((resolve, reject) => {
      worker.once('alias:getMailboxNamespaces:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });
      worker.once('alias:getMailboxNamespaces:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }

  static getMailboxAliases(namespaceKeys) {
    worker.send({
      event: 'alias:getMailboxAliases',
      payload: { namespaceKeys }
    });

    return new Promise((resolve, reject) => {
      worker.once('alias:getMailboxAliases:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });
      worker.once('alias:getMailboxAliases:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }

  static registerAliasNamespace(payload) {
    worker.send({
      event: 'alias:registerAliasNamespace',
      payload
    });

    return new Promise((resolve, reject) => {
      worker.once('alias:registerAliasNamespace:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });

      worker.once('alias:registerAliasNamespace:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }

  static registerAliasAddress(payload) {
    worker.send({
      event: 'alias:registerAliasAddress',
      payload
    });

    return new Promise((resolve, reject) => {
      worker.once('alias:registerAliasAddress:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });

      worker.once('alias:registerAliasAddress:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }

  static updateAliasAddress(payload) {
    worker.send({
      event: 'alias:updateAliasAddress',
      payload
    });

    return new Promise((resolve, reject) => {
      worker.once('alias:updateAliasAddress:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });

      worker.once('alias:updateAliasAddress:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }

  static removeAliasAddress(payload) {
    worker.send({
      event: 'alias:removeAliasAddress',
      payload
    });

    return new Promise((resolve, reject) => {
      worker.once('alias:removeAliasAddress:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });

      worker.once('alias:removeAliasAddress:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }

  static search(searchQuery) {
    worker.send({
      event: 'email:searchMailbox',
      payload: { searchQuery }
    });

    return new Promise((resolve, reject) => {
      worker.once('email:searchMailbox:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });

      worker.once('email:searchMailbox:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }
}

module.exports = MailService;
