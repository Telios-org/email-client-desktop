/* eslint-disable no-await-in-loop */
const store = require('../Store');
const path = require('path');
const removeMd = require('remove-markdown');
const { request } = require('http');

class MesssageIngress {
  constructor() {
    this.messagesMap = {};
    this.drive = null;
    this.mailbox = null;
    this.errors = [];

    this.BATCH_SIZE = 5;
  }

  async initDrive() {
    if (!this.drive) {
      this.drive = store.getDrive();
    }

    // If worker is running before drive is ready then call .ready()
    if (!this.drive.discoveryKey) {
      await this.drive.ready();
    }

    this.drive.on('fetch-error', async e => {
      process.send({
        event: 'fetchError',
        data: {
          message: e.message,
          stack: e.stack
        }
      });
    });
  }

  /**
   * Batches an array of file metadata and makes parallel requests per batch size. This happens when
   * a user needs to sync a large amount of messages. Requesting them synchronously would take a very long time,
   * and fetching all of them at once in parallel could be too large.
   */
  async fetchBatch(files, account) {
    this.mailbox = store.getMailbox();
    const keyPairs = store.getKeypairs();

    files = files.map(f => {
      if (account) {
        let publicKey;
        let privateKey;

        if (account.secretBoxPubKey === f.account_key) {
          publicKey = account.secretBoxPubKey;
          privateKey = account.secretBoxPrivKey;
        } else {
          publicKey = keyPairs[f.account_key] && keyPairs[f.account_key].publicKey ? keyPairs[f.account_key].publicKey : null;
          privateKey = keyPairs[f.account_key] && keyPairs[f.account_key].privateKey ? keyPairs[f.account_key].privateKey : null;
        }

        const fileMeta = this.mailbox._decryptMailMeta(
          f,
          privateKey,
          publicKey
        );

        f = { _id: f._id, ...fileMeta };
      }

      return f;
    });

    await this.drive.fetchFileBatch(files, (stream, file) => {
      return new Promise((resolve, reject) => {
        let content = '';

        stream.on('data', chunk => {
          content += chunk.toString('utf-8');
        });

        stream.on('error', err => {
          if (!file.failed) {
            file.failed = 1;
          } else {
            file.failed += 1;
          }

          process.send({
            event: 'fetchError',
            data: {
              file,
              message: err.message,
              stack: err.stack
            }
          });

          resolve();
        });

        stream.on('end', () => {
          content = JSON.parse(content);

          process.send({
            event: 'fileFetched',
            data: {
              _id: file._id,
              email: {
                key: file.key,
                header: file.header,
                content
              },
            }
          });

          resolve();
        });
      })
    });
  }

  async fetchFile(discoveryKey, fileMeta) {
    try {
      let keyPair;

      while (!keyPair) {
        keyPair = this.drive._workerKeyPairs.getKeyPair();
      }

      const stream = await this.drive.fetchFileByDriveHash(discoveryKey, fileMeta.hash, { key: fileMeta.key, header: fileMeta.header, keyPair });

      let content = '';

      stream.on('data', chunk => {
        content += chunk.toString('utf-8');
      });

      stream.on('error', err => {

        if (!fileMeta.failed) {
          fileMeta.failed = 1;
        } else {
          fileMeta.failed += 1;
        }

        process.send({
          event: 'fetchError',
          data: {
            file: fileMeta,
            message: err.message,
            stack: err.stack
          }
        });
      });

      stream.on('end', () => {
        content = JSON.parse(content);

        // Send OS notification
        this.notify({
          title: content.subject,
          message: content.text_body,
          metadata: {
            type: 'email',
            hash: fileMeta.hash
          }
        });

        process.send({
          event: 'fileFetched',
          data: {
            _id: fileMeta._id,
            email: {
              key: fileMeta.key,
              header: fileMeta.header,
              content
            },
          }
        });
      });
    } catch (err) {
      process.send({
        event: 'fetchError',
        data: {
          file: fileMeta,
          message: err.message,
          stack: err.stack
        }
      });
    }
  }

  notify({ title, message, metadata }) {
    let bodyAsText = removeMd(message);
    bodyAsText = bodyAsText.replace(/\[(.*?)\]/g, '');
    bodyAsText = bodyAsText.replace(/(?:\u00a0|\u200C)/g, '');
    const selection = bodyAsText.split(' ').slice(0, 20);

    if (selection[selection.length - 1] !== '...') {
      selection.push('...');
    }

    process.send({
      event: 'notify',
      data: {
        icon: path.join(__dirname, '../img/telios_notify_icon.png'),
        title,
        message: selection.join(' '),
        sound: true, // Only Notification Center or Windows Toasters
        metadata
      }
    });
  };
}

const messageIngressWorker = new MesssageIngress();

module.exports = async (userDataPath) => {
  process.on('message', async data => {
    const { event, payload } = data;

    // This fires after mailbox has finshed initializing from inside mailbox.service
    if (event === 'initMessageListener') {
      await messageIngressWorker.initDrive();
    }

    if (event === 'MESSAGE_INGRESS_SERVICE::newMessageBatch') {
      const { meta, account } = payload;
      messageIngressWorker.fetchBatch(meta, account);
    }

    if (event === 'newMessage') {
      const { meta } = payload;
      await messageIngressWorker.fetchFile(meta.discovery_key, meta);
    }

    if (event === 'retryMessageBatch') {
      const { batch } = payload;
      messageIngressWorker.fetchBatch(batch);
    }
  });
}
