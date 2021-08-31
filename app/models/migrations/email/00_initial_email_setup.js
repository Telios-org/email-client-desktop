const Email = require('../../email.model');

module.exports = {
  up: async query => {
    await query.createTable('Email', Email.model);
  },
  down: async query => {
    await query.dropAllTables();
  }
};
