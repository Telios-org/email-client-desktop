const { ipcRenderer } = require('electron');
const MailService = require('./mail.service');
const ContactService = require('./contact.service');
const fileUtil = require('../utils/file.util');

class ComposerService {
  static async send(email, isInline) {
    let details;

    if (isInline) {
      details = await MailService.send(email);
    } else {
      details = await ComposerService.sendEmail(email);
    }

    // Decode base64 attachments before saving
    for(let i = 0; i < email.attachments.length; i += 1 ) {
      email.attachments[i].content = fileUtil.decodeB64(email.attachments[i].content);
    }

    email.path = details.path;
    email.encKey = details.key;
    email.encHeader = details.header;

    ComposerService.save(email, 'Sent', isInline);
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

  static async save(email, type, isInline, mailProps) {
    if (isInline) {
      await MailService.save({ messages: [email], type, sync: true });
    } else {
      ipcRenderer
        .invoke('COMPOSER SERVICE::saveMessageToDB', {
          messages: [email],
          type: 'Sent',
          sync: true
        })
        .then(() => {
          return true;
        })
        .catch(e => {
          console.error(e);
        });
    }
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
