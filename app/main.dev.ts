/* eslint-disable no-underscore-dangle */
/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import fs from 'fs';
import path from 'path';
import { app, nativeTheme } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

const Store = require('electron-store');

const store = new Store();

export default class AppUpdater {
  constructor() {
    if (process.env.NODE_ENV === 'production') {
      log.transports.file.level = 'info';
      autoUpdater.channel = 'latest';
      autoUpdater.logger = log;
      autoUpdater.allowDowngrade = true;
      autoUpdater.checkForUpdatesAndNotify();
    }
  }
}

import WindowManager from './utils/WindowManager.util'; // eslint-disable-line
const windowManager = new WindowManager(app, AppUpdater);

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  console.log('ELECTRON DEBUG - ON');
  require('electron-debug')();
}

// Turning that off for now
// if (process.env.NODE_ENV === 'development') {
//   try {
//     // console.log('ENV VARS', process.env);
//     console.log('ELECTRON RELOADER - ON');
//     require('electron-reloader')(module, {
//       debug: true,
//       watchRenderer: false
//     });
//   } catch (_) {
//     console.log('Error');
//   }
// }

const createMainWindow = async () => {
  const mainWindow = await windowManager.create('mainWindow', {
    url: `file://${__dirname}/main_window/app.html?env=${process.env.NODE_ENV}#/mail`,
    window: {
      show: false,
      width: 1240,
      height: 735,
      minWidth: 1150,
      minHeight: 650,
      resizable: true,
      frame: false,
      backgroundColor: '#FFF',
      titleBarStyle: 'hiddenInset',
      webPreferences:
        process.env.NODE_ENV === 'development' ||
        process.env.E2E_BUILD === 'true'
          ? {
              nodeIntegration: true
            }
          : {
              preload: path.join(__dirname, 'dist/main.renderer.prod.js')
            }
    },
    clearWindowOnClose: true,
    hideWhenReady: true
  });

  nativeTheme.on('updated', function theThemeHasChanged() {
    mainWindow.webContents.send('dark-mode', nativeTheme.shouldUseDarkColors);
  });

  return mainWindow;
};

const createLoginWindow = async () => {
  const loginWindow = await windowManager.create('loginWindow', {
    url: `file://${__dirname}/login_window/index.html?env=${process.env.NODE_ENV}`,
    window: {
      show: false,
      width: 400,
      height: 575,
      resizable: false, // Disable resizing of the window
      backgroundColor: '#FFF',
      titleBarStyle: 'hiddenInset',
      webPreferences:
        process.env.NODE_ENV === 'development' ||
        process.env.E2E_BUILD === 'true'
          ? {
              nodeIntegration: true
            }
          : {
              preload: path.join(__dirname, 'dist/login.renderer.prod.js')
            }
    },
    clearWindowOnClose: false,
    hideWhenReady: false
  });

  nativeTheme.on('updated', function theThemeHasChanged() {
    loginWindow.webContents.send('dark-mode', nativeTheme.shouldUseDarkColors);
  });

  return loginWindow;
};

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', e => {
  process.exit(0);
});

app.on('ready', async () => {
  if (!fs.existsSync(`${app.getPath('userData')}/Accounts`)) {
    fs.mkdirSync(`${app.getPath('userData')}/Accounts`);
  }

  const mainWindow = await createMainWindow();
  await createLoginWindow();

  app.on('window-all-closed', app.quit);
  app.on('before-quit', () => {
    mainWindow.removeAllListeners('close');
    mainWindow.close();
  });

  require('./ipc/Account.ipc')(windowManager); // eslint-disable-line
  require('./ipc/Composer.ipc')(windowManager); // eslint-disable-line
  require('./ipc/Notifier.ipc')(windowManager); // eslint-disable-line
  require('./ipc/Matomo.ipc')(windowManager); // eslint-disable-line
  require('./ipc/Window.ipc')(
    windowManager,
    createMainWindow,
    createLoginWindow
  );
});

app.on('activate', async () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (windowManager.getWindow('mainWindow') === null) await createMainWindow();
  if (windowManager.getWindow('loginWindow') === null)
    await createLoginWindow();
});
