const { AliasNamespace } = require('../../aliasNamespace.model');
const { Alias } = require('../../alias.model');

module.exports = {
  up: async query => {
    const promises = [];
    console.log(
      'APP',
      AliasNamespace.tableName,
      Alias.tableName,
      AliasNamespace,
      Alias
    );

    return query.sequelize.transaction(t => {
      const promise = [];
      promises.push(
        query.sequelize.query(`UPDATE Namespace SET name=LOWER(name);`, {
          transaction: t
        })
      );

      promises.push(
        query.sequelize.query(
          `UPDATE Alias SET name=LOWER(name), aliasId=LOWER(aliasId), namespaceKey=LOWER(namespaceKey);`, {
            transaction: t
          }
        )
      );

      return Promise.all(promises);
    });
  },
  down: async query => {}
};
