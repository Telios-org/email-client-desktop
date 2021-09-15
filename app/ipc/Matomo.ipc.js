const { ipcMain } = require('electron');
const store = require('../Store');
const Matomo = require('../utils/Matomo');

module.exports = windowManager => {
  ipcMain.handle('MATOMO::init', async (event, data) => {
    const mainWindow = windowManager.getWindow('mainWindow');
    store.matomo = new Matomo(data.account, mainWindow.webContents.userAgent);

    let params = {
      e_c: 'Account',
      e_a: data.isNew ? 'Registered' : 'Signin',
      new_visit: 1
    }

    store.matomo.event(params);
    store.matomo.heartBeat(30000);
  });

  ipcMain.handle('MATOMO::event', async (event, data) => {
    store.matomo.event(data);
  });
}