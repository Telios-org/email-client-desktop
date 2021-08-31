const { app, ipcMain } = require('electron');
const Telios = require('@telios/telios-sdk');
const store = require('../Store');

module.exports = windowManager => {
  const { Hypercore } = Telios;

  ipcMain.handle('initSession', async (e, opts, privKey, pubKey) => {
    let account = opts;

    if (!account.password || !account.email) {
      const { password, email } = store.getAccountSecrets();
      account = { password, email };
    }

    const mainWindow = windowManager.getWindow('mainWindow');
    mainWindow.webContents.send('initSession', { opts, privKey, pubKey });

    return new Promise((resolve, reject) => {
      mainWindow.webContents.on('ipc-message', (e, channel, data) => {
        if (channel === 'initSessionResponse') {
          resolve(data);
        }
      });
    });
  });
};
