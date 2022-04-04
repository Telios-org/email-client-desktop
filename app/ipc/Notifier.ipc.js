const { app, ipcMain, Notification } = require('electron');
const notifier = require('node-notifier');
const path = require('path');
const sound = require('sound-play');

module.exports = (windowManager) => {
  ipcMain.on('notify', async (event, data) => {
    const { title, message, appID, metadata } = data;
    const mainWindow = windowManager.getWindow('mainWindow');
    const isVisible = mainWindow.isVisible();
    const isFocused = mainWindow.isFocused();

    // Only show notifications when app is not active
    // TODO: Create user settings for turning on/off notifications
    if(!isVisible || !isFocused) {
      new Notification({ 
        title, 
        body: message,
        silent: true
      }).show();
      
      sound.play(path.join(__dirname, '../sounds/bubble.wav'), 0.15);

      // notifier.notify(
      //   {
      //     icon: path.join(__dirname, '../img/telios_notify_icon.png'),
      //     title,
      //     message,
      //     appID,
      //     sound
      //   },
      //   function(err, response) {
      //     // TODO: select message and bring window to foreground when clicked
      //     // Only bring app to the foreground if the notification was clicked
      //     // if(response !== 'timeout') {
      //     //   mainWindow.show();
      //     // }
      //   }
      // );
    }
  });
}
