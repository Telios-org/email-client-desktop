const { ipcMain, nativeTheme, dialog, BrowserView } = require('electron');
const path = require('path');
const { emailTransform, assembleFromDataSet } = require('../utils/draft.utils');
const store = require('../Store');

module.exports = (windowManager, createMainWindow, createLoginWindow) => {
  const saveDraft = payload => {
    // Should this method be moved to the Composer IPC?
    const mainWindow = windowManager.getWindow('mainWindow');

    mainWindow.webContents.send('IPC::saveMessageToDB', payload);

    return new Promise((resolve, reject) => {
      mainWindow.webContents.on('ipc-message', (e, channel, data) => {
        if (channel === 'ACCOUNT SERVICE::saveMessageToDBResponse') {
          store.setNewDraft(null);
          store.setDraftDirty(false);
          // mainWindow.webContents.send('initMailbox', { fullSync: false });
          resolve(data);
        }

        if (channel === 'ACCOUNT SERVICE::saveMessageToDBError') {
          store.setNewDraft(null);
          store.setDraftDirty(false);
          reject(data);
        }
      });
    });
  };

  ipcMain.on('logout', async () => {
    const mainWindow = windowManager.getWindow('mainWindow');
    await createLoginWindow();
    mainWindow.systemClose = true;
    windowManager.updateWindow('mainWindow', mainWindow);
    await mainWindow.close();
    ipcMain.removeAllListeners('showMainWindow');
    nativeTheme.removeAllListeners('updated');

    const mainWin = await createMainWindow();

    ipcMain.on('showMainWindow', () => {
      const loginWindow = windowManager.getWindow('loginWindow');
      mainWin.webContents.send('IPC::initMailbox', { fullSync: true });
      mainWin.show();
      loginWindow.systemClose = true;
      windowManager.updateWindow('loginWindow', loginWindow);
      loginWindow.close();

      mainWin.focus();
    });
  });

  ipcMain.on('restartMainWindow', async () => {
    const mainWindow = windowManager.getWindow('mainWindow');
    mainWindow.systemClose = true;
    windowManager.updateWindow('mainWindow', mainWindow);
    await mainWindow.close();
    ipcMain.removeAllListeners('showMainWindow');
    nativeTheme.removeAllListeners('updated');

    const mainWin = await createMainWindow();

    ipcMain.on('showMainWindow', () => {
      const loginWindow = windowManager.getWindow('loginWindow');
      mainWin.webContents.send('IPC::initMailbox', { fullSync: true });
      mainWin.show();
      loginWindow.systemClose = true;
      windowManager.updateWindow('loginWindow', loginWindow);
      loginWindow.close();

      mainWin.focus();
    });
  });

  ipcMain.on('resizeAppWindow', async (event, payload) => {
    const mainWindow = windowManager.getWindow('mainWindow');

    mainWindow.setSize(payload.width, payload.height);
    mainWindow.resizable = payload.resizable;
    mainWindow.center();
  });

  ipcMain.on('showMainWindow', () => {
    const mainWindow = windowManager.getWindow('mainWindow');
    const loginWindow = windowManager.getWindow('loginWindow');

    mainWindow.webContents.send('IPC::initMailbox', { fullSync: true });
    mainWindow.show();
    loginWindow.systemClose = true;
    windowManager.updateWindow('loginWindow', loginWindow);
    loginWindow.close();

    mainWindow.focus();
  });

  ipcMain.on('syncMail', () => {
    const mainWindow = windowManager.getWindow('mainWindow');
    mainWindow.webContents.send('IPC::initMailbox', { fullSync: true });
  });

  ipcMain.handle('RENDERER::showComposerWindow', async (event, content) => {
    const composerWinCnt = windowManager.windows.composers.length;
    const windowID = `composerWindow${composerWinCnt}`;

    const win = await windowManager.create(windowID, {
      url:
        process.env.NODE_ENV === 'development' ||
        process.env.E2E_BUILD === 'true'
          ? `file://${path.join(__dirname, '..')}/composer_window/index.html`
          : `file://${__dirname}/composer_window/index.html`,
      window: {
        show: false,
        width: 720,
        height: 600,
        resizable: true,
        frame: false,
        titleBarStyle: 'hiddenInset',
        webPreferences:
          process.env.NODE_ENV === 'development' ||
          process.env.E2E_BUILD === 'true'
            ? {
                nodeIntegration: true
              }
            : {
                preload: path.join(__dirname, 'dist/composer.renderer.prod.js')
              }
      },
      clearWindowOnClose: true,
      hideWhenReady: false,
      draft: null
    });

    // Need to fetch the latest draft in the inline composer.
    const draftEmail = store.getNewDraft() || store.getInitialDraft();

    let composerContent = null;

    if (draftEmail) {
      composerContent = {
        ...content,
        message: emailTransform(draftEmail, 'popOut', false)
      };
    } else {
      composerContent = { ...content };
    }

    win.on('close', event => {
      const draft = store.getNewDraft();
      const isDirty = store.getDraftDirty();

      if (isDirty && draft) {
        windowManager
          .showMessageBox({ event, browserWindow: win, draft })
          .then(res => {
            if (res === 0 || res === 1) {
              store.setInitialDraft(null);
              store.setNewDraft(null);
              store.setDraftDirty(false);
            }

            // Update draft
            if (res === 0) {
              saveDraft({ messages: [draft], type: 'Draft', sync: true });
            }

            return true;
          })
          .catch(e => {
            console.error(e);
          });
      }

      store.setInitialDraft(null);
      store.setNewDraft(null);
      store.setDraftDirty(false);
    });

    // nativeTheme.on('updated', function theThemeHasChanged() {
    //   win.webContents.send('dark-mode', nativeTheme.shouldUseDarkColors);
    // });

    win.once('ready-to-show', () => {
      win.webContents.send(
        'WINDOW_IPC::contentReady',
        composerContent,
        windowID
      );
    });

    return true;
  });

  // Goal of this handler is to ingest the email, save it as a draft on the ipc Store
  // then signal to the Composer that it is ready to go
  ipcMain.handle(
    'RENDERER::ingestDraftForInlineComposer',
    async (event, content) => {
      const { message, mailbox, namespaces, aliases, editorAction } = content;

      const newDraft = emailTransform(message, editorAction, true);

      const data = assembleFromDataSet(mailbox, namespaces, aliases);

      let filteredArray = [];
      if (message?.toJSON) {
        filteredArray = data.filter(value =>
          JSON.parse(message.toJSON)
            .map(m => m.address.replace(/[-+#]/gm, ''))
            .includes(value.address.replace(/[-+#]/gm, ''))
        );
      }

      if (filteredArray.length === 1) {
        newDraft.from = filteredArray;
      } else {
        newDraft.from = data[0]; // which should be the main account
      }
      // console.log('WINDOWSIPC::DRAFT', newDraft);

      store.setInitialDraft(newDraft);
      store.setNewDraft(null);
      store.setDraftDirty(false);

      const mainWindow = windowManager.getWindow('mainWindow');

      const newContent = {
        mailbox,
        namespaces,
        aliases,
        editorAction,
        message: {
          ...newDraft
        }
      }; // Newly transformed payload.

      // Email in content should already the format we are looking for with the toJSON, fromJSON, ...
      // We are sending a message to the Composer Component in the Main Window
      mainWindow.webContents.send(
        'WINDOW_IPC::contentReady',
        newContent,
        'mainWindow'
      );

      return true;
    }
  );
};
