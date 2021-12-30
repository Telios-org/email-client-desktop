const { ipcMain } = require('electron');
const store = require('../Store');

module.exports = windowManager => {
  ipcMain.handle('LOGIN_SERVICE::createAccount', async (event, payload) => {
    const mainWindow = windowManager.getWindow('mainWindow');
    mainWindow.webContents.send('ACCOUNT_IPC::createAccount', payload);

    return new Promise((resolve, reject) => {
      mainWindow.webContents.on('ipc-message', (e, channel, data) => {
        if (channel === 'ACCOUNT_SERVICE::createAccountResponse') {
          store.setAccountSecrets({
            password: payload.password,
            email: payload.email
          });
          resolve(data);
        }
        if (channel === 'ACCOUNT_SERVICE::createAccountError') {
          reject(JSON.stringify(data.error));
        }
      });
    });
  });

  ipcMain.handle('LOGIN_SERVICE::initAccount', async (e, payload) => {
    const account = payload;

    const mainWindow = windowManager.getWindow('mainWindow');
    mainWindow.webContents.send('ACCOUNT_IPC::initAcct', account);

    return new Promise((resolve, reject) => {
      mainWindow.webContents.on('ipc-message', (e, channel, data) => {
        if (channel === 'ACCOUNT_SERVICE::initAcctResponse') {
          store.setAccountSecrets(account);
          resolve(data);
        }

        if (channel === 'ACCOUNT_SERVICE::initAcctError') {
          reject(data);
        }
      });
    });
  });

  ipcMain.handle('ACCOUNT_SERVICE::getAccount', async (e, payload) => {
    const account = store.getAccount();
    const mainWindow = windowManager.getWindow('mainWindow');
    mainWindow.webContents.send('ACCOUNT_IPC::getAccount', account);

    return new Promise((resolve, reject) => {
      mainWindow.webContents.on('ipc-message', (e, channel, data) => {
        if (channel === 'ACCOUNT_SERVICE::getAccountResponse') {
          resolve(data);
        }

        if (channel === 'ACCOUNT_SERVICE::getAccountResponseError') {
          reject(data);
        }
      });
    });
  });

  ipcMain.handle('loadMailbox', async e => {
    const mainWindow = windowManager.getWindow('mainWindow');
    mainWindow.webContents.send('loadMbox');

    return new Promise((resolve, reject) => {
      mainWindow.webContents.on('ipc-message', (e, channel, data) => {
        if (channel === 'loadMboxResponse') {
          resolve(data);
        }

        if (channel === 'loadMboxError') {
          reject(data);
        }
      });
    });
  });
};
