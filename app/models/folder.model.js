const { DataTypes } = require('sequelize');
const { Model } = require('sequelize');
const store = require('../Store');

module.exports.DefaultFolders = [
  {
    id: 1,
    name: 'Inbox',
    type: 'default',
    icon: 'inbox',
    seq: 1
  },
  {
    id: 2,
    name: 'Drafts',
    type: 'default',
    icon: 'pencil',
    seq: 2
  },
  {
    id: 3,
    name: 'Sent',
    type: 'default',
    icon: 'send-o',
    seq: 3
  },
  {
    id: 4,
    name: 'Trash',
    type: 'default',
    icon: 'trash-o',
    seq: 4
  },
  {
    id: 5,
    name: 'Alias',
    type: 'hidden',
    icon: null,
    seq: 5
  }
];

const model = {
  folderId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mailboxId: {
    type: DataTypes.INTEGER
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING
  },
  count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  icon: {
    type: DataTypes.STRING
  },
  color: {
    type: DataTypes.STRING
  },
  seq: {
    type: DataTypes.INTEGER
  },
  // Timestamps
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
};

class Folder extends Model { }

module.exports.Folder = Folder;

module.exports.model = model;

module.exports.init = async (sequelize, opts) => {
  Folder.init(model, {
    sequelize,
    tableName: 'Folder',
    freezeTableName: true,
    timestamps: true
  });

  const drive = store.getDrive();
  const collection = await drive.db.collection('Folder');

  Folder.addHook('afterCreate', async (folder, options) => {
    try {
      await collection.put(folder.folderId, folder.dataValues);
    } catch (err) {
      console.log('Error saving Folder to Hyperbee', err);
      throw new Error(err);
    }
  });

  Folder.addHook('afterUpdate', async (folder, options) => {
    try {
      await collection.put(folder.folderId, folder.dataValues);
    } catch (err) {
      console.log('Error saving Folder to Hyperbee', err);
      throw new Error(err);
    }
  });

  Folder.addHook('beforeDestroy', async (folder, options) => {
    try {
      await collection.del(folder.folderId);
    } catch (err) {
      process.send({
        event: 'BeforeDestroy-deleteFolder', error: {
          name: err.name,
          message: err.message,
          stacktrace: err.stack
        }
      });
      throw new Error(err);
    }
  });

  return Folder;
};
