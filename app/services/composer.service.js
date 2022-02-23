const { ipcRenderer } = require('electron');
const MailService = require('./mail.service');
const ContactService = require('./contact.service');

class ComposerService {
  static async send(email, isInline) {

    if(!email.attachments) email.attachments = []

    if (isInline) {
      await MailService.send(email);
    } else {
      await ComposerService.sendEmail(email);
    }

    ComposerService.createContacts(email, isInline);
  }

  static async sendEmail(email) {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('sendEmail', email)
        .then((data) => {
          ipcRenderer.send('clearInMemDraft');
          return resolve(data);
        })
        .catch(err => {
          return reject(err);
        });
    });
  }

  static async uploadAttachments() {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('SERVICE::uploadAttachments')
        .then(data => {
          return resolve(data);
        })
        .catch(e => {
          reject(e);
        });
    });
  }

  static async saveFiles(attachments) {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('saveFiles', attachments)
        .then(data => {
          return resolve(data);
        })
        .catch(e => {
          reject(e);
        });
    });
  }

  static async createContacts(email, isInline) {
    if (isInline) {
      ContactService.createContacts([...email.to, ...email.cc, ...email.bcc])
        .then(res => {
          return true;
        })
        .catch(e => {
          console.error(e);
        });
    } else {
      ipcRenderer
        .invoke('createContacts', [...email.to, ...email.cc, ...email.bcc])
        .then(() => {
          return true;
        })
        .catch(e => {
          console.error(e);
        });
    }
  }

  static async searchContact(searchQuery, isInline) {
    if (isInline) {
      return ContactService.searchContact(searchQuery);
    }

    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('searchContact', searchQuery)
        .then(contacts => {
          return resolve(contacts);
        })
        .catch(e => {
          console.error(e);
          reject(e);
        });
    });
  }
}

module.exports = ComposerService;
