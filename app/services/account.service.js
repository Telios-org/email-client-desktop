const { ipcRenderer } = require('electron');
const worker = require('../workers/main.worker');
const MailService = require('./mail.service');
const ContactService = require('./contact.service');
const MessageIngressService = require('./messageIngress.service');

class AccountService {
  constructor() {
    ipcRenderer.once('createAccount', async (evt, data) => {
      try {
        const account = await AccountService.createAccount(data);

        // Start incoming message listener
        MessageIngressService.initMessageListener();

        ipcRenderer.send('createAccountResponse', account);
      } catch (e) {
        console.log(e);
        ipcRenderer.send('createAccountError', e);
      }
    });

    ipcRenderer.once('getAcct', async (evt, data) => {
      try {
        const account = await AccountService.getAccount(data);

        ipcRenderer.send('getAcctResponse', account);
      } catch (e) {
        ipcRenderer.send('getAcctError', e);
      }
    });

    ipcRenderer.once('authenticate', async (evt, data) => {
      try {
        const account = await AccountService.authenticate(data);
        ipcRenderer.send('authResponse', account);
      } catch (e) {
        ipcRenderer.send('authError', e);
      }
    });

    ipcRenderer.once('initSession', async (evt, data) => {
      try {
        const account = await AccountService.initSession(data);
        ipcRenderer.send('initSessionResponse', account);
      } catch (e) {
        ipcRenderer.send('initSessionError', e);
      }
    });

    ipcRenderer.once('loadMbox', async (evt, data) => {
      try {
        // Start incoming message listener
        await MessageIngressService.initMessageListener();

        const account = await MailService.loadMailbox();

        ipcRenderer.send('loadMboxResponse', account);
      } catch (e) {
        ipcRenderer.send('loadMboxError', e);
      }
    });

    ipcRenderer.on('sendEmail', async (evt, data) => {
      try {
        const result = await MailService.send(data);
        ipcRenderer.send('sendEmailResponse', result);
      } catch (e) {
        ipcRenderer.send('sendEmailError', e);
      }
    });

    ipcRenderer.on('IPC::saveMessageToDB', async (evt, data) => {
      try {
        await MailService.save(data);

        ipcRenderer.send('ACCOUNT SERVICE::saveMessageToDBResponse', null);
      } catch (e) {
        ipcRenderer.send('ACCOUNT SERVICE::saveMessageToDBError', e);
      }
    });

    ipcRenderer.on('saveFiles', async (evt, attachments) => {
      try {
        const res = await MailService.saveAttachmentsToDisk(attachments);

        ipcRenderer.send('saveFilesResponse', res);
      } catch (e) {
        ipcRenderer.send('saveFilesError', e);
      }
    });

    ipcRenderer.on('createContacts', async (evt, data) => {
      try {
        await ContactService.createContacts(data);

        ipcRenderer.send('createContactsResponse', null);
      } catch (e) {
        ipcRenderer.send('createContactsError', e);
      }
    });

    ipcRenderer.on('searchContact', async (evt, searchQuery) => {
      try {
        const contacts = await ContactService.searchContact(searchQuery);

        ipcRenderer.send('searchContactResponse', contacts);
      } catch (e) {
        ipcRenderer.send('searchContactError', e);
      }
    });

    ipcRenderer.on('exitProcess', async () => {
      worker.send({ event: 'exitProcess', payload: {} });
    });

    worker.on('syncMail', () => {
      ipcRenderer.send('syncMail')
    });
  }

  static async initSession(params) {
    const { opts, privKey, pubKey } = params;

    worker.send({ event: 'initSession', payload: { opts, privKey, pubKey } });

    return new Promise((resolve, reject) => {
      worker.once('initSession', m => {
        const { data, error } = m;
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static createAccount(payload) {
    worker.send({ event: 'createAccount', payload });

    return new Promise((resolve, reject) => {
      worker.once('createAccount', async m => {
        const { data, error } = m;
        if (error) return reject(error);

        const { signedAcct, secretBoxKeypair, signingKeypair, mnemonic, sig } = data;

        try {
          await MailService.loadMailbox({
            signedAcct,
            secretBoxKeypair,
            signingKeypair,
            sig
          });

          const registerPayload = {
            account_key: signedAcct.account_key,
            addr: payload.email
          };

          await MailService.registerMailbox(registerPayload);
          await MailService.saveMailbox(payload.email);

          ipcRenderer.invoke('MATOMO::init', { account, isNew: true });

          resolve({
            secretBoxPubKey: secretBoxKeypair.publicKey,
            secretBoxPrivKey: secretBoxKeypair.privateKey,
            secretBoxSeedKey: secretBoxKeypair.seedKey,
            mnemonic,
            signingPubKey: signingKeypair.publicKey,
            signingPrivKey: signingKeypair.privateKey
          });
        } catch (err) {
          console.log(err);
          reject(err);
        }
      });
    });
  }

  static getAccount(params) {
    const { email, password } = params;

    worker.send({ event: 'getAcct', payload: { password, email } });

    return new Promise((resolve, reject) => {
      worker.once('getAcct', m => {
        const { data, error } = m;

        if (error) return reject(error);

        ipcRenderer.invoke('MATOMO::init', { account: data, isNew: false });

        return resolve(data);
      });
    });
  }

  static logout() {
    worker.send({ event: 'accountLogout', payload: {} });

    return new Promise((resolve, reject) => {
      worker.once('accountLogout', m => {
        const { error } = m;

        if (error) return reject(error);

        ipcRenderer.send('logout');

        return resolve();
      });
    });
  }
}

module.exports = AccountService;
