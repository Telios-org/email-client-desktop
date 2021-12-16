const { ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const FileType = require('file-type');
const mime = require('mime-types');
const store = require('../Store');

module.exports = windowManager => {
  const saveMessage = payload => {
    const mainWindow = windowManager.getWindow('mainWindow');

    if (payload.type === 'Sent') {
      mainWindow.webContents.send('createContacts', payload);
    }

    mainWindow.webContents.send('IPC::saveMessageToDB', payload);

    return new Promise((resolve, reject) => {
      mainWindow.webContents.once('ipc-message', (e, channel, data) => {
        if (channel === 'ACCOUNT SERVICE::saveMessageToDBResponse') {
          const { sync = true } = payload;
          mainWindow.webContents.send('IPC::initMailbox', {
            fullSync: sync
          });
          resolve(data);
        }

        if (channel === 'ACCOUNT SERVICE::saveMessageToDBError') {
          reject(data);
        }
      });
    });
  };

  const updateEmail = payload => {
    const mainWindow = windowManager.getWindow('mainWindow');

    mainWindow.webContents.send('updateEmail', payload);

    return new Promise((resolve, reject) => {
      mainWindow.webContents.once('ipc-message', (e, channel, data) => {
        if (channel === 'updateEmailResponse') {
          resolve(data);
        }

        if (channel === 'updateEmailBError') {
          reject(data);
        }
      });
    });
  };

  const clearDraft = () => {
    store.setInitialDraft(null);
    store.setNewDraft(null);
    store.setDraftDirty(false);
  };

  ipcMain.handle('sendEmail', async (event, payload) => {
    const mainWindow = windowManager.getWindow('mainWindow');
    mainWindow.webContents.send('sendEmail', payload);

    return new Promise((resolve, reject) => {
      mainWindow.webContents.once('ipc-message', (e, channel, data) => {
        if (channel === 'sendEmailResponse') {
          clearDraft();
          resolve(data);
        }

        if (channel === 'sendEmailError') {
          clearDraft();
          reject(data);
        }
      });
    });
  });

  ipcMain.handle(
    'COMPOSER SERVICE::saveMessageToDB',
    async (event, payload) => {
      return saveMessage(payload);
    }
  );

  ipcMain.handle('SERVICE::uploadAttachments', async event => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        const options = {
          title: 'Select attachments for this email',
          buttonLabel: 'Attach',
          properties: ['openFile', 'multiSelections']
        };

        const fileNames = await dialog.showOpenDialogSync(options);

        // fileNames is an array that contains all the selected
        if (fileNames === undefined) {
          reject(new Error('No file selected.'));
        } else {
          const attachments = await Promise.all(
            fileNames.map(async filepath => {
              let content;
              let size;
              let contentType;
              let extension;
              let localPath;

              try {
                const stats = fs.statSync(filepath);
                size = stats.size;
              } catch (error) {
                reject(
                  new Error(`Could not calculate attachment size ${error}`)
                );
              }

              // If file is great than 25mb then don't send file as base64 encoded content
              if(size <= 25000000) {
                try {
                  content = await fs.readFileSync(filepath, {
                    encoding: 'base64'
                  });
                } catch (e) {
                  reject(e);
                }
              } else {
                localPath = filepath;
              }

              try {
                // Filetype uses the first bytes from the file to determine type
                const type = await FileType.fromFile(filepath);
                if (type !== undefined) {
                  contentType = type.mime;
                  extension = type.ext;
                } else {
                  // If first method fail it uses the file extension to determine
                  contentType = mime.lookup(filepath);
                  extension = mime.extension(contentType);
                }
              } catch (error) {
                reject(new Error(`Cannot get MIMETYPE ${error}`));
              }

              const filename = path.basename(filepath);
              return { filename, content, contentType, size, localPath }
            })
          );
          resolve(attachments);
        }
      });
    });
  });

  ipcMain.handle('saveFiles', async (event, attachments) => {
    const mainWindow = windowManager.getWindow('mainWindow');
    mainWindow.webContents.send('saveFiles', attachments);

    return new Promise((resolve, reject) => {
      mainWindow.webContents.once('ipc-message', (e, channel, data) => {
        if (channel === 'saveFilesResponse') {
          resolve(data);
        }

        if (channel === 'saveFilesError') {
          reject(data);
        }
      });
    });
  });

  ipcMain.on('RENDERER::updateComposerDraft', async (event, email) => {
    const initialDraft = store.getInitialDraft();

    const newVal = {
      to: email.to,
      cc: email.cc,
      bcc: email.bcc,
      subject: email.subject,
      text_body: email.bodyAsText,
      attachments: email.attachments
    };

    let oldVal;

    if (!initialDraft) {
      store.setInitialDraft(email);
    } else {
      oldVal = {
        to: initialDraft.to,
        cc: initialDraft.cc,
        bcc: initialDraft.bcc,
        subject: initialDraft.subject,
        text_body: initialDraft.bodyAsText,
        attachments: initialDraft.attachments
      };
    }

    if (initialDraft && JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      store.setDraftDirty(true);
      store.setNewDraft(email);
    }

    if (initialDraft && JSON.stringify(oldVal) === JSON.stringify(newVal)) {
      store.setDraftDirty(false);
    }
  });

  ipcMain.on('RENDERER::closeComposerWindow', async (event, opts) => {
    let action = null;
    let reload = null;

    if (opts) {
      action = opts.action;
      reload = opts.reloadDb !== undefined ? opts.reloadDb : true;
    }

    const mainWindow = windowManager.getWindow('mainWindow');
    const draft = store.getNewDraft();
    const isDirty = store.getDraftDirty();

    // console.log('RENDERER::closeComposerWindow', action, draft, isDirty);

    if (isDirty && !action) {
      windowManager
        .showMessageBox({ event, browserWindow: null, draft })
        .then(res => {
          if (res === 0 || res === 1) {
            clearDraft();
          }

          // Update draft
          if (res === 0) {
            saveMessage({ messages: [draft], type: 'Draft', sync: reload });
          }

          return true;
        })
        .catch(e => {
          console.error(e);
        });
    } else if (isDirty && action === 'save') {
      saveMessage({ messages: [draft], type: 'Draft', sync: reload });
    }

    clearDraft();

    mainWindow.webContents.send('COMPOSER_IPC::closeInlineComposer');
  });

  ipcMain.handle('createContacts', async (event, payload) => {
    const mainWindow = windowManager.getWindow('mainWindow');
    mainWindow.webContents.send('createContacts', payload);

    return new Promise((resolve, reject) => {
      mainWindow.webContents.once('ipc-message', (e, channel, data) => {
        if (channel === 'createContactsResponse') {
          resolve(data);
        }

        if (channel === 'createContactsError') {
          reject(data);
        }
      });
    });
  });

  ipcMain.handle('clearInMemDraft', event => {
    clearDraft();
  });

  ipcMain.handle('searchContact', async (event, payload) => {
    const mainWindow = windowManager.getWindow('mainWindow');
    mainWindow.webContents.send('searchContact', payload);

    return new Promise((resolve, reject) => {
      mainWindow.webContents.once('ipc-message', (e, channel, data) => {
        if (channel === 'searchContactResponse') {
          resolve(data);
        }

        if (channel === 'searchContactError') {
          reject(data);
        }
      });
    });
  });
};
