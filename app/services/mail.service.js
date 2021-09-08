const { dialog } = require('electron').remote;
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
    worker.send({ event: 'sendEmail', payload: { email } });

    return new Promise((resolve, reject) => {
      worker.once('sendEmail', m => {
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
        defaultPath: attachments[0].filename,
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
      event: 'MAIL SERVICE::saveMessageToDB',
      payload: { messages: opts.messages, type: opts.type }
    });

    if (opts.sync) {
      return new Promise((resolve, reject) => {
        worker.once('MAILBOX WORKER::saveMessageToDB', m => {
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
    worker.send({ event: 'getMailboxFolders', payload: { id } });

    return new Promise((resolve, reject) => {
      worker.once('getMailboxFolders', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static getMessagesByFolderId(id, limit) {
    worker.send({ event: 'getMessagesByFolderId', payload: { id, limit } });

    return new Promise((resolve, reject) => {
      worker.once('getMessagesByFolderId', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static getMessagebyId(id) {
    worker.send({ event: 'getMessageById', payload: { id } });

    return new Promise((resolve, reject) => {
      worker.once('getMessagebyId', m => {
        const { data, error } = m;

        if (error) return reject(error);
        data.unread = false;
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

  static search(searchQuery) {
    worker.send({ event: 'searchMailbox', payload: { searchQuery } });

    return new Promise((resolve, reject) => {
      worker.once('searchMailbox', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }
}

module.exports = MailService;
