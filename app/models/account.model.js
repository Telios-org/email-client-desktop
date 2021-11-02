const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const { Model } = require('sequelize');

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
  // Timestamps
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
};

class Account extends Model { }

module.exports.Account = Account;

module.exports.model = model;

module.exports.init = async (sequelize, opts) => {
  Account.init(model, {
    sequelize,
    tableName: 'Account',
    freezeTableName: true,
    timestamps: true
  });

  const store = require('../Store');
  const drive = store.getDrive();

  Account.addHook('afterCreate', async (account, options) => {
    try {
      const readStream = fs.createReadStream(path.join(store.acctPath, '/app.db'));
      await drive.writeFile('/backup/encrypted.db', readStream);
    } catch (err) {
      process.send({ event: 'afterCreate', error: err.message });
      throw new Error(err);
    }
  });

  return Account;
};
