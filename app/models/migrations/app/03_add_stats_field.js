const Sequelize = require('sequelize');

module.exports = {
  up: queryInterface => {
    return Promise.all([
      queryInterface.addColumn('Account', 'stats', {
        type: Sequelize.STRING
      })
    ]);
  },

  down: queryInterface => {
    return Promise.all([queryInterface.removeColumn('Account', 'stats')]);
  }
};
