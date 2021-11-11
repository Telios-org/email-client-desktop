const { DataTypes } = require('sequelize');
const { Model } = require('sequelize');
const store = require('../Store');

const model = {
  name: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  publicKey: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  privateKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mailboxId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: false
  },
  disabled: {
    type: DataTypes.BOOLEAN
  },
  // Timestamps
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
};

class AliasNamespace extends Model { }

module.exports.AliasNamespace = AliasNamespace;

module.exports.model = model;

module.exports.init = async (sequelize, opts) => {
  AliasNamespace.init(model, {
    sequelize,
    tableName: 'Namespace',
    freezeTableName: true,
    timestamps: true
  });

  const drive = store.getDrive();
  const collection = await drive.db.collection('Namespace');

  AliasNamespace.addHook('afterCreate', async (ns, options) => {
    try {
      await collection.put(ns.name, ns.dataValues);
    } catch (err) {
      console.log('Error saving AliasNamespace to Hyperbee', err);
      throw new Error(err);
    }
  });

  AliasNamespace.addHook('afterUpdate', async (ns, options) => {
    try {
      await collection.put(ns.name, ns.dataValues);
    } catch (err) {
      console.log('Error saving AliasNamespace to Hyperbee', err);
      throw new Error(err);
    }
  });

  AliasNamespace.addHook('beforeDestroy', async (ns, options) => {
    try {
      await collection.del(ns.name);
    } catch (err) {
      process.send({
        event: 'BeforeDestroy-deleteAliasNamespace',
        error: {
          name: err.name,
          message: err.message,
          stacktrace: err.stack
        }
      });
      throw new Error(err);
    }
  });

  return AliasNamespace;
};
