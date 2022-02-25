const { dialog, app } = require('electron').remote;
const path = require('path');
const channel = require('./main.channel');
const Login = require('./login.service');

class MailService {

  static loadMailbox(payload) {
    channel.send({ event: 'loadMailbox', payload });

    return new Promise((resolve, reject) => {
      channel.once('loadMailbox', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  // Fetches new emails
  static getNewMail() {
    channel.send({ event: 'mailbox:getNewMailMeta', payload: {} });

    return new Promise((resolve, reject) => {
      channel.once('mailbox:getNewMailMeta:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  // Send new emails
  static send(email) {
    channel.send({ event: 'email:sendEmail', payload: { email } });

    return new Promise((resolve, reject) => {
      channel.once('email:sendEmail:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static markAsSynced(msgArray, opts) {
    channel.send({ event: 'mailbox:markArrayAsSynced', payload: { msgArray } });

    if (opts.sync) {
      return new Promise((resolve, reject) => {
        channel.once('mailbox:markArrayAsSynced:callback', m => {
          const { error, data } = m;
          if (error) return reject(error);
          return resolve(data);
        });
      });
    }
    return true;
  }

  static markAsUnread(id, folderId) {
    channel.send({ event: 'email:markAsUnread', payload: { id, folderId } });

    return new Promise((resolve, reject) => {
      channel.once('email:markAsUnread:callback', m => {
        const { error, data } = m;
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

    channel.send({ event: 'email:saveFiles', payload: { filepath, attachments } });

    return new Promise((resolve, reject) => {
      channel.once('email:saveFiles:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static save(opts) {
    channel.send({
      event: 'email:saveMessageToDB',
      payload: { messages: opts.messages, type: opts.type }
    });

    if (opts.async) {
      return new Promise((resolve, reject) => {
        channel.once('email:saveMessageToDB:callback', m => {
          const { error, data } = m;
          if (error) return reject(error);
          return resolve(data);
        });
      });
    }

    return true;
  }

  static saveMailbox(address) {
    channel.send({ event: 'mailbox:saveMailbox', payload: address });

    return new Promise((resolve, reject) => {
      channel.once('mailbox:saveMailbox:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static getMailboxes() {
    channel.send({ event: 'mailbox:getMailboxes', payload: {} });

    return new Promise((resolve, reject) => {
      channel.once('mailbox:getMailboxes:callback', async m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static createFolder(opts) {
    channel.send({ event: 'folder:createFolder', payload: opts });

    return new Promise((resolve, reject) => {
      channel.once('folder:createFolder:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static updateFolder(opts) {
    channel.send({ event: 'folder:updateFolder', payload: opts });

    return new Promise((resolve, reject) => {
      channel.once('folder:updateFolder:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static updateFolderCount(opts) {
    channel.send({ event: 'folder:updateFolderCount', payload: opts });
  }

  static updateAliasCount(opts) {
    channel.send({ event: 'alias:updateAliasCount', payload: opts });
  }

  static deleteFolder(opts) {
    channel.send({ event: 'folder:deleteFolder', payload: opts });

    return new Promise((resolve, reject) => {
      channel.once('folder:deleteFolder:callback', m => {
        const { data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static getMailboxFolders(id) {
    channel.send({ event: 'folder:getMailboxFolders', payload: { id } });

    return new Promise((resolve, reject) => {
      channel.once('folder:getMailboxFolders:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static getMessagesByFolderId(id, limit, offset) {
    channel.send({
      event: 'email:getMessagesByFolderId',
      payload: { id, limit, offset }
    });

    return new Promise((resolve, reject) => {
      channel.once('email:getMessagesByFolderId:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static getMessagesByAliasId(id, limit, offset) {
    channel.send({
      event: 'email:getMessagesByAliasId',
      payload: { id, limit, offset }
    });

    return new Promise((resolve, reject) => {
      channel.once('email:getMessagesByAliasId:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static getMessagebyId(id) {
    channel.send({ event: 'email:getMessageById', payload: { id } });

    return new Promise((resolve, reject) => {
      channel.once('email:getMessageById:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static moveMessages(messages) {
    channel.send({ event: 'email:moveMessages', payload: { messages } });

    return new Promise((resolve, reject) => {
      channel.once('email:moveMessages:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static removeMessages(messageIds) {
    channel.send({ event: 'email:removeMessages', payload: { messageIds } });

    return new Promise((resolve, reject) => {
      channel.once('email:removeMessages:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static registerMailbox(payload) {
    channel.send({ event: 'mailbox:register', payload });

    return new Promise((resolve, reject) => {
      channel.once('mailbox:register:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static getMailboxNamespaces(id) {
    channel.send({
      event: 'alias:getMailboxNamespaces',
      payload: { id }
    });

    return new Promise((resolve, reject) => {
      channel.once('alias:getMailboxNamespaces:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static getMailboxAliases(namespaceKeys) {
    channel.send({
      event: 'alias:getMailboxAliases',
      payload: { namespaceKeys }
    });

    return new Promise((resolve, reject) => {
      channel.once('alias:getMailboxAliases:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static registerAliasNamespace(payload) {
    channel.send({
      event: 'alias:registerAliasNamespace',
      payload
    });

    return new Promise((resolve, reject) => {
      channel.once('alias:registerAliasNamespace:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static registerAliasAddress(payload) {
    channel.send({
      event: 'alias:registerAliasAddress',
      payload
    });

    return new Promise((resolve, reject) => {
      channel.once('alias:registerAliasAddress:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static updateAliasAddress(payload) {
    channel.send({
      event: 'alias:updateAliasAddress',
      payload
    });

    return new Promise((resolve, reject) => {
      channel.once('alias:updateAliasAddress:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static removeAliasAddress(payload) {
    channel.send({
      event: 'alias:removeAliasAddress',
      payload
    });

    return new Promise((resolve, reject) => {
      channel.once('alias:removeAliasAddress:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static search(searchQuery) {
    channel.send({
      event: 'email:searchMailbox',
      payload: { searchQuery }
    });

    return new Promise((resolve, reject) => {
      channel.once('email:searchMailbox:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }
}

module.exports = MailService;
