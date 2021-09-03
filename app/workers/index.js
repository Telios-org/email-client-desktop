const userDataPath = process.argv[2];
const env = process.argv[3];

require('./Account.worker')(userDataPath); // eslint-disable-line
require('./Contacts.worker')();
require('./messageIngress.worker')(userDataPath);
require('./Mailbox.worker')(env); // eslint-disable-line
require('./File.worker')(); // eslint-disable-line
