/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from 'react';
import { Col, FlexboxGrid } from 'rsuite';
import min10 from './img/min-w-10.png';
import min12 from './img/min-w-12.png';
import min15 from './img/min-w-15.png';
import min20 from './img/min-w-20.png';
import min24 from './img/min-k-24.png';
import min30 from './img/min-k-30.png';

import max10 from './img/max-w-10.png';
import max12 from './img/max-w-12.png';
import max15 from './img/max-w-15.png';
import max20 from './img/max-w-20.png';
import max24 from './img/max-k-24.png';
import max30 from './img/max-k-30.png';

import restore10 from './img/restore-w-10.png';
import restore12 from './img/restore-w-12.png';
import restore15 from './img/restore-w-15.png';
import restore20 from './img/restore-w-20.png';
import restore24 from './img/restore-k-24.png';
import restore30 from './img/restore-k-30.png';

import close10 from './img/close-w-10.png';
import close12 from './img/close-w-12.png';
import close15 from './img/close-w-15.png';
import close20 from './img/close-w-20.png';
import close24 from './img/close-k-24.png';
import close30 from './img/close-k-30.png';

import styles from './WindowControls.css';

const { remote, ipcRenderer } = require('electron');
const os = require('os');

const win = remote.getCurrentWindow();


const platforms = {
  WINDOWS: 'WINDOWS',
  MAC: 'MAC',
  LINUX: 'LINUX',
  SUN: 'SUN',
  OPENBSD: 'OPENBSD',
  ANDROID: 'ANDROID',
  AIX: 'AIX'
};

const platformsNames = {
  win32: platforms.WINDOWS,
  darwin: platforms.MAC,
  linux: platforms.LINUX,
  sunos: platforms.SUN,
  openbsd: platforms.OPENBSD,
  android: platforms.ANDROID,
  aix: platforms.AIX,
};

export default class WindowControls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMaximized: false,
      showControls: false
    };

    this.toggleMaxRestoreButtons = this.toggleMaxRestoreButtons.bind(this);
    this.handleWindowControl = this.handleWindowControl.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    const state = { ...this.state };
    // const isWindowsOS = window.navigator.appVersion.indexOf('Win') > -1;
    const currentPlatform = platformsNames[os.platform()];
    let { isMaximized } = state;

    if (currentPlatform !== 'MAC') {
      this.setState({ showControls: true });
    } else {
      return;
    }

    ipcRenderer.on('maximize', () => {
      isMaximized = true;
      this.setState({ isMaximized });
    });
    ipcRenderer.on('unmaximize', () => {
      isMaximized = false;
      this.setState({ isMaximized });
    });
  }

  toggleMaxRestoreButtons() {
    const state = { ...this.state };
    let { isMaximized } = state;

    if (isMaximized) {
      isMaximized = false;
      this.setState({ isMaximized });
    } else {
      isMaximized = true;
      this.setState({ isMaximized });
    }
  }

  handleWindowControl(buttonType) {
    if (buttonType === 'min') {
      win.minimize();
    }
    if (buttonType === 'max') {
      win.maximize();
      this.toggleMaxRestoreButtons();
    }
    if (buttonType === 'restore') {
      win.unmaximize();
      this.toggleMaxRestoreButtons();
    }
    if (buttonType === 'close') {
      win.close();
    }
  }

  render() {
    const { isMaximized, showControls } = this.state;

    return (
      <div>
        {showControls && (
          <div className={styles.windowControls}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                this.handleWindowControl('min');
              }}
              className={`${styles.button} outline-none`}
            >
              <img
                alt="minimize"
                className="icon"
                srcSet={`${min20} 1.75x`}
                draggable="false"
              />
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                this.handleWindowControl('max');
              }}
              className={`${styles.button} outline-none`}
              style={{ display: isMaximized ? 'none' : 'block' }}
            >
              <img
                alt="maximize"
                className="icon"
                srcSet={`${max20} 1.75x`}
                draggable="false"
              />
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                this.handleWindowControl('restore');
              }}
              className={`${styles.button} outline-none`}
              style={{ display: isMaximized ? 'block' : 'none' }}
            >
              <img
                alt="restore"
                className="icon"
                srcSet={`${restore20} 1.75x`}
              />
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                this.handleWindowControl('close');
              }}
              className={`${styles.closeButton} outline-none`}
            >
              <img
                alt="close"
                className="icon"
                srcSet={`${close20} 1.75x`}
                draggable="false"
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}
