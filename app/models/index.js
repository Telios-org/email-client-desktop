/* eslint-disable class-methods-use-this */
const path = require('path');
const { Sequelize } = require('sequelize');
const Corestore = require('corestore');
const Umzug = require('umzug');
const AccountModel = require('./account.model.js');
const ContactModel = require('./contact.model.js');
const EmailModel = require('./email.model.js');
const EmailLabelModel = require('./emailLabel.model.js');
const FileModel = require('./file.model.js');
const FolderModel = require('./folder.model.js');
const AliasModel = require('./alias.model');
const NamespaceModel = require('./aliasNamespace.model');
const LabelModel = require('./label.model.js');
const MailboxModel = require('./mailbox.model.js');

class Models {
  constructor(acctPath, password, { sparse, sync }) {
    this.path = acctPath;
    this.password = password;
    this.sparse = sparse;
    this.sync = sync;
    this.connections = [];
  }

  async initAll() {
    const asyncArr = [];
    const appModels = [
      MailboxModel,
      FolderModel,
      AliasModel,
      NamespaceModel,
      LabelModel,
      ContactModel,
      FileModel
    ];

    if (!this.sparse) {
      appModels.unshift(AccountModel);
    }

    const initAppDB = this.sequelizeDB({
      path: `${this.path}/app.db`,
      password: this.password,
      models: appModels,
      sync: this.sync
    });

    asyncArr.push(initAppDB);

    const initEmailDB = this.sequelizeDB({
      path: `${this.path}/email.db`,
      password: this.password,
      models: [EmailModel]
    });

    asyncArr.push(initEmailDB);

    return Promise.all(asyncArr);
  }

  async initAccount() {
    return new Promise((resolve, reject) => {
      this.sequelizeDB({
        path: `${this.path}/app.db`,
        password: this.password,
        models: [
          AccountModel
        ],
        sync: this.sync
      }).then(() => {
        resolve();
      })
        .catch(err => {
          reject(err);
        })
    });
  }

  async sequelizeDB(opts) {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const asyncArr = [];
          const sequelize = await new Sequelize(null, null, opts.password, {
            dialect: 'sqlite',
            dialectModulePath: '@journeyapps/sqlcipher',
            storage: opts.path,
            transactionType: 'IMMEDIATE'
          });

          const dbPath = opts.path.indexOf('app.db') > -1
            ? path.join(__dirname, 'migrations/app')
            : path.join(__dirname, 'migrations/email');

          const umzug = new Umzug({
            migrations: {
              // indicates the folder containing the migration .js files
              path: dbPath,
              // inject sequelize's QueryInterface in the migrations
              params: [sequelize.getQueryInterface()]
            },
            // indicates that the migration data should be store in the database
            // itself through sequelize. The default configuration creates a table
            // named `SequelizeMeta`.
            storage: 'sequelize',
            storageOptions: {
              sequelize
            }
          });

          await umzug.up();

          opts.models.forEach(Model => {
            asyncArr.push(Model.init(sequelize, opts));
          });

          await Promise.all(asyncArr);

          if (!opts.sync) {
            await sequelize.authenticate();
          }

          this.connections.push(sequelize);
          process.send({
            event: 'getAcctLog',
            data: `${opts.path} Connection has been successfully established.`
          });

          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  async close() {
    const asyncArr = [];

    this.connections.forEach(conn => {
      asyncArr.push(conn.close());
    });

    this.connections = [];

    await Promise.all(asyncArr);
  }
}

module.exports = Models;
