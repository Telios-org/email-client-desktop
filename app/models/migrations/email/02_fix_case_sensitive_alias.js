const { Op } = require('sequelize');
const { Email } = require('../../email.model');

module.exports = {
  up: async query => {
    console.log('EMAIL', Email.tableName, Email);
    try {
      return query.sequelize.query(`UPDATE Email SET aliasId=LOWER(aliasId);`);
    } catch (e) {
      // Mailbox does not exist
      console.log('EMAIL MIG', e);
    }
  },
  down: async query => {}
};
