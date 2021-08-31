const { app, ipcMain } = require('electron');
const notifier = require('node-notifier');

module.exports = (windowManager) => {
  ipcMain.on('notify', async (event, data) => {
    const { icon, title, message, appID, sound, metadata } = data;
    const mainWindow = windowManager.getWindow('mainWindow');
    const isVisible = mainWindow.isVisible();
    const isFocused = mainWindow.isFocused()

    // Only show notifications when app is not active
    // TODO: Create user settings for turning on/off notifications
    if(!isVisible || !isFocused) {
      notifier.notify(
        {
          icon,
          title,
          message,
          appID,
          sound
        },
        function(err, response) {
          // Only bring app to the foreground if the notification was clicked
          if(response !== 'timeout') {
            mainWindow.show();
          }
        }
      );
    }
  });
}
