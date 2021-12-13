const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');
const { fork } = require('child_process');
const { remote } = require('electron');
const Store = require('electron-store');

const isDev = process.env.NODE_ENV === 'development';

const appPath = remote.app.getAppPath();
const userDataPath = remote.app.getPath('userData');

const workerPath = path.join(appPath, '/workers/index.js');
let cwd = path.join(__dirname, '..');

if (!fs.existsSync(path.join(cwd, 'app.asar'))) {
  cwd = null;
}
class MainWorker extends EventEmitter {
  constructor() {
    super();

    this.store = new Store();

    let pids = this.store.get('pids');

    if(typeof pids !== 'object') {
      pids = [];
    }

    this.process = fork(workerPath, [userDataPath, process.env.NODE_ENV], {
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
      // if(isDev) {
      console.log(m);
      // }

      const { event, error, data } = m;
      this.emit(event, { error, data });
    });
  }

  send(payload) {
    this.process.send(payload);
  }
}

const instance = new MainWorker();

module.exports = instance;
