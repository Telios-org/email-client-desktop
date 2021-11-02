/* eslint-disable no-param-reassign */
const Sequelize = require('sequelize');
const removeMd = require('remove-markdown');
const { Model } = require('sequelize');
const { File } = require('./file.model.js');
const { Folder } = require('./folder.model');
const fileUtil = require('../utils/file.util');
const { v4: uuidv4 } = require('uuid');
const store = require('../Store');

const model = {
  emailId: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  folderId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  aliasId: {
    type: Sequelize.STRING,
    allowNull: true
  },
  subject: {
    type: Sequelize.STRING
  },
  unread: {
    type: Sequelize.BOOLEAN
  },
  date: {
    type: Sequelize.STRING
  },
  toJSON: {
    type: Sequelize.STRING,
    allowNull: false
  },
  fromJSON: {
    type: Sequelize.STRING,
    allowNull: false
  },
  ccJSON: {
    type: Sequelize.STRING
  },
  bccJSON: {
    type: Sequelize.STRING
  },
  bodyAsText: {
    type: Sequelize.STRING
  },
  bodyAsHtml: {
    type: Sequelize.STRING
  },
  attachments: {
    type: Sequelize.STRING
  },
  path: {
    type: Sequelize.STRING
  },
  // Timestamps
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
};

class Email extends Model { }

module.exports.Email = Email;

module.exports.model = model;

module.exports.init = async (sequelize, opts) => {
  Email.init(model, {
    sequelize,
    tableName: 'Email',
    freezeTableName: true,
    timestamps: true
  });

  const drive = store.getDrive();
  const collection = await drive.db.collection('Email');

  Email.addHook('afterFind', async (email, options) => {
    process.send({ event: 'findEmail', email });

    try {
      if (!Array.isArray(email) && options.attributes.includes('bodyAsHtml')) {
        const content = await fileUtil.readFile(email.path, { drive, type: 'email' });
        const e = JSON.parse(content);

        email.bodyAsHtml = e.bodyAsHtml || e.html_body || e.bodyAsText;
      }

      if (Array.isArray(email) && options.attributes.includes('bodyAsText')) {
        for (let i = 0; i < email.length; i += 1) {
          let bodyAsText = removeMd(email[i].bodyAsText);
          bodyAsText = bodyAsText.replace(/\[(.*?)\]/g, '');
          bodyAsText = bodyAsText.replace(/(?:\u00a0|\u200C)/g, '');

          email[i].bodyAsText = bodyAsText;

          // const selection = bodyAsText.split(' ').slice(0, 20);

          // if (selection[selection.length - 1] !== '...') {
          //   selection.push('...');
          // }

          // email[i].bodyAsText = selection.join(' ');
        }
      }
    } catch (err) {
      process.send({ event: 'findEmail', error: err.message });
      throw err;
    }
  });

  Email.addHook('beforeCreate', async (email, options) => {
    try {
      email.bodyAsText = removeMd(email.bodyAsText);
      email.bodyAsText = email.bodyAsText.replace(/\[(.*?)\]/g, '');
      email.bodyAsText = email.bodyAsText.replace(/(?:\u00a0|\u200C)/g, '');
      email.unread = email.unread ? 1 : 0;

      if (!email.path) {
        email.path = `/email/${uuidv4()}.json`;
      }

      // Save email to drive
      await fileUtil.saveEmailToDrive({ email, drive });
      email.bodyAsHtml = null;

      await collection.put(email.emailId,
        {
          unread: email.unread ? 1 : 0,
          folderId: email.folderId,
          path: email.path
        }
      );

      process.send({ event: 'BeforeCreate-saveMessageToDBLOG', data: email });
    } catch (err) {
      process.send({ event: 'BeforeCreate-saveMessageToDBLOG', error: err.message });
      throw new Error(err);
    }
  });

  Email.addHook('beforeUpdate', async (email, options) => {
    try {
      email.bodyAsText = removeMd(email.bodyAsText);
      email.bodyAsText = email.bodyAsText.replace(/\[(.*?)\]/g, '');
      email.bodyAsText = email.bodyAsText.replace(/(?:\u00a0|\u200C)/g, '');
      email.bodyAsHtml = null;

      await collection.put(email.emailId,
        {
          unread: email.unread,
          folderId: email.folderId,
          path: email.path
        }
      );

      process.send({ event: 'BeforeUpdate-saveMessageToDBLOG', data: email });
    } catch (err) {
      process.send({
        event: 'BeforeUpdate-saveMessageToDBLOG', error: {
          name: e.name,
          message: e.message,
          stacktrace: e.stack
        }
      });
      throw err;
    }
  });

  Email.addHook('beforeUpsert', async (email, options) => {
    try {
      email.bodyAsText = removeMd(email.bodyAsText);
      email.bodyAsText = email.bodyAsText.replace(/\[(.*?)\]/g, '');
      email.bodyAsText = email.bodyAsText.replace(/(?:\u00a0|\u200C)/g, '');
      email.bodyAsHtml = null;

      await collection.put(email.emailId,
        {
          unread: email.unread,
          folderId: email.folderId,
          path: email.path
        }
      );

      return email;
    } catch (err) {
      process.send({ event: 'BeforeUpsert-saveMessageToDBLOG', error: err.message });
      throw err;
    }
  });

  Email.addHook('beforeDestroy', async (email, options) => {
    try {
      const asyncArr = [];
      const drive = store.getDrive();
      process.send({ event: 'beforeDestroyEmail', email });

      asyncArr.push(collection.del(email.emailId));
      asyncArr.push(drive.unlink(email.path));

      asyncArr.push(
        File.destroy({
          where: { emailId: email.emailId },
          individualHooks: true
        })
      );

      const result = await Promise.all(asyncArr);
    } catch (err) {
      throw err;
    }
  });

  return Email;
};
