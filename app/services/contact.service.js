const clone = require('rfdc')();
const channel = require('./main.channel');

class ContactService {
  static async createContacts(contacts) {
    const contactList = contacts.map(contact => {
      const c = clone(contact);
      if (c.address && !Array.isArray(c.address)) {
        delete c.address;
        return { ...c, email: contact.address };
      }
      return c;
    });

    channel.send({
      event: 'contact:createContacts',
      payload: { contactList }
    });

    return new Promise((resolve, reject) => {
      channel.once('contact:createContacts:callback', m => {
        const { error, data } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async getContactById(id) {
    channel.send({
      event: 'contact:getContactById',
      payload: { id }
    });

    return new Promise((resolve, reject) => {
      channel.once('contact:getContactById:callback', m => {
        const { error, data } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async updateContact(payload) {
    channel.send({
      event: 'contact:updateContact',
      payload
    });

    return new Promise((resolve, reject) => {
      channel.once('contact:updateContact:callback', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async searchContact(searchQuery) {
    channel.send({
      event: 'contact:searchContact',
      payload: { searchQuery }
    });

    return new Promise((resolve, reject) => {
      channel.once('contact:searchContact:callback', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async removeContact(id) {
    channel.send({
      event: 'contact:removeContact',
      payload: { id }
    });

    return new Promise((resolve, reject) => {
      channel.once('contact:removeContact:callback', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async getAllContacts() {
    channel.send({
      event: 'contact:getAllContacts',
      payload: {}
    });

    return new Promise((resolve, reject) => {
      channel.once('contact:getAllContacts:callback', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }
}

module.exports = ContactService;
