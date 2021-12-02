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

  ipcMain.handle('getAccount', async (e, payload) => {
    let account = payload;

    if (!account.password || !account.email) {
      account = store.getAccountSecrets();
    }

    const mainWindow = windowManager.getWindow('mainWindow');
    mainWindow.webContents.send('getAcct', account);

    return new Promise((resolve, reject) => {
      mainWindow.webContents.on('ipc-message', (e, channel, data) => {
        if (channel === 'getAcctResponse') {
          store.setAccountSecrets(account);
          resolve(data);
        }

        if (channel === 'getAcctError') {
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
