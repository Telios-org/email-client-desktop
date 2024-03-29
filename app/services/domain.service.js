const clone = require('rfdc')();
const channel = require('./main.channel');

class DomainService {
  static async isAvailable(domain) {
    channel.send({ event: 'domain:isAvailable', payload: { domain } });
    return new Promise((resolve, reject) => {
      channel.once('domain:isAvailable:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async register(domain) {
    channel.send({ event: 'domain:register', payload: { domain } });
    return new Promise((resolve, reject) => {
      channel.once('domain:register:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async verifyOwnership(domain) {
    channel.send({ event: 'domain:verifyOwnership', payload: { domain } });
    return new Promise((resolve, reject) => {
      channel.once('domain:verifyOwnership:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async verifyDNS(domain) {
    channel.send({ event: 'domain:verifyDNS', payload: { domain } });
    return new Promise((resolve, reject) => {
      channel.once('domain:verifyDNS:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async getByName(domain) {
    channel.send({
      event: 'domain:getDomainByName',
      payload: { name: domain }
    });
    return new Promise((resolve, reject) => {
      channel.once('domain:getDomainByName:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async getAll() {
    channel.send({ event: 'domain:getDomains', payload: {} });
    return new Promise((resolve, reject) => {
      channel.once('domain:getDomains:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async delete(domain) {
    channel.send({ event: 'domain:delete', payload: { domain } });
    return new Promise((resolve, reject) => {
      channel.once('domain:delete:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async registerMailbox(payload) {
    channel.send({ event: 'domain:registerMailbox', payload });
    return new Promise((resolve, reject) => {
      channel.once('domain:registerMailbox:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async resendMailboxInvitation(payload) {
    channel.send({ event: 'domain:resendMailboxInvite', payload });
    return new Promise((resolve, reject) => {
      channel.once('domain:resendMailboxInvite:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async deleteMailbox(payload) {
    channel.send({ event: 'domain:deleteMailbox', payload });
    return new Promise((resolve, reject) => {
      channel.once('domain:deleteMailbox:callback', m => {
        const { error, data } = m;
        if (error) return reject(error);

        return resolve(data);
      });
    });
  }

  static async updateMailbox(payload) {
    // channel.send({ event: 'domain:updateMailbox', payload });
    // return new Promise((resolve, reject) => {
    //   channel.once('domain:updateMailbox:callback', m => {
    //     const { error, data } = m;
    //     if (error) return reject(error);

    //     return resolve(data);
    //   });
    // });
  }
}

module.exports = DomainService;
