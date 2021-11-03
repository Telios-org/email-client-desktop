/* eslint-disable no-param-reassign */
const Sequelize = require('sequelize');
const { Model } = require('sequelize');
const store = require('../Store');

const model = {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  emailId: {
    type: Sequelize.STRING
  },
  folderId: {
    type: Sequelize.INTEGER
  },
  filename: {
    type: Sequelize.STRING,
    allowNull: false
  },
  contentType: {
    type: Sequelize.STRING,
    allowNull: false
  },
  size: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  drive: {
    type: Sequelize.STRING
  },
  path: {
    type: Sequelize.STRING
  },
  key: {
    type: Sequelize.STRING
  },
  header: {
    type: Sequelize.STRING
  },
  hash: {
    type: Sequelize.STRING
  },
  feed: {
    type: Sequelize.STRING
  },
  // Timestamps
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
};

class File extends Model {}

module.exports.File = File;

module.exports.model = model;

module.exports.init = async (sequelize, opts) => {
  File.init(model, {
    sequelize,
    tableName: 'File',
    freezeTableName: true,
    timestamps: true
  });

  const drive = store.getDrive();
  const collection = await drive.db.collection('__File'); // Use default file collection from drive. Creating another one would be duplicative

  File.addHook('beforeDestroy', async (file, options) => {
    try {
      if (!Array.isArray(file)) {
        await drive.unlink(file.path);
        process.send({ event: 'File-deleteFileFromDBLOG', data: file });
      }
    } catch (err) {
      console.log('Unable to remove File from Hyperbee', err);
      throw new Error(err);
    }
  });

  return File;
};
