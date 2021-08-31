const Sequelize = require('sequelize');
const { Contact } = require('../models/contact.model');

const { Op } = Sequelize;
module.exports = () => {
  process.on('message', async data => {
    const { event, payload } = data;

    if (event === 'createContacts') {
      const { contactList } = payload;

      Contact.bulkCreate(contactList, {
        updateOnDuplicate: ['email'],
        individualHooks: true
      })
        .then(res => {
          return process.send({ event: 'createContacts', data: res });
        })
        .catch(e => {
          process.send({ event: 'createContacts', error: e.message });
        });
    }

    if (event === 'getContactById') {
      const { id } = payload;

      Contact.findAll({
        where: { contactId: id },
        raw: true
      })
        .then(contact => {
          return process.send({ event: 'getContactById', data: null });
        })
        .catch(e => {
          process.send({ event: 'getContactById', error: e.message });
        });
    }

    if (event === 'updateContact') {
      try {
        await Contact.update(payload, {
          where: {
            contactId: payload.id
          },
          individualHooks: true
        });
        process.send({ event: 'updateContact', data: null });
      } catch (e) {
        process.send({ event: 'updateContact', error: e.message });
      }
    }

    if (event === 'searchContact') {
      const { searchQuery } = payload;

      Contact.findAll({
        attributes: ['photo', ['email', 'address'], 'name'],
        where: {
          [Op.or]: [
            { email: { [Op.like]: `%${searchQuery}%` } },
            { name: { [Op.like]: `%${searchQuery}%` } }
          ]
        },
        raw: true
      })
        .then(contact => {
          return process.send({ event: 'searchContact', data: contact });
        })
        .catch(e => {
          process.send({ event: 'searchContact', error: e.message });
        });
    }

    if (event === 'removeContact') {
      const { id } = payload;

      Contact.destroy({
        where: { contactId: id },
        individualHooks: true
      })
        .then(() => {
          return process.send({ event: 'removeContact', data: null });
        })
        .catch(e => {
          process.send({ event: 'removeContact', error: e.message });
        });
    }

    if (event === 'getAllContacts') {
      try {
        const contacts = await Contact.findAll({
          attributes: [
            ['contactId', 'id'],
            'name',
            'givenName',
            'familyName',
            'nickname',
            'birthday',
            'photo',
            'email',
            'phone',
            'address',
            'website',
            'notes',
            'organization'
          ],
          raw: true
        });

        process.send({ event: 'getAllContacts', data: contacts });
        return contacts;
      } catch (e) {
        process.send({ event: 'getAllContacts', error: e.message });
      }
    }
  });
};
