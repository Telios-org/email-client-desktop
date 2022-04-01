const channel = require('./main.channel');
const { ipcRenderer } = require('electron');
const pkg = require('../../package.json');

class NotifierService {
  constructor() {
    channel.on('notify', m => {
      const { data, error } = m;

      if(error) {
        return console.log(error);
      }

      const { title, message, metadata, sound } = data;

      ipcRenderer.send('notify', {
        appID: pkg.build.appId,
        title,
        message,
        metadata,
        sound
      });
    });
  }
}

module.exports = NotifierService;
