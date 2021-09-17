const { DataTypes } = require('sequelize');
const { Model } = require('sequelize');
const store = require('../Store');

const model = {
  namespaceKey: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
    allowNull: false
  },
  name: {
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
  }
};

class AliasesNamespace extends Model {}

module.exports.AliasesNamespace = AliasesNamespace;

module.exports.model = model;

module.exports.init = async (sequelize, opts) => {
  AliasesNamespace.init(model, {
    sequelize,
    tableName: 'AliasesNamespace',
    freezeTableName: true,
    timestamps: false
  });

  const drive = store.getDrive();
  const collection = await drive.collection('AliasesNamespace');

  AliasesNamespace.addHook('afterCreate', async (alias, options) => {
    try {
      await collection.put(alias.namespaceKey, alias.dataValues);
    } catch (err) {
      console.log('Error saving AliasesNamespace to Hyperbee', err);
      throw new Error(err);
    }
  });

  AliasesNamespace.addHook('afterUpdate', async (alias, options) => {
    try {
      await collection.put(alias.namespaceKey, alias.dataValues);
    } catch (err) {
      console.log('Error saving AliasesNamespace to Hyperbee', err);
      throw new Error(err);
    }
  });

  AliasesNamespace.addHook('beforeDestroy', async (alias, options) => {
    try {
      await collection.del(alias.namespaceKey);
    } catch (err) {
      process.send({
        event: 'BeforeDestroy-deleteAliasesNamespace',
        error: {
          name: err.name,
          message: err.message,
          stacktrace: err.stack
        }
      });
      throw new Error(err);
    }
  });

  return AliasesNamespace;
};
