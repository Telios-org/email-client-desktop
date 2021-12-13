const { ipcRenderer } = require('electron');
const MailService = require('./mail.service');
const ContactService = require('./contact.service');
const FileService = require('./file.service');
const { v4: uuidv4 } = require('uuid');

class ComposerService {
  static async send(email, isInline) {
    let details;
    let eml = { ...email }

    // Save individual attachments
    if(eml.attachments.length) {
      eml.attachments = await Promise.all(eml.attachments.map(async attachment => {
        let file;

        try {
          file = await FileService.saveFileToDrive(attachment);
        
          return {
            emailId: eml.id,
            filename: file.name || file.filename,
            contentType: file.contentType || file.mimetype,
            size: file.size,
            discoveryKey: file.discovery_key,
            hash: file.hash,
            path: file.path,
            header: file.header,
            key: file.key
          }
        } catch(e) {
          console.error(e)
        }
      }));
    }

    if (isInline) {
      details = await MailService.send(eml);
    } else {
      details = await ComposerService.sendEmail(eml);
    }

    eml.path = details.path;
    eml.encKey = details.key;
    eml.encHeader = details.header;

    ComposerService.save(eml, isInline);
    ComposerService.createContacts(eml, isInline);
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

  static async save(email, isInline, mailProps) {
    if (isInline) {
      await MailService.save({ messages: [email], type: 'Sent', sync: true });
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
