const { DataTypes } = require('sequelize');
const { Model } = require('sequelize');
const store = require('../Store');

const model = {
  aliasId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  namespaceKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  disabled: {
    type: DataTypes.BOOLEAN
  }
};

class Aliases extends Model {}

module.exports.Aliases = Aliases;

module.exports.model = model;

module.exports.init = async (sequelize, opts) => {
  Aliases.init(model, {
    sequelize,
    tableName: 'Aliases',
    freezeTableName: true,
    timestamps: false
  });

  const drive = store.getDrive();
  const collection = await drive.collection('Aliases');

  Aliases.addHook('afterCreate', async (alias, options) => {
    try {
      await collection.put(alias.aliasId, alias.dataValues);
    } catch (err) {
      console.log('Error saving Aliases to Hyperbee', err);
      throw new Error(err);
    }
  });

  Aliases.addHook('afterUpdate', async (alias, options) => {
    try {
      await collection.put(alias.aliasId, alias.dataValues);
    } catch (err) {
      console.log('Error saving Aliases to Hyperbee', err);
      throw new Error(err);
    }
  });

  Aliases.addHook('beforeDestroy', async (alias, options) => {
    try {
      await collection.del(alias.aliasId);
    } catch (err) {
      process.send({
        event: 'BeforeDestroy-deleteAliases',
        error: {
          name: err.name,
          message: err.message,
          stacktrace: err.stack
        }
      });
      throw new Error(err);
    }
  });

  return Aliases;
};
