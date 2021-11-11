const Sequelize = require('sequelize');
const { Mailbox } = require('./mailbox.model');
const { Model } = require('sequelize');
const store = require('../Store');

const model = {
  labelId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  color: {
    type: Sequelize.STRING
  },
  // Timestamps
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
};

class Label extends Model {}

module.exports.Label = Label;

module.exports.model = model;

module.exports.init = async (sequelize, opts) => {
  Label.init(model, {
    sequelize,
    tableName: 'Label',
    freezeTableName: true,
    timestamps: true
  });

  Mailbox.hasMany(Label, { as: 'labels' });
  Label.belongsTo(Mailbox);

  const drive = store.getDrive();
  const collection = await drive.db.collection('Label');

  return Label;
};
