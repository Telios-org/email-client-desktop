const { DataTypes } = require('sequelize');
const { Model } = require('sequelize');
const store = require('../Store');

const model = {
  aliasId: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  namespaceKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fwdAddresses: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  disabled: {
    type: DataTypes.BOOLEAN
  },
  whitelisted: {
    type: DataTypes.BOOLEAN
  },
  // Timestamps
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
};

class Alias extends Model {}

module.exports.Alias = Alias;

module.exports.model = model;

module.exports.init = async (sequelize, opts) => {
  Alias.init(model, {
    sequelize,
    tableName: 'Alias',
    freezeTableName: true,
    timestamps: true
  });

  const drive = store.getDrive();
  const collection = await drive.db.collection('Alias');

  Alias.addHook('afterCreate', async (alias, options) => {
    try {
      await collection.put(alias.aliasId, alias.dataValues);
    } catch (err) {
      console.log('Error saving Alias to Hyperbee', err);
      throw new Error(err);
    }
  });

  Alias.addHook('afterUpdate', async (alias, options) => {
    try {
      await collection.put(alias.aliasId, alias.dataValues);
    } catch (err) {
      console.log('Error saving Alias to Hyperbee', err);
      throw new Error(err);
    }
  });

  Alias.addHook('beforeDestroy', async (alias, options) => {
    try {
      await collection.del(alias.aliasId);
    } catch (err) {
      process.send({
        event: 'BeforeDestroy-deleteAlias',
        error: {
          name: err.name,
          message: err.message,
          stacktrace: err.stack
        }
      });
      throw new Error(err);
    }
  });

  return Alias;
};
