const clone = require('rfdc')();
const worker = require('../workers/main.worker');

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

    worker.send({
      event: 'contact:createContacts',
      payload: { contactList }
    });

    return new Promise((resolve, reject) => {
      worker.once('contact:createContacts:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });

      worker.once('contact:createContacts:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }

  static async getContactById(id) {
    worker.send({
      event: 'contact:getContactById',
      payload: { id }
    });

    return new Promise((resolve, reject) => {
      worker.once('contact:getContactById:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });

      worker.once('contact:getContactById:success', m => {
        const { data } = m;
        return resolve(data);
      });
    });
  }

  static async updateContact(payload) {
    worker.send({
      event: 'contact:updateContact',
      payload
    });

    return new Promise((resolve, reject) => {
      worker.once('contact:updateContact:error', m => {
        const { error } = m;
        if (error) return reject(error);
      });

      worker.once('contact:updateContact:success', m => {
        const { data, error } = m;

        // if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async searchContact(searchQuery) {
    worker.send({
      event: 'contact:searchContact',
      payload: { searchQuery }
    });

    return new Promise((resolve, reject) => {
      worker.once('contact:searchContact:success', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async removeContact(id) {
    worker.send({
      event: 'contact:removeContact',
      payload: { id }
    });

    return new Promise((resolve, reject) => {
      worker.once('contact:removeContact:success', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async getAllContacts() {
    worker.send({
      event: 'contact:getAllContacts',
      payload: {}
    });

    return new Promise((resolve, reject) => {
      worker.once('contact:getAllContacts:success', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }
}

module.exports = ContactService;
