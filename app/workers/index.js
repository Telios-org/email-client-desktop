const userDataPath = process.argv[2];
const isDev = process.argv[3];

require('./Account.worker')(userDataPath); // eslint-disable-line
require('./Contacts.worker')();
require('./messageIngress.worker')(userDataPath);
require('./Mailbox.worker')(isDev); // eslint-disable-line
require('./File.worker')(); // eslint-disable-line
