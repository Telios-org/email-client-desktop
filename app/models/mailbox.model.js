const Sequelize = require('sequelize');
const { Model } = require('sequelize');
const store = require('../Store');

const model = {
  mailboxId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  address: {
    type: Sequelize.STRING,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING
  },
  // Timestamps
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
};

class Mailbox extends Model {}

module.exports.Mailbox = Mailbox;

module.exports.model = model;

module.exports.init = async (sequelize, opts) => {
  Mailbox.init(model, {
    sequelize,
    tableName: 'Mailbox',
    freezeTableName: true,
    timestamps: true
  });

  const drive = store.getDrive();
  const collection = await drive.db.collection('Mailbox');

  Mailbox.addHook('afterCreate', async (mailbox, options) => {
    try {
      await collection.put(mailbox.mailboxId, mailbox.dataValues);
    } catch (err) {
      console.log('Error saving Mailbox to Hyperbee', err);
      throw new Error(err);
    }
  });

  Mailbox.addHook('afterUpdate', async (mailbox, options) => {
    try {
      await collection.put(mailbox.mailboxId, mailbox.dataValues);
    } catch (err) {
      console.log('Error saving Mailbox to Hyperbee', err);
      throw new Error(err);
    }
  });

  return Mailbox;
};
