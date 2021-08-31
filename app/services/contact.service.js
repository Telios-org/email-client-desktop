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
      event: 'createContacts',
      payload: { contactList }
    });

    return new Promise((resolve, reject) => {
      worker.once('createContacts', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async getContactById(id) {
    worker.send({
      event: 'getContactById',
      payload: { id }
    });

    return new Promise((resolve, reject) => {
      worker.once('getContactById', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async updateContact(payload) {
    worker.send({
      event: 'updateContact',
      payload
    });

    return new Promise((resolve, reject) => {
      worker.once('updateContact', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async searchContact(searchQuery) {
    worker.send({
      event: 'searchContact',
      payload: { searchQuery }
    });

    return new Promise((resolve, reject) => {
      worker.once('searchContact', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async removeContact(id) {
    worker.send({
      event: 'removeContact',
      payload: { id }
    });

    return new Promise((resolve, reject) => {
      worker.once('removeContact', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async getAllContacts() {
    worker.send({
      event: 'getAllContacts',
      payload: {}
    });

    return new Promise((resolve, reject) => {
      worker.once('getAllContacts', m => {
        const { data, error } = m;

        if (error) return reject(error);

        return resolve(data);
      });
    });
  }
}

module.exports = ContactService;
