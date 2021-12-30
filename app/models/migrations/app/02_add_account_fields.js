const Sequelize = require('sequelize');

module.exports = {
  up: queryInterface => {
    return Promise.all([
      queryInterface.addColumn('Account', 'displayName', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('Account', 'avatar', {
        type: Sequelize.BLOB('medium')
      })
    ]);
  },

  down: queryInterface => {
    return Promise.all([
      queryInterface.removeColumn('Account', 'displayName'),
      queryInterface.removeColumn('Account', 'avatar')
    ]);
  }
};
