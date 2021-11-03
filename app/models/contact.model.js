const Sequelize = require('sequelize');
const { Model } = require('sequelize');
const store = require('../Store');

const model = {
  contactId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  givenName: {
    type: Sequelize.STRING
  },
  familyName: {
    type: Sequelize.STRING
  },
  nickname: {
    type: Sequelize.STRING
  },
  birthday: {
    type: Sequelize.DATE
  },
  publicKey: {
    type: Sequelize.STRING
  },
  pgpPublicKey: {
    type: Sequelize.STRING
  },
  photo: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  phone: {
    /*
        Takes in Array of Object
        {
          type: DataTypes.STRING,
          value: DataTypes.STRING
        }
      */
    type: Sequelize.JSON
  },
  address: {
    /*
        Takes in Array of Object
        {
            street: DataTypes.STRING,
            street2: DataTypes.STRING
            city: DataTypes.STRING,
            state: DataTypes.STRING,
            postalCode: DataTypes.STRING,
            country: DataTypes.STRING,
            type: DataTypes.STRING
          }
        */
    type: Sequelize.JSON
  },
  website: Sequelize.STRING,
  notes: Sequelize.STRING,
  organization: {
    /*
        Takes in Array of Object
        {
          name: DataTypes.STRING,
          jobTitle: DataTypes.STRING
        }
      */
    type: Sequelize.JSON
  },
  // Timestamps
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
};

class Contact extends Model {}

module.exports.Contact = Contact;

module.exports.model = model;

module.exports.init = async (sequelize, opts) => {
  Contact.init(model, {
    sequelize,
    tableName: 'Contact',
    freezeTableName: true,
    timestamps: true
  });

  const drive = store.getDrive();
  const collection = await drive.db.collection('Contact');

  Contact.addHook('afterCreate', async (contact, options) => {
    try {
      await collection.put(contact.contactId, contact.dataValues);
    } catch (err) {
      console.log('Error saving Contact to Hyperbee', err);
    }
  });

  Contact.addHook('afterUpdate', async (contact, options) => {
    try {
      await collection.put(contact.contactId, contact.dataValues);
    } catch (err) {
      console.log('Error updating Contact in Hyperbee', err);
    }
  });

  Contact.addHook('beforeDestroy', async (contact, options) => {
    try {
      if (!Array.isArray(contact)) {
        await collection.del(contact.dataValues.contactId);
      }
    } catch (err) {
      console.log('Unable to remove Contact from Hyperbee', err);
      throw new Error(err);
    }
  });

  return Contact;
};
