const fs = require('fs');
const Sequelize = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const SDK = require('@telios/client-sdk');
const { Mailbox } = require('../models/mailbox.model');
const { Folder, DefaultFolders } = require('../models/folder.model');
const { AliasNamespace } = require('../models/aliasNamespace.model');
const { Alias } = require('../models/alias.model');
const { Email } = require('../models/email.model');
const { File } = require('../models/file.model');
const fileUtil = require('../utils/file.util');
const store = require('../Store');
const envAPI = require('../env_api.json');
const { openStdin } = require('process');

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
        provider: env === 'production' || !env ? envAPI.prod : envAPI.dev,
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

    if (event === 'MAIL_SERVICE::getMailboxFolders') {
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

        process.send({
          event: 'MAIL_WORKER::getMailboxFolders',
          data: folders
        });
      } catch (e) {
        process.send({
          event: 'MAIL_WORKER::getMailboxFolders',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'MAIL_SERVICE::getMailboxNamespaces') {
      try {
        const namespaces = await AliasNamespace.findAll({
          attributes: [
            'publicKey',
            'privateKey',
            'name',
            'mailboxId',
            'domain',
            'disabled'
          ],
          where: { mailboxId: payload.id },
          order: [['name', 'ASC']],
          raw: true
        });

        for (const namespace of namespaces) {
          const keypair = {
            publicKey: namespace.publicKey,
            privateKey: namespace.privateKey
          };

          store.setKeypair(keypair);
        }

        process.send({
          event: 'MAIL_WORKER::getMailboxNamespaces',
          data: namespaces
        });
      } catch (e) {
        process.send({
          event: 'MAIL_WORKER::getMailboxNamespaces',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'MAIL_SERVICE::registerAliasNamespace') {
      try {
        const { mailboxId, namespace } = payload;

        const mailbox = store.getMailbox();
        const domain =
          env === 'production' || !env ? envAPI.prodMail : envAPI.devMail;
        const { account } = store;

        const keypair = SDK.Crypto.boxKeypairFromStr(
          `${account.secretBoxPrivKey}${namespace}@${domain}`
        );

        const { registered, key } = await mailbox.registerAliasName({
          alias_name: namespace,
          domain,
          key: keypair.publicKey
        });

        const output = await AliasNamespace.create({
          publicKey: key,
          privateKey: keypair.privateKey,
          name: namespace,
          mailboxId,
          domain,
          disabled: false
        });

        store.setKeypair(keypair);

        process.send({
          event: 'MAIL_WORKER::registerAliasNamespace',
          data: output.dataValues
        });
      } catch (e) {
        process.send({
          event: 'MAIL_WORKER::registerAliasNamespace',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'MAIL_SERVICE::getMailboxAliases') {
      try {
        const aliases = await Alias.findAll({
          attributes: [
            'aliasId',
            'name',
            'description',
            'namespaceKey',
            'count',
            'disabled',
            'fwdAddresses',
            'createdAt'
          ],
          where: { namespaceKey: { [Op.in]: payload.namespaceKeys } },
          order: [['createdAt', 'DESC']],
          raw: true
        });

        const outputAliases = aliases.map(a => {
          return {
            ...a,
            fwdAddresses:
              (a.fwdAddresses && a.fwdAddresses.length) > 0
                ? a.fwdAddresses.split(',')
                : [],
            createdAt: new Date(a.createdAt)
          };
        });

        process.send({
          event: 'MAIL_WORKER::getMailboxAliases',
          data: outputAliases
        });
      } catch (e) {
        process.send({
          event: 'MAIL_WORKER::getMailboxAliases',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'MAIL_SERVICE::registerAliasAddress') {
      const {
        namespaceName,
        domain,
        address,
        description,
        fwdAddresses,
        disabled
      } = payload;

      try {
        const mailbox = store.getMailbox();

        const { registered } = await mailbox.registerAliasAddress({
          alias_address: `${namespaceName}#${address}@${domain}`,
          forwards_to: fwdAddresses,
          whitelisted: true,
          disabled
        });

        const output = await Alias.create({
          aliasId: `${namespaceName}#${address}`,
          name: address,
          namespaceKey: namespaceName,
          count: 0,
          description,
          fwdAddresses: fwdAddresses.length > 0 ? fwdAddresses.join(',') : null,
          disabled,
          whitelisted: 1
        });

        process.send({
          event: 'MAIL_WORKER::registerAliasAddress',
          data: { ...output.dataValues, fwdAddresses }
        });
      } catch (e) {
        process.send({
          event: 'MAIL_WORKER::registerAliasAddress',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack,
            data: {
              alias_address: `${namespaceName}#${address}@${domain}`,
              forwards_to: fwdAddresses,
              whitelisted: true,
              disabled
            }
          }
        });
      }
    }

    if (event === 'MAIL_SERVICE::updateAliasAddress') {
      try {
        const {
          namespaceName,
          domain,
          address,
          description,
          fwdAddresses,
          disabled
        } = payload;

        const mailbox = store.getMailbox();

        await mailbox.updateAliasAddress({
          alias_address: `${namespaceName}#${address}@${domain}`,
          forwards_to: fwdAddresses,
          whitelisted: true,
          disabled
        });

        const output = await Alias.update(
          {
            fwdAddresses:
              fwdAddresses.length > 0 ? fwdAddresses.join(',') : null,
            description,
            disabled
          },
          {
            where: { name: address },
            individualHooks: true
          }
        );

        process.send({
          event: 'MAIL_WORKER::updateAliasAddress',
          data: output.dataValues
        });
      } catch (e) {
        process.send({
          event: 'MAIL_WORKER::updateAliasAddress',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'MAIL_SERVICE::removeAliasAddress') {
      const { namespaceName, domain, address } = payload;

      try {
        const mailbox = store.getMailbox();

        await mailbox.removeAliasAddress(
          `${namespaceName}#${address}@${domain}`
        );

        await Alias.destroy({
          where: {
            aliasId: `${namespaceName}#${address}`
          },
          individualHooks: true
        });
        process.send({ event: 'MAIL_WORKER::removeAliasAddress', data: null });
      } catch (e) {
        process.send({
          event: 'MAIL_WORKER::removeAliasAddress',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'MAIL_SERVICE::getMessagesByFolderId') {
      try {
        const messages = await Email.findAll({
          where: { folderId: payload.id },
          limit: payload.limit,
          offset: payload.offset,
          attributes: [
            ['emailId', 'id'],
            'folderId',
            'aliasId',
            'subject',
            'unread',
            'date',
            'toJSON',
            'fromJSON',
            'ccJSON',
            'bodyAsText',
            'attachments'
          ],
          order: [['date', 'DESC']],
          raw: true
        });
        process.send({
          event: 'MAIL_WORKER::getMessagesByFolderId',
          data: messages
        });
      } catch (e) {
        process.send({
          event: 'MAIL_WORKER::getMessagesByFolderId',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'MAIL_SERVICE::getMessagesByAliasId') {
      try {
        const messages = await Email.findAll({
          where: { aliasId: payload.id, folderId: 5 },
          limit: payload.limit,
          offset: payload.offset,
          attributes: [
            ['emailId', 'id'],
            'folderId',
            'aliasId',
            'subject',
            'unread',
            'date',
            'toJSON',
            'fromJSON',
            'ccJSON',
            'bodyAsText',
            'attachments'
          ],
          order: [['date', 'DESC']],
          raw: true
        });
        process.send({
          event: 'MAIL_WORKER::getMessagesByAliasId',
          data: messages
        });
      } catch (e) {
        process.send({
          event: 'MAIL_WORKER::getMessagesByAliasId',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'MAIL_SERVICE::getMessageById') {
      try {
        const email = await Email.findByPk(payload.id, { raw: true });
        email.id = email.emailId;
        email.attachments = JSON.parse(email.attachments);

        if (email.unread) {
          await Email.update(
            { unread: 0 },
            {
              where: { emailId: email.id },
              individualHooks: true
            }
          );

          email.unread = 0;
        }
        process.send({ event: 'MAIL_WORKER::getMessagebyId', data: email });
      } catch (e) {
        process.send({
          event: 'MAIL_WORKER::getMessagebyId',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'markAsUnread') {
      const { id } = payload;

      try {
        await Email.update(
          { unread: 1 },
          {
            where: { emailId: id },
            individualHooks: true
          }
        );

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

    if (event === 'MAILBOX_SERVICE::sendEmail') {
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

        res = { name: emailFilename, email: payload.email, ...res };

        process.send({ event: 'MAILBOX_WORKER::sendEmail', data: res });
      } catch (e) {
        process.send({
          event: 'MAILBOX_WORKER::sendEmail',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack,
            raw: e
          }
        });
      }
    }

    if (event === 'MAIL SERVICE::SaveSentMessageToDB') {
      drive = store.getDrive();

      const { messages } = payload;
      const msg = messages[0];

      let email = {
        ...msg,
        emailId: uuidv4(),
        path: `/email/${uuidv4()}.json`,
        folderId: 3,
        subject: msg.subject ? msg.subject : '(no subject)',
        fromJSON: JSON.stringify(msg.from),
        toJSON: JSON.stringify(msg.to),
        ccJSON: JSON.stringify(msg.cc),
        bccJSON: JSON.stringify(msg.bcc)
      };

      if (email.attachments && email.attachments.length) {
        email.attachments = email.attachments.map(file => {
          const fileId = file.fileId || uuidv4();
          return {
            id: fileId,
            emailId: email.id,
            filename: file.name || file.filename,
            contentType: file.contentType || file.mimetype,
            size: file.size,
            discoveryKey: file.discoveryKey,
            hash: file.hash,
            header: file.header,
            key: file.key,
            path: file.path
          };
        });
      } else {
        email.attachments = [];
      }

      email.attachments = JSON.stringify(email.attachments);

      const file = await fileUtil.saveEmailToDrive({ email, drive });

      const _f = await fileUtil.readFile(email.path, { drive, type: 'email' });

      email = {
        ...email,
        encKey: file.key,
        encHeader: file.header
      };

      Email.create(email);
    }

    if (event === 'MAIL SERVICE::saveMessageToDB') {
      drive = store.getDrive();

      const { messages, type, newMessage } = payload;

      // process.send({ event: 'emailupdate1', payload });

      const asyncMsgs = [];
      const asyncFolders = [];
      const newAliases = [];

      // eslint-disable-next-line no-restricted-syntax
      for await (const msg of messages) {
        const attachments = [];
        let folderId;
        let aliasId = null;

        if (!msg.email) {
          msg.email = msg;
        }

        if (!msg._id) {
          msg._id = uuidv4();
        }

        if (type === 'Sent' && msg.email.emailId) {
          msg.email.emailId = null;
          // This should already be enforced at the composer level.
        }

        if (
          msg.email &&
          msg.email.attachments &&
          msg.email.attachments.length > 0
        ) {
          msg.email.attachments.forEach(file => {
            const fileId = file.fileId || uuidv4();
            const fileObj = {
              id: fileId,
              emailId: msg.email.emailId || msg._id,
              filename: file.filename || file.name,
              contentType: file.contentType,
              size: file.size,
              discoveryKey: file.discoveryKey || drive.discoveryKey,
              path: `/file/${fileId}.file`,
              hash: file.hash,
              header: file.header,
              key: file.key
            };

            attachments.push(fileObj);

            if (file.content) {
              asyncMsgs.push(
                fileUtil.saveFileToDrive({
                  drive,
                  content: file.content,
                  file: fileObj
                })
              );
            }
          });
        }

        let isAlias = false;
        switch (type) {
          case 'Incoming':
            // Assign email into appropriate folder/alias
            // eslint-disable-next-line no-restricted-syntax
            for await (const recipient of msg.email.to) {
              // Recipient is an alias
              if (recipient.address.indexOf('#') > -1) {
                folderId = 0;
                isAlias = true;
                const localPart = recipient.address.split('@')[0];
                const recipAliasName = localPart.split('#')[0];
                const recipAliasAddress = localPart.split('#')[1];

                const aliasNamespace = await AliasNamespace.findOne({
                  where: {
                    name: recipAliasName
                  },
                  raw: true
                });

                // Alias is not part of this account so send this email to the main inbox
                if (!aliasNamespace) {
                  folderId = 1;
                  break;
                }

                const aliasAddrs = await Alias.findAll({
                  attributes: ['aliasId', 'name'],
                  raw: true
                });

                // Check if incoming message alias already exists
                const aliasIndex = aliasAddrs.findIndex(
                  item => item.aliasId === localPart
                );

                if (aliasIndex === -1) {
                  // create a new alias!
                  const alias = await Alias.create({
                    aliasId: localPart,
                    name: recipAliasAddress,
                    namespaceKey: aliasNamespace.name,
                    count: 0,
                    disabled: false,
                    fwdAddresses: null,
                    whitelisted: 1
                  });

                  aliasId = alias.aliasId;
                  newAliases.push({ ...alias.dataValues, fwdAddresses: [] });
                } else {
                  aliasId = aliasAddrs[aliasIndex].aliasId;
                }
              }
            }

            if (!isAlias) {
              folderId = 1;
            } else {
              folderId = 5;
            }

            break;
          case 'Sent':
            folderId = 3; // Save message to Sent
            break;
          case 'Draft':
            folderId = 2; // Save message to Drafts
            break;
          default:
            folderId = 1;
        }

        const msgObj = {
          emailId: msg.email.emailId || msg._id,
          unread: folderId === 3 || folderId === 2 ? 0 : 1,
          folderId,
          aliasId,
          fromJSON: JSON.stringify(msg.email.from),
          toJSON: JSON.stringify(msg.email.to),
          subject: msg.email.subject ? msg.email.subject : '(no subject)',
          date: msg.email.date,
          bccJSON: JSON.stringify(msg.email.bcc),
          ccJSON: JSON.stringify(msg.email.cc),
          bodyAsText: msg.email.bodyAsText || msg.email.text_body,
          bodyAsHtml: msg.email.bodyAsHtml || msg.email.html_body,
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
          asyncMsgs.push(
            new Promise((resolve, reject) => {
              // Save email to drive

              fileUtil
                .saveEmailToDrive({ email: msgObj, drive })
                .then(file => {
                  const _email = {
                    ...msgObj,
                    encKey: file.key,
                    encHeader: file.header,
                    path: file.path,
                    size: file.size
                  };

                  Email.create(_email)
                    .then(eml => {
                      resolve(eml);
                    })
                    .catch(err => {
                      reject(err);
                    });
                })
                .catch(err => {
                  reject(e);
                });
            })
          );
        }
      }

      Promise.all(asyncMsgs)
        .then(async items => {
          const msgArr = [];

          await Promise.all(asyncFolders);

          items.forEach(item => {
            if (item && item.dataValues && item.bodyAsText) {
              const msg = { ...item.dataValues };

              msg.id = msg.emailId;
              msg.unread = msg.unread ? 1 : 0;
              msgArr.push(msg);
            }
          });

          return process.send({
            event: 'MAILBOX_WORKER::saveMessageToDB',
            data: {
              msgArr,
              newAliases
            }
          });
        })
        .catch(e => {
          process.send({
            event: 'MAILBOX_WORKER::saveMessageToDB',
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
            .then(res => {})
            .catch(e => {
              process.send({ event: 'removeMessages', error: e.message });
            });
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

        // eslint-disable-next-line no-restricted-syntax
        for (const email of messages) {
          Email.update(
            {
              folderId: toFolder,
              unread: email.unread
            },
            {
              where: {
                emailId: email.id
              },
              individualHooks: true
            }
          );
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

        // eslint-disable-next-line no-restricted-syntax
        for (const folder of DefaultFolders) {
          folder.mailboxId = mailbox.mailboxId;
          await Folder.create(folder);
        }

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

            let file = await File.findByPk(attachment.id, {
              attributes: ['id', 'drive', 'path', 'key', 'header', 'hash'],
              raw: true
            });

            if (!file) {
              file = attachment;
            }

            await fileUtil.saveFileFromEncryptedStream(writeStream, {
              drive,
              path: file.path,
              key: file.key,
              hash: file.hash,
              header: file.header,
              discoveryKey: file.discoveryKey,
              filename: file.filename
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

    if (event === 'MAIL_SERVICE::searchMailbox') {
      const { searchQuery } = payload;

      try {
        if (searchQuery) {
          if (searchQuery.indexOf('from: ') > -1) {
            return Email.findAll({
              attributes: [
                ['emailId', 'id'],
                'folderId',
                'date',
                'aliasId',
                'subject',
                'bodyAsText',
                'fromJSON',
                'toJSON',
                'ccJSON',
                'attachments'
              ],
              where: {
                [Op.or]: [{ fromJSON: { [Op.like]: `%${searchQuery}%` } }]
              },
              raw: true
            });
          }

          if (searchQuery.indexOf('to: ') > -1) {
            return Email.findAll({
              attributes: [
                ['emailId', 'id'],
                'subject',
                'aliasId',
                'folderId',
                'date',
                'bodyAsText',
                'fromJSON',
                'toJSON',
                'ccJSON',
                'attachments'
              ],
              where: {
                toJSON: { [Op.like]: `%${searchQuery}%` }
              },
              raw: true
            });
          }

          const results = await Email.findAll({
            attributes: [
              ['emailId', 'id'],
              'subject',
              'aliasId',
              'folderId',
              'date',
              'bodyAsText',
              'fromJSON',
              'toJSON',
              'ccJSON',
              'attachments'
            ],
            where: {
              [Op.or]: [
                { subject: { [Op.like]: `%${searchQuery}%` } },
                { bodyAsText: { [Op.like]: `%${searchQuery}%` } },
                { fromJSON: { [Op.like]: `%${searchQuery}%` } },
                { toJSON: { [Op.like]: `%${searchQuery}%` } },
                { ccJSON: { [Op.like]: `%${searchQuery}%` } },
                { attachments: { [Op.like]: `%${searchQuery}%` } }
              ]
            },
            raw: true
          });

          process.send({
            event: 'MAILBOX_WORKER::searchMailbox',
            data: results
          });
        }
      } catch (e) {
        process.send({
          event: 'MAILBOX_WORKER::searchMailbox',
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

    if (event === 'updateFolderCount') {
      try {
        const { id, amount } = payload;

        if (amount > 0) {
          await Folder.increment('count', {
            by: amount,
            where: { folderId: id },
            individualHooks: true
          });
        } else {
          await Folder.decrement('count', {
            by: Math.abs(amount),
            where: { folderId: id },
            individualHooks: true
          });
        }

        process.send({ event: 'updateFolderCount', updated: true });
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

    if (event === 'updateAliasCount') {
      try {
        const { id, amount } = payload;

        if (amount > 0) {
          await Alias.increment('count', {
            by: amount,
            where: { aliasId: id },
            individualHooks: true
          });
        } else {
          await Alias.decrement('count', {
            by: Math.abs(amount),
            where: { aliasId: id },
            individualHooks: true
          });
        }

        process.send({ event: 'updateAliasCount', updated: true });
      } catch (e) {
        process.send({
          event: 'updateAliasCount',
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
