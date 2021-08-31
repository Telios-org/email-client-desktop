const Sequelize = require('sequelize');
const { Model } = require('sequelize');
const store = require('../Store');
const drive = store.getDrive();

const model = {
  accountId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  hyperDBSecret: {
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
  }
};

class Account extends Model {}

module.exports.Account = Account;

module.exports.model = model;

module.exports.init = async (sequelize, opts) => {
  Account.init(model, {
    sequelize,
    tableName: 'Account',
    freezeTableName: true,
    timestamps: false
  });

  return Account;
};
