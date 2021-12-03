const { Mailbox } = require('../../mailbox.model');

module.exports = {
  up: async query => {
    Mailbox.findOne({ 
      where: { 
        mailboxId: 1 
      } 
    }).then(mailbox => {
      // Sanitize mailboxes that were created with capitalized chars
      if(mailbox && mailbox.address) {
        return mailbox.update({ address: mailbox.address.toLowerCase() });
      }
    });
  },
  down: async query => {
  }
};
