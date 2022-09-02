const { ipcMain, dialog } = require('electron');
const fs = require('fs');
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
          resolve({ error: { message: data.message } });
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

  ipcMain.handle('ACCOUNT_SERVICE::getSyncInfo', async (e, payload) => {
    const account = store.getAccountApi();
    console.log(account);
    const { code } = payload;
    console.log(code);
    const {
      drive_key: driveKey = undefined,
      peer_pub_key: peerPubKey = undefined,
      email = undefined
    } = await account.getSyncInfo(code);
    console.log('CODE::', code, 'RESULTS::', { driveKey, peerPubKey, email });
    return { driveKey, peerPubKey, email };

    // const loginWindow = windowManager.getWindow('loginWindow');
    // loginWindow.webContents.send('ACCOUNT_IPC::getSyncInfo', results);

    // return new Promise((resolve, reject) => {
    //   loginWindow.webContents.on('ipc-message', (e, channel, data) => {
    //     if (channel === 'ACCOUNT_SERVICE::getSyncInfoResponse') {
    //       resolve(data);
    //     }

    //     if (channel === 'ACCOUNT_SERVICE::getSyncInfoResponseError') {
    //       reject(data);
    //     }
    //   });
    // });
  });

  ipcMain.handle('ACCOUNT_SERVICE::createSyncCode', async (e, payload) => {
    const account = store.getAccountApi();
    const { code = undefined } = await account.createSyncCode();
    console.log('RESULTS::', { code });
    return { code };
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

  ipcMain.handle('ACCOUNT_SERVICE::uploadAvatar', async event => {
    const options = {
      title: 'Select your profile picture',
      buttonLabel: 'Select',
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg'] }],
      properties: ['openFile']
    };

    const { canceled, filePaths } = await dialog.showOpenDialog(options);

    if (!canceled) {
      const data = await fs.readFileSync(filePaths[0], {
        encoding: 'base64'
      });
      return { canceled, data };
    }

    return { canceled, data: '' };
  });
};
