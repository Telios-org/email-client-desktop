const fs = require('fs');
const Sequelize = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const SDK = require('@telios/client-sdk');
const { Mailbox } = require('../models/mailbox.model');
const { Folder } = require('../models/folder.model');
const { Email } = require('../models/email.model');
const { File } = require('../models/file.model');
const fileUtil = require('../utils/file.util');
const store = require('../Store');
const pkg = require('../package.json');
const envAPI = require('../env_api.json');

const { Op } = Sequelize;
let drive = store.getDrive();

module.exports = env => {
  process.on('message', async data => {
    const { event, payload } = data;

    if (event === 'loadMailbox') {
      const account = store.getAccount();
      const {
        secretBoxPubKey,
        devicePeerPubKey,
        deviceSigningPubKey,
        deviceSigningPrivKey,
        serverSig,
        deviceId
      } = account;

      const mailbox = new SDK.Mailbox({
        provider: env === 'production' ? pkg.api.prod : envAPI.dev,
        auth: {
          claims: {
            account_key: secretBoxPubKey,
            device_signing_key: deviceSigningPubKey,
            device_id: deviceId
          },
          device_signing_priv_key: deviceSigningPrivKey,
          sig: serverSig
        }
      });

      store.setMailbox(mailbox);
      process.send({ event: 'loadMailbox', data: mailbox });
    }

    if (event === 'registerMailbox') {
      const mailbox = store.getMailbox();
      await mailbox.registerMailbox(payload);
      process.send({ event: 'registerMailbox', data: payload });
    }

    if (event === 'getNewMailMeta') {
      try {
        const account = store.getAccount();
        const mailbox = store.getMailbox();

        let meta = {};

        try {
          meta = await mailbox.getNewMailMeta(
            account.secretBoxPrivKey,
            account.secretBoxPubKey
          );
        } catch (e) {
          process.send({
            event: 'getNewMailMeta',
            error: {
              name: e.name,
              message: e.message,
              stacktrace: e.stack
            }
          });
        }

        process.send({ event: 'getNewMailMeta', data: { meta, account } });
      } catch (e) {
        process.send({
          event: 'getNewMailMeta',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'markArrayAsSynced') {
      try {
        const mailbox = store.getMailbox();
        await mailbox.markAsSynced(payload.msgArray);
        process.send({ event: 'markArrayAsSynced', data: payload.msgArray });
      } catch (e) {
        process.send({
          event: 'markArrayAsSynced',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'getMailboxes') {
      try {
        const mailboxes = await Mailbox.findAll({
          attributes: [['mailboxId', 'id'], 'address', 'name'],
          raw: true
        });

        process.send({ event: 'getMailboxes', data: mailboxes });
      } catch (e) {
        process.send({
          event: 'getMailboxes',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'getFolderUnreadCount') {
      try {
        const count = await Email.findAll({
          attributes: [
            'folderId',
            [Sequelize.fn('COUNT', Sequelize.col('count')), 'count']
          ],
          where: { folderId: payload.id, count: true },
          group: ['count'],
          raw: true
        });

        process.send({ event: 'getFolderUnreadCount', data: count });
      } catch (e) {
        process.send({
          event: 'getFolderUnreadCount',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'getMailboxFolders') {
      try {
        const folders = await Folder.findAll({
          attributes: [
            ['folderId', 'id'],
            'name',
            'count',
            'type',
            'icon',
            'seq'
          ],
          where: { mailboxId: payload.id },
          order: [['seq', 'ASC']],
          raw: true
        });

        process.send({ event: 'getMailboxFolders', data: folders });
      } catch (e) {
        process.send({
          event: 'getMailboxFolders',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'getMessagesByFolderId') {
      try {
        const messages = await Email.findAll({
          where: { folderId: payload.id },
          limit: payload.limit,
          attributes: [
            ['emailId', 'id'],
            'folderId',
            'subject',
            'unread',
            'date',
            'toJSON',
            'fromJSON',
            'bodyAsText',
            'attachments'
          ],
          order: [['date', 'DESC']],
          raw: true
        });
        process.send({ event: 'getMessagesByFolderId', data: messages });
      } catch (e) {
        process.send({
          event: 'getMessagesByFolderId',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'getMessageById') {
      try {
        const email = await Email.findByPk(payload.id, { raw: true });
        email.id = email.emailId;
        email.attachments = JSON.parse(email.attachments);

        if (email.unread) {
          await Email.update(
            { unread: false },
            {
              where: { emailId: email.id },
              individualHooks: true
            }
          );

          if (
            email.folderId !== 4 &&
            email.folderId !== 5 &&
            email.folderId !== 6
          ) {
            await Folder.decrement(['count'], {
              where: { folderId: email.folderId },
              individualHooks: true
            });
          }
          email.unread = 0;
        }
        process.send({ event: 'getMessagebyId', data: email });
      } catch (e) {
        process.send({
          event: 'getMessagebyId',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'markAsUnread') {
      const { id, folderId } = payload;
      try {
        await Email.update(
          { unread: true },
          {
            where: { emailId: id },
            individualHooks: true
          }
        );
        await Folder.increment(['count'], {
          where: { folderId },
          individualHooks: true
        });
        process.send({ event: 'markAsUnread', data: null });
      } catch (e) {
        process.send({
          event: 'markAsUnread',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'sendEmail') {
      drive = store.getDrive();

      try {
        const acct = store.getAccount();
        const { mailbox } = store.api;
        const emailFilename = uuidv4();
        const emailDest = `/email/${emailFilename}.json`;

        let res = await mailbox.send(payload.email, {
          owner: payload.email.from[0].address,
          keypairs: {
            secretBoxKeypair: {
              publicKey: acct.secretBoxPubKey,
              privateKey: acct.secretBoxPrivKey
            },
            signingKeypair: {
              publicKey: acct.deviceSigningPubKey,
              privateKey: acct.deviceSigningPrivKey
            }
          },
          drive,
          dest: emailDest
        });

        res = { name: emailFilename, ...res };

        process.send({ event: 'sendEmail', data: res });
      } catch (e) {
        process.send({
          event: 'sendEmail',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack,
            raw: e
          }
        });
      }
    }

    if (event === 'MAIL SERVICE::saveMessageToDB') {
      drive = store.getDrive();

      console.log('MAILBOX WORKER:: SAVE TO DB', payload);

      const { messages, type, newMessage } = payload;

      const asyncMsgs = [];
      const asyncFolders = [];

      messages.forEach(msg => {
        const attachments = [];
        let folderId;

        if (!msg.email) {
          msg.email = msg;
        }

        if (!msg._id) {
          msg._id = uuidv4();
        }

        if (
          (type === 'Sent' && msg.email.emailId) ||
          (type === 'Draft' && msg.email.folderId !== 4)
        ) {
          msg.email.emailId = null;
        }

        if (msg.email.attachments.length > 0) {
          msg.email.attachments.forEach(file => {
            const fileId = file.fileId || uuidv4();
            const fileObj = {
              id: fileId,
              emailId: msg.email.emailId || msg._id,
              filename: file.filename ? file.filename : 'undefined',
              contentType: file.contentType,
              size: file.size,
              drive: drive.discoveryKey,
              path: `/file/${fileId}.file`
            };

            attachments.push(fileObj);

            asyncMsgs.push(
              fileUtil.saveFileToDrive({
                drive,
                content: file.content,
                file: fileObj
              })
            );
          });
        }

        switch (type) {
          case 'Incoming':
            folderId = 1; // Save message to Inbox
            asyncFolders.push(
              Folder.increment(['count'], { where: { folderId: 1 } })
            );
            break;
          case 'Sent':
            folderId = 5; // Save message to Sent
            break;
          case 'Draft':
            folderId = 4; // Save message to Drafts

            // Don't increment folder count if this is
            // a draft being updated
            if (!msg.email.emailId) {
              asyncFolders.push(
                Folder.increment(['count'], { where: { folderId: 4 } })
              );
            }
            break;
          default:
            folderId = 0;
        }

        const msgObj = {
          emailId: msg.email.emailId || msg._id,
          unread: !(folderId === 5 || folderId === 4),
          folderId,
          fromJSON: JSON.stringify(msg.email.from),
          toJSON: JSON.stringify(msg.email.to),
          subject: msg.email.subject ? msg.email.subject : '(no subject)',
          date: msg.email.date,
          bccJSON: JSON.stringify(msg.email.bcc),
          ccJSON: JSON.stringify(msg.email.cc),
          bodyAsText: msg.email.text_body,
          bodyAsHtml: msg.email.html_body,
          attachments: JSON.stringify(attachments),
          encKey: msg.email.encKey,
          encHeader: msg.email.encHeader,
          path: msg.email.path
        };

        if (msg.email.emailId && type !== 'incoming') {
          asyncMsgs.push(
            Email.update(msgObj, {
              where: { emailId: msg.email.emailId },
              individualHooks: true
            })
          );
        } else {
          asyncMsgs.push(Email.create(msgObj));
        }
      });

      Promise.all(asyncMsgs)
        .then(async items => {
          const msgArr = [];

          await Promise.all(asyncFolders);

          items.forEach(item => {
            if (item && item.dataValues && item.dataValues.bodyAsText) {
              const msg = { ...item.dataValues };

              msg.id = msg.emailId;
              msgArr.push(msg);
            }
          });
          return process.send({ event: 'MAILBOX WORKER::saveMessageToDB', data: msgArr });
        })
        .catch(e => {
          process.send({
            event: 'MAILBOX WORKER::saveMessageToDB',
            error: {
              name: e.name,
              message: e.message,
              stacktrace: e.stack
            }
          });
          throw e;
        });
    }

    if (event === 'removeMessages') {
      process.send({ event: 'DELETEMAIL', ids: payload.messageIds });
      const msgArr = await Email.findAll({
        attributes: ['emailId', 'folderId', 'path'],
        where: {
          emailId: {
            [Op.in]: payload.messageIds
          }
        },
        raw: true
      });

      process.send({ event: 'DELETEMAIL', msgArr });

      try {
        await Email.destroy({
          where: {
            emailId: {
              [Op.in]: payload.messageIds
            }
          },
          individualHooks: true
        });

        msgArr.forEach(msg => {
          File.destroy({
            where: { emailId: msg.emailId },
            individualHooks: true
          })
            .then(res => { })
            .catch(e => {
              process.send({ event: 'removeMessages', error: e.message });
            });

          if (msg.folderId === 4) {
            Folder.decrement(['count'], {
              where: { folderId: 4 },
              individualHooks: true
            })
              .then(res => { })
              .catch(e => {
                process.send({ event: 'removeMessages', error: e.message });
              });
          }
        });

        process.send({ event: 'removeMessages', data: null });
      } catch (e) {
        process.send({
          event: 'removeMessages',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'moveMessages') {
      const { messages } = payload;

      try {
        const ids = messages.map(msg => msg.id);
        const fromFolder = messages[0].folder.fromId;
        const toFolder = messages[0].folder.toId;
        const unreadCount = messages.filter(msg => msg.unread === 1).length;

        await Email.update(
          { folderId: toFolder },
          {
            where: {
              emailId: {
                [Op.in]: ids
              }
            },
            individualHooks: true
          }
        );

        if (fromFolder === 4 || fromFolder === 6) {
          await Folder.decrement(['count'], {
            by: messages.length,
            where: { folderId: fromFolder },
            individualHooks: true
          });
        }

        if (toFolder === 4 || toFolder === 6) {
          await Folder.increment(['count'], {
            by: messages.length,
            where: { folderId: toFolder },
            individualHooks: true
          });
        }

        if (unreadCount > 0) {
          if (fromFolder !== 4 && fromFolder !== 6) {
            await Folder.decrement(['count'], {
              by: unreadCount,
              where: { folderId: fromFolder },
              individualHooks: true
            });
          }

          if (toFolder !== 4 && toFolder !== 6) {
            await Folder.increment(['count'], {
              by: unreadCount,
              where: { folderId: toFolder },
              individualHooks: true
            });
          }
        }
        process.send({ event: 'moveMessages', data: null });
      } catch (e) {
        process.send({
          event: 'moveMessages',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'saveMailbox') {
      const address = payload;

      try {
        const mailbox = await Mailbox.create({ address });

        await Folder.create({
          mailboxId: mailbox.mailboxId,
          name: 'Inbox',
          type: 'default',
          icon: 'inbox',
          seq: 1
        });
        await Folder.create({
          mailboxId: mailbox.mailboxId,
          name: 'Screened',
          type: 'default',
          icon: '',
          seq: 2
        });
        await Folder.create({
          mailboxId: mailbox.mailboxId,
          name: 'Reply Later',
          type: 'default',
          icon: '',
          seq: 3
        }); // eslint-disable-line prettier/prettier
        await Folder.create({
          mailboxId: mailbox.mailboxId,
          name: 'Drafts',
          type: 'default',
          icon: 'pencil',
          seq: 4
        });
        await Folder.create({
          mailboxId: mailbox.mailboxId,
          name: 'Sent',
          type: 'default',
          icon: 'send-o',
          seq: 5
        });
        // DECISION WAS MADE TO REMOVE SPAM FOR NOW
        // await Folder.create({
        //   mailboxId: mailbox.mailboxId,
        //   name: 'Spam',
        //   type: 'default',
        //   icon: 'ban',
        //   seq: 6
        // });
        await Folder.create({
          mailboxId: mailbox.mailboxId,
          name: 'Trash',
          type: 'default',
          icon: 'trash-o',
          seq: 6
        });

        process.send({ event: 'saveMailbox', data: mailbox.dataValues });
      } catch (e) {
        process.send({
          event: 'saveMailbox',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    // When Saving multiple files at once
    if (event === 'saveFiles') {
      drive = store.getDrive();

      const { filepath, attachments } = payload;

      try {
        if (filepath === undefined) return 'canceled';

        await Promise.all(
          attachments.map(async attachment => {
            const writeStream = fs.createWriteStream(filepath);

            const file = await File.findByPk(attachment.id, {
              attributes: ['id', 'drive', 'path', 'key', 'header'],
              raw: true
            });

            await fileUtil.saveFileFromEncryptedStream(writeStream, {
              drive,
              path: file.path,
              key: file.key,
              header: file.header
            });
          })
        );
        process.send({ event: 'saveFiles', data: 'success' });
      } catch (e) {
        process.send({
          event: 'saveFiles',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'searchMailbox') {
      const { searchQuery } = payload;

      try {
        if (searchQuery) {
          if (searchQuery.indexOf('from: ') > -1) {
            return Email.findAll({
              attributes: [
                ['emailId', 'id'],
                'subject',
                'bodyAsText',
                'fromJSON',
                'toJSON',
                'attachments'
              ],
              where: {
                [Op.or]: [{ fromJSON: { [Op.like]: `%${searchQuery}%` } }]
              },
              raw: true,
              limit: 5
            });
          }

          if (searchQuery.indexOf('to: ') > -1) {
            return Email.findAll({
              attributes: [
                ['emailId', 'id'],
                'subject',
                'bodyAsText',
                'fromJSON',
                'toJSON',
                'attachments'
              ],
              where: {
                toJSON: { [Op.like]: `%${searchQuery}%` }
              },
              raw: true,
              limit: 5
            });
          }

          const results = await Email.findAll({
            attributes: [
              ['emailId', 'id'],
              'subject',
              'bodyAsText',
              'fromJSON',
              'toJSON',
              'attachments'
            ],
            where: {
              [Op.or]: [
                { subject: { [Op.like]: `%${searchQuery}%` } },
                { bodyAsText: { [Op.like]: `%${searchQuery}%` } },
                { fromJSON: { [Op.like]: `%${searchQuery}%` } },
                { toJSON: { [Op.like]: `%${searchQuery}%` } },
                { attachments: { [Op.like]: `%${searchQuery}%` } }
              ]
            },
            raw: true,
            limit: 5
          });

          process.send({ event: 'searchMailbox', data: results });
        }
      } catch (e) {
        process.send({
          event: 'searchMailbox',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'createFolder') {
      try {
        const folder = await Folder.create({
          mailboxId: payload.mailboxId,
          name: payload.name,
          type: payload.type,
          icon: payload.icon,
          color: payload.color,
          seq: payload.seq
        });

        folder.dataValues.id = folder.dataValues.folderId;
        process.send({ event: 'createFolder', data: folder.dataValues });
      } catch (e) {
        process.send({
          event: 'createFolder',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'updateFolder') {
      try {
        const folder = await Folder.update(
          { name: payload.name },
          {
            where: { folderId: payload.folderId },
            individualHooks: true
          }
        );

        process.send({ event: 'updateFolder', data: folder.dataValues });
      } catch (e) {
        process.send({
          event: 'updateFolder',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'deleteFolder') {
      try {
        await Folder.destroy({
          where: {
            folderId: payload.folderId
          },
          individualHooks: true
        });

        await Email.destroy({
          where: { folderId: payload.folderId },
          individualHooks: true
        });

        process.send({ event: 'deleteFolder', data: {} });
      } catch (e) {
        process.send({
          event: 'deleteFolder',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }
  });
};
