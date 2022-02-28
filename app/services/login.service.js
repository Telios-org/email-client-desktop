const { remote, ipcRenderer } = require('electron');
const fs = require('fs');
const channel = require('./main.channel');
const extractJSON = require('../utils/helpers/json');

const { app } = remote;

class LoginService {
  static async createAccount(payload) {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('LOGIN_SERVICE::createAccount', payload)
        .then(data => {
          return resolve(data);
        })
        .catch(err => {
          channel.send({ event: 'LOGIN_SERVICE::removeAccount', payload });
          // The error is string is serialized coming back from the IPC
          // to get the actual error messsage we will need to extract the JSON obj
          // and parse it.
          // const error = extractJSON(err.toString());
          return reject(err);
        });
    });
  }

  static initAccount(password, email) {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('LOGIN_SERVICE::initAccount', { password, email })
        .then(data => {
          console.log('LOGIN_SERVICE::initAccount', data)
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

  // checkMigrationStatus can utimately get deleted once all users have migrated
  static checkMigrationStatus(account) {
    const getDirectories = source =>
      fs
        .readdirSync(source, { withFileTypes: true })
        .some(file => file.name === 'recovery' || file.name === 'vault');

    return getDirectories(`${app.getPath('userData')}/Accounts/${account}/Drive/Files`);
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
