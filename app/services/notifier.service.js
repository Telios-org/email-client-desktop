const worker = require('../workers/main.worker');
const { ipcRenderer } = require('electron');
const pkg = require('../../package.json');

class NotifierService {
  constructor() {
    worker.on('notify', m => {
      const { data, error } = m;

      if(error) {
        return console.log(error);
      }

      const { icon, title, message, metadata, sound } = data;

      ipcRenderer.send('notify', {
        appID: pkg.build.appId,
        icon,
        title,
        message,
        metadata,
        sound
      });
    });
  }
}

module.exports = NotifierService;
