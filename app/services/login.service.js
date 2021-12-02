const { remote, ipcRenderer } = require('electron');
const fs = require('fs');
const worker = require('../workers/main.worker');
const { extractJSON } = require('../utils/string.util');

const { app } = remote;

class LoginService {
  static async initSession(opts, privKey, pubKey) {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('initSession', opts, privKey, pubKey)
        .then(() => {
          return resolve();
        })
        .catch(err => {
          return reject(err);
        });
    });
  }

  static async createAccount(payload) {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('LOGIN_SERVICE::createAccount', payload)
        .then(data => {
          return resolve(data);
        })
        .catch(err => {
          worker.send({ event: 'LOGIN_SERVICE::removeAccount', payload });
          // The error is string is serialized coming back from the IPC
          // to get the actual error messsage we will need to extract the JSON obj
          // and parse it.
          const error = extractJSON(err.toString());
          return reject(error);
        });
    });
  }

  static getAccount(password, email) {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('getAccount', { password, email })
        .then(data => {
          return resolve(data);
        })
        .catch(err => {
          return reject(err);
        });
    });
  }

  static loadMailbox() {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('loadMailbox')
        .then(data => {
          return resolve(data);
        })
        .catch(err => {
          return reject(err);
        });
    });
  }

  static getAccounts() {
    const getDirectories = source =>
      fs
        .readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    return getDirectories(`${app.getPath('userData')}/Accounts`);
  }

  // Perform account initialization
  static async registerAccount(acct) {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('registerAccount', acct)
        .then(account => {
          return resolve(account);
        })
        .catch(err => {
          return reject(err);
        });
    });
  }

  // Perform account logout on the main process
  static async accountLogout(token, payload) {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('accountLogout', token, payload)
        .then(res => {
          return resolve(res);
        })
        .catch(err => {
          return reject(err);
        });
    });
  }
}

module.exports = LoginService;
