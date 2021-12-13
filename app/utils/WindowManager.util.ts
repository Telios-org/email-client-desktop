import { ipcMain, BrowserWindow, dialog, shell } from 'electron';

import MenuBuilder from '../main_window/menu';

const installer = require('electron-devtools-installer');
const Store = require('electron-store');

export default class WindowManager {
  constructor(app, AppUpdater) {
    this.app = app;
    this.AppUpdater = AppUpdater;
    this.windows = {
      composers: []
    };
  }

  async create(name, opts) {
    const { app, AppUpdater } = this;

    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      await WindowManager.installExtensions();
    }

    if (name.indexOf('login') > -1) {
      const store = new Store();

      let pids = store.get('pids');

      if(typeof pids !== 'object') {
        pids = [];
      }

      pids = pids.filter(pid => {
        try {
        process.kill(pid);
        } catch(e) {}

        return false;
      })

      store.set('pids', pids);
    }

    const win = new BrowserWindow(opts.window);

    if (name.indexOf('composerWindow') > -1) {
      this.windows.composers.push(name);
    }

    win.setMenuBarVisibility(false);

    win.loadURL(opts.url);

    win.once('ready-to-show', () => {
      if (!win) {
        throw new Error('Window is not defined');
      }

      if (process.env.START_MINIMIZED) {
        win.minimize();
      }

      if (!process.env.START_MINIMIZED && !opts.hideWhenReady) {
        setTimeout(() => {
          win.show();
          win.focus();
        }, 300);
      }
    });

    win.on('close', () => {
      if (
        (name === 'mainWindow' &&
          win.isVisible() &&
          !this.windows.mainWindow.systemClose) ||
        (name === 'loginWindow' &&
          win.isVisible() &&
          !this.windows.mainWindow.isVisible())
      ) {
        win.webContents.send('exitProcess');
        app.quit();
      }

      // Failed login attempt, exit process and restart main window
      if(name === 'mainWindow' && win.systemClose) {
        win.webContents.send('exitProcess');
      }
    });

    win.on('maximize', function() {
      win.webContents.send('maximize');
    });

    win.on('unmaximize', function() {
      win.webContents.send('unmaximize');
    });

    win.webContents.on('new-window', function(e, url) {
      e.preventDefault();
      shell.openExternal(url);
    });

    win.webContents.on('will-navigate', function(e, url) {
      e.preventDefault();
      shell.openExternal(url);
    });

    try {
      const menuBuilder = new MenuBuilder(win);
      menuBuilder.buildMenu();
    } catch (err) {
      console.log(err);
    }

    if (name.indexOf('login') > -1 && AppUpdater) {
      // eslint-disable-next-line
      new AppUpdater();
    }

    this.windows[name] = win;

    return win;
  }

  getWindow(name) {
    return this.windows[name];
  }

  updateWindow(name, win) {
    this.windows[name] = win;
  }

  static newIPCEvent(channel, func) {
    ipcMain.on(channel, func);
  }

  static async installExtensions() {
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

    return Promise.all(
      extensions.map(name => installer.default(installer[name], forceDownload))
    ).catch(console.log);
  }

  showMessageBox(opts) {
    return new Promise((resolve, reject) => {
      const mainWin = this.getWindow('mainWindow');
      const response = dialog.showMessageBoxSync(
        opts.browserWindow || mainWin,
        {
          type: 'warning',
          noLink: true,
          buttons: ['Save', "Don't save", 'Cancel'],
          defaultId: 0,
          cancelId: 2,
          title: 'Save this message as a draft?',
          message:
            'This message has unsaved changes that can be saved and edited later.'
        }
      );

      if (response === 2) {
        opts.event.preventDefault();
      }

      resolve(response);
    });
  }
}
