const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const { Model } = require('sequelize');
const store = require('../Store');

const model = {
  accountId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  uid: {
    type: Sequelize.STRING,
    allowNull: false
  },
  driveEncryptionKey: {
    type: Sequelize.STRING,
    allowNull: false
  },
  secretBoxPubKey: {
    type: Sequelize.STRING,
    allowNull: false
  },
  secretBoxPrivKey: {
    type: Sequelize.STRING,
    allowNull: false
  },
  deviceSigningPubKey: {
    type: Sequelize.STRING,
    allowNull: false
  },
  deviceSigningPrivKey: {
    type: Sequelize.STRING,
    allowNull: false
  },
  serverSig: {
    type: Sequelize.STRING,
    allowNull: false
  },
  deviceId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  displayName: {
    type: Sequelize.STRING,
    allowNull: true
  },
  avatar: {
    type: Sequelize.STRING,
    allowNull: true
  },
  stats: {
    type: Sequelize.STRING,
    allowNull: true
  },
  // Timestamps
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
};

class Account extends Model {}

module.exports.Account = Account;

module.exports.model = model;

module.exports.init = async (sequelize, opts) => {
  Account.init(model, {
    sequelize,
    tableName: 'Account',
    freezeTableName: true,
    timestamps: true
  });

  Account.addHook('afterFind', async (account, options) => {
    process.send({ event: 'AFTER_FIND::Account', account, options });
    try {
      const drive = store.getDrive();

      if (drive && drive.db) {
        // We want to make sure the drive has the databases ready
        const collection = await drive.db.collection('Account');
        if (Array.isArray(account) && options.attributes.includes('avatar')) {
          const data = await collection.get(account[0].uid);
          process.send({ event: 'FIND::Account', data });
          account[0].avatar = (data && data.avatar) || null;
        } else if (
          !Array.isArray(account) &&
          options.attributes.includes('avatar')
        ) {
          const data = await collection.get(account.uid);
          process.send({ event: 'FIND::Account', data });
          account.avatar = (data && data.avatar) || null;
        }
      }
    } catch (error) {
      process.send({
        event: 'AFTER_FIND::Account',
        error: error.message
      });
      throw error;
    }
  });

  Account.addHook('afterCreate', async (account, options) => {
    try {
      const readStream = fs.createReadStream(
        path.join(store.acctPath, '/app.db')
      );
      await drive.writeFile('/backup/encrypted.db', readStream);
    } catch (err) {
      process.send({ event: 'afterCreate', error: err.message });
      throw new Error(err);
    }
  });

  Account.addHook('beforeUpdate', async (account, options) => {
    try {
      process.send({ event: 'BEFORE_UPDATE::Account', account, options });
      if (
        options.fields.includes('avatar') ||
        options.fields.includes('displayName')
      ) {
        const drive = store.getDrive();
        const collection = await drive.db.collection('Account');

        // Nullifying the avatar value so it doesn't get stored locally
        // Instead we'll store yet in the Hyperbee DB Collection
        const res = await collection.put(account.uid, {
          displayName: account.displayName,
          avatar: account.avatar
        });
        process.send({ event: 'BEFORE_UPDATE::Account', account, res });
        account.avatar = null;
      }
    } catch (error) {
      process.send({
        event: 'BEFORE_UPDATE::Account',
        error: error.message
      });
      throw error;
    }
  });

  return Account;
};
