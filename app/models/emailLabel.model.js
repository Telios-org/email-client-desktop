const Sequelize = require('sequelize');
const { Model } = require('sequelize');
const store = require('../Store');

const model = {
  emailId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  labelId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  // Timestamps
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
};

class EmailLabel extends Model {}

module.exports.EmailLabel = EmailLabel;

module.exports.model = model;

module.exports.init = async (sequelize, opts) => {
  EmailLabel.init(model, {
    sequelize,
    tableName: 'EmailLabel',
    freezeTableName: true,
    timestamps: true
  });

  const drive = store.getDrive();
  const collection = await drive.db.collection('EmailLabel');

  return EmailLabel;
};
