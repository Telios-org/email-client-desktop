const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');
const { fork } = require('child_process');
const { remote } = require('electron');
const Store = require('electron-store');

const isDev = process.env.NODE_ENV === 'development';

const appPath = remote.app.getAppPath();
const userDataPath = remote.app.getPath('userData');

const channelPath = path.join(appPath, '/node_modules/@telios/telios-client-backend/index.js');
let cwd = path.join(__dirname, '..');

if (!fs.existsSync(path.join(cwd, 'app.asar'))) {
  cwd = null;
}
class Channel extends EventEmitter {
  constructor() {
    super();

    this.store = new Store();

    let pids = this.store.get('pids');

    if(typeof pids !== 'object') {
      pids = [];
    }

    this.process = fork(channelPath, [userDataPath + '/Accounts', process.env.NODE_ENV], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      cwd
    });

    pids.push(this.process.pid);

    this.store.set('pids', pids);

    this.process.stderr.on('data', data => {
      // if(isDev) {
      console.log(data.toString())
      //console.error(data.toString());
      // }
    });

    this.process.stderr.on('error', data => {
      console.log(data)
      //console.error(data.toString());
    });

    this.process.on('message', m => {
      console.timeEnd('processSend')
      // if(isDev) {
      console.log(m);
      // }

      const { event, error, data } = m;
      this.emit(event, { error, data });
    });
  }

  send(payload) {
    console.time('processSend')
    this.process.send(payload);
  }
}

const instance = new Channel();

module.exports = instance;
