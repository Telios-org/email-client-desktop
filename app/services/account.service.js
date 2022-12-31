const { ipcRenderer, remote } = require('electron');
const EventEmitter = require('events');
const fs = require('fs');
const channel = require('./main.channel');
const MailService = require('./mail.service');
const ContactService = require('./contact.service');
const MessageIngressService = require('./messageIngress.service');

const { app } = remote;

class AccountService extends EventEmitter {
  constructor() {
    super();

    ipcRenderer.once('ACCOUNT_IPC::createAccount', async (evt, data) => {
      try {
        const account = await AccountService.createAccount(data);
        // Start incoming message listener
        MessageIngressService.initMessageListener();
        ipcRenderer.send('ACCOUNT_SERVICE::createAccountResponse', account);
        this.emit('ACCOUNT_SERVICE::accountData', {
          account,
          email: data.email,
          password: data.password
        });
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

    ipcRenderer.on('ACCOUNT_IPC::initAcct', (evt, data) => {
      AccountService.initAccount(data)
        .then(account => {
          MessageIngressService.initMessageListener();
          ipcRenderer.send('ACCOUNT_SERVICE::initAcctResponse', account);
          // Emitting the account data so it can be ingested by the Redux Store
          this.emit('ACCOUNT_SERVICE::accountData', {
            account,
            email: data.email,
            password: data.password
          });
          return 'done';
        })
        .catch(e => {
          ipcRenderer.send('ACCOUNT_SERVICE::initAcctError', e);
        });
    });

    ipcRenderer.once('authenticate', (evt, data) => {
      AccountService.authenticate(data)
        .then(account => {
          ipcRenderer.send('authResponse', account);
        })
        .catch(e => {
          ipcRenderer.send('authError', e);
        });
    });

    ipcRenderer.once('loadMbox', (evt, data) => {
      MailService.loadMailbox()
        .then(account => {
          ipcRenderer.send('loadMboxResponse', account);
        })
        .catch(e => {
          ipcRenderer.send('loadMboxError', e);
        });
    });

    ipcRenderer.on('sendEmail', (evt, data) => {
      MailService.send(data)
        .then(result => {
          ipcRenderer.send('sendEmailResponse', result);
        })
        .catch(e => {
          ipcRenderer.send('sendEmailError', e);
        });
    });

    ipcRenderer.on('IPC::saveMessageToDB', (evt, data) => {
      MailService.save(data)
        .then(() => {
          ipcRenderer.send('ACCOUNT SERVICE::saveMessageToDBResponse', null);
        })
        .catch(e => {
          ipcRenderer.send('ACCOUNT SERVICE::saveMessageToDBError', e);
        });
    });

    ipcRenderer.on('saveFiles', (evt, attachments) => {
      MailService.saveAttachmentsToDisk(attachments)
        .then(res => {
          ipcRenderer.send('saveFilesResponse', res);
        })
        .catch(e => {
          ipcRenderer.send('saveFilesError', e);
        });
    });

    // Why is a contact event being handle in the Account Service file?
    ipcRenderer.on('createContacts', (evt, data) => {
      ContactService.createContacts(data)
        .then(() => {
          ipcRenderer.send('createContactsResponse', null);
        })
        .catch(e => {
          ipcRenderer.send('createContactsError', e);
        });
    });

    // Why is a contact event being handle in the Account Service file?
    ipcRenderer.on('searchContact', (evt, searchQuery) => {
      ContactService.searchContact(searchQuery)
        .then(contacts => {
          ipcRenderer.send('searchContactResponse', contacts);
        })
        .catch(e => {
          ipcRenderer.send('searchContactError', e);
        });
    });

    ipcRenderer.on('exitProcess', () => {
      channel.send({ event: 'account:exit', payload: {} });
    });

    channel.on('syncMail', () => {
      ipcRenderer.send('syncMail');
    });

    channel.on('account:login:status', cb => {
      const { data } = cb;
      ipcRenderer.invoke('ACCOUNT_SERVICE::account:login:status', data);
    });

    // Not sure if the below works anymore, I think it should be acount:refreshToken or maybe acount:refreshToke:callback
    // something that needs verifying and tested but there's also a chance that the code below is obsolete.
    channel.on('ACCOUNT_WORKER::refreshToken', m => {
      const { data, error } = m;
      this.emit('ACCOUNT_SERVICE::refreshToken', data.token);
    });
  }

  static createAccount(payload) {
    channel.send({ event: 'account:create', payload });

    return new Promise((resolve, reject) => {
      channel.once('account:create:callback', async m => {
        const { data, error } = m;

        if (error) return reject(error);

        const {
          uid,
          signedAcct,
          secretBoxKeypair,
          signingKeypair,
          mnemonic,
          deviceId,
          sig,
          accountId
        } = data;

        try {
          const registerPayload = {
            account_key: signedAcct.account_key,
            addr: payload.email
          };

          await MailService.registerMailbox(registerPayload);
          await MailService.saveMailbox({ address: payload.email });

          resolve({
            accountId,
            uid,
            secretBoxPubKey: secretBoxKeypair.publicKey,
            secretBoxPrivKey: secretBoxKeypair.privateKey,
            secretBoxSeedKey: secretBoxKeypair.seedKey,
            mnemonic,
            deviceSigningPubKey: signingKeypair.publicKey,
            deviceSigningPrivKey: signingKeypair.privateKey,
            deviceId,
            serverSig: sig,
            displayName: null,
            avatar: null
          });
        } catch (err) {
          console.log(err);
          reject(err);
        }
      });
    });
  }

  static initAccount(params) {
    const { email, password, mnemonic } = params;

    const payload = {
      email
    };

    if (password) {
      payload.password = password;
    } else if (mnemonic) {
      payload.passphrase = mnemonic;
    }

    channel.send({
      event: 'account:login',
      payload
    });

    return new Promise((resolve, reject) => {
      channel.once('account:login:callback', m => {
        const { error, data } = m;
        const _data = { ...data };

        if (error) return reject(error);

        return resolve(_data);
      });
    });
  }

  static async updateAccount(payload) {
    channel.send({
      event: 'account:update',
      payload
    });

    return new Promise((resolve, reject) => {
      channel.once('account:update:callback', m => {
        const { error, data } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static resetAccountPassword(params) {
    const { passphrase, email, newPass } = params;

    channel.send({
      event: 'account:resetPassword',
      payload: { passphrase, email, newPass }
    });

    return new Promise((resolve, reject) => {
      channel.once('account:resetPassword:callback', m => {
        const { error, data } = m;
        const _data = { ...data };

        if (error) return reject(error);

        return resolve(_data);
      });
    });
  }

  static updateAccountPassword(payload) {
    const { email, newPass } = payload;

    channel.send({
      event: 'account:updatePassword',
      payload: { email, newPass }
    });

    return new Promise((resolve, reject) => {
      channel.once('account:updatePassword:callback', m => {
        const { error, data } = m;
        const _data = { ...data };

        if (error) return reject(error);

        return resolve(_data);
      });
    });
  }

  static recoverAccount(params) {
    const { email, recoveryEmail } = params;
    channel.send({
      event: 'account:recover',
      payload: {
        email,
        recoveryEmail
      }
    });

    return new Promise((resolve, reject) => {
      channel.once('account:recover:callback', m => {
        const { error, data } = m;
        const _data = { ...data };

        if (error) return reject(error);

        return resolve(_data);
      });
    });
  }

  static async retrieveStats() {
    channel.send({
      event: 'account:retrieveStats'
    });

    return new Promise((resolve, reject) => {
      channel.once('account:retrieveStats:callback', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static refreshToken() {
    channel.send({
      event: 'account:refreshToken'
    });

    return new Promise((resolve, reject) => {
      channel.once('account:refreshToken:callback', m => {
        const { error, data } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async uploadAvatar() {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('ACCOUNT_SERVICE::uploadAvatar')
        .then(data => {
          return resolve(data);
        })
        .catch(e => {
          reject(e);
        });
    });
  }

  static async getSyncInfo(code) {
    channel.send({
      event: 'account:getSyncInfo',
      payload: { code }
    });

    return new Promise((resolve, reject) => {
      channel.once('account:getSyncInfo:callback', m => {
        const { data, error } = m;

        if (error) return reject(error);

        if (!data.drive_key) return reject('DriveKey missing');
        if (!data.email) return reject('Email missing');

        return resolve({ driveKey: data.drive_key, email: data.email });
      });
    });
  }

  static async createSyncCode() {
    channel.send({
      event: 'account:createSyncCode'
    });

    return new Promise((resolve, reject) => {
      channel.once('account:createSyncCode:callback', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static updateAccountPlan(payload) {
    const { accountId, plan } = payload;

    channel.send({
      event: 'account:updatePlan',
      payload: { accountId, plan }
    });

    return new Promise((resolve, reject) => {
      channel.once('account:updatePlan:callback', m => {
        const { error, data } = m;
        const _data = { ...data };

        if (error) return reject(error);

        return resolve(_data);
      });
    });
  }

  static logout(returnToLogin = true, killChannel = true) {
    channel.send({ event: 'account:logout', payload: { kill: killChannel } });

    return new Promise((resolve, reject) => {
      channel.once('account:logout:callback', m => {
        const { error } = m;

        if (error) return reject(error);

        if (returnToLogin) {
          ipcRenderer.send('logout');
        }
        return resolve('done');
      });
    });
  }
}

module.exports = AccountService;
