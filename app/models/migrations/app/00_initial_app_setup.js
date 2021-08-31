const Account = require('../../account.model');
const Contact = require('../../contact.model');
const EmailLabel = require('../../emailLabel.model');
const File = require('../../file.model');
const Folder = require('../../folder.model');
const Label = require('../../label.model');
const Mailbox = require('../../mailbox.model');

module.exports = {
  up: async query => {
    await query.createTable('Account', Account.model);
    await query.createTable('Contact', Contact.model);
    await query.createTable('EmailLabel', EmailLabel.model);
    await query.createTable('File', File.model);
    await query.createTable('Folder', Folder.model);
    await query.createTable('Label', Label.model);
    await query.createTable('Mailbox', Mailbox.model);
  },
  down: async query => {
    await query.dropAllTables();
  }
};
