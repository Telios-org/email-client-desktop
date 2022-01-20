const { ipcRenderer } = require('electron');
const EventEmitter = require('events');
const worker = require('../workers/main.worker');
const MailService = require('./mail.service');
const ContactService = require('./contact.service');
const MessageIngressService = require('./messageIngress.service');

class AccountService extends EventEmitter {
  constructor() {
    super();

    ipcRenderer.once('ACCOUNT_IPC::createAccount', async (evt, data) => {
      try {
        const account = await AccountService.createAccount(data);

        // Start incoming message listener
        MessageIngressService.initMessageListener();

        ipcRenderer.send('ACCOUNT_SERVICE::createAccountResponse', account);
      } catch (e) {
        ipcRenderer.send('ACCOUNT_SERVICE::createAccountError', {
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    });

    ipcRenderer.once('ACCOUNT_IPC::initAcct', async (evt, data) => {
      try {
        const account = await AccountService.initAccount(data);

        // Emitting the account data so it can be ingested by the Redux Store
        this.emit('ACCOUNT_SERVICE::accountData', account);
        ipcRenderer.send('ACCOUNT_SERVICE::initAcctResponse', account);
      } catch (e) {
        ipcRenderer.send('ACCOUNT_SERVICE::initAcctError', e);
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
      ipcRenderer.send('syncMail');
    });

    worker.on('ACCOUNT_WORKER::refreshToken', m => {
      const { data, error } = m;
      this.emit('ACCOUNT_SERVICE::refreshToken', data.token);
    });
  }

  static createAccount(payload) {
    worker.send({ event: 'ACCOUNT_SERVICE::createAccount', payload });

    return new Promise((resolve, reject) => {
      worker.once('ACCOUNT_WORKER::createAccount', async m => {
        const { data, error } = m;
        if (error) return reject(error);

        const {
          uid,
          signedAcct,
          secretBoxKeypair,
          signingKeypair,
          mnemonic,
          deviceId,
          sig
        } = data;

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

          ipcRenderer.invoke('MATOMO::init', {
            account: {
              uid,
              secretBoxPubKey: secretBoxKeypair.publicKey,
              deviceSigningPrivKey: signingKeypair.privateKey,
              deviceSigningPubKey: signingKeypair.publicKey,
              deviceId,
              serverSig: sig
            },
            isNew: true
          });

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

  static initAccount(params) {
    const { email, password } = params;

    worker.send({
      event: 'ACCOUNT_SERVICE::initAcct',
      payload: { password, email }
    });

    return new Promise((resolve, reject) => {
      worker.once('ACCOUNT_WORKER::initAcct', m => {
        const { data, error } = m;

        if (error) return reject(error);

        ipcRenderer.invoke('MATOMO::init', { account: data, isNew: false });

        return resolve(data);
      });
    });
  }

  static getAccount() {
    ipcRenderer.send({
      event: 'ACCOUNT_SERVICE::getAccount'
    });

    return new Promise((resolve, reject) => {
      ipcRenderer.once('ACCOUNT_IPC::getAccount', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async updateAccount(payload) {
    worker.send({
      event: 'ACCOUNT_SERVICE::updateAccount',
      payload
    });

    return new Promise((resolve, reject) => {
      worker.once('ACCOUNT_WORKER::updateAccount', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async retrieveStats() {
    worker.send({
      event: 'ACCOUNT_SERVICE::retrieveStats'
    });

    return new Promise((resolve, reject) => {
      worker.once('ACCOUNT_WORKER::retrieveStats', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static refreshToken() {
    worker.send({
      event: 'ACCOUNT_SERVICE::refreshToken'
    });

    return new Promise((resolve, reject) => {
      worker.once('ACCOUNT_WORKER::refreshToken', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data.token);
      });
    });
  }

  static async uploadAvatar() {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('ACCOUNT_SERVICE::uploadAvatar')
        .then(data => {
          console.log('UPLODADED AVATAR', data);
          return resolve(data);
        })
        .catch(e => {
          reject(e);
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
