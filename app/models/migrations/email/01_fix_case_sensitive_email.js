const { Mailbox } = require('../../mailbox.model');

module.exports = {
  up: async query => {
    try {
      const mailbox = await Mailbox.findOne({ 
        where: { 
          mailboxId: 1 
        } 
      })

      // Sanitize mailboxes that were created with capitalized chars
      if(mailbox && mailbox.address) {
        return mailbox.update({ address: mailbox.address.toLowerCase() });
      }

    } catch(e) {
      // Mailbox does not exist
    }
  },
  down: async query => {
  }
};
