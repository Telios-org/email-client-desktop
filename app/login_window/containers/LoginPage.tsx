import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import WavyHeader from '../components/designElements/WavyHeader';
import WavyFooter from '../components/designElements/WavyFooter';
import FirstTimeScreen from '../components/FirstTimeScreen';
import PasswordTile from '../components/PasswordTile';
import styles from './LoginPage.css';

const themeUtils = require('../../utils/themes.util');
const LoginService = require('../../services/login.service');

const pkg = require('../../package.json');

type State = {
  accounts: {
    label: string;
    value: string;
  }[];
  activeWindow: string;
  isLoading: boolean;
};

type Props = {};
class LoginPage extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      accounts: [],
      activeWindow: 'first-screen',
      isLoading: true
    };

    this.handleUpdateActive = this.handleUpdateActive.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('dark-mode', (event, value) => {
      if (value) {
        themeUtils.switchCss('dark');
      } else {
        themeUtils.switchCss('light');
      }
    });

    const accounts = LoginService.getAccounts();
    const acct = accounts.map((a: string) => ({ label: a, value: a }));

    let screen = 'first-screen';

    if (acct.length > 0) {
      screen = 'login';
    }

    this.setState({
      accounts: acct,
      activeWindow: screen,
      isLoading: false
    });
  }

  handleUpdateActive(value) {
    this.setState({ activeWindow: value });
  }

  render() {
    const { activeWindow, accounts, isLoading } = this.state;

    return (
      <div
        className={`absolute w-full h-full flex flex-col overflow-hidden`}
      >
        <div className="h-full w-full">
          <div className={`absolute h-16 w-full ${styles.drag}`} />
          {activeWindow === 'first-screen' && (
            <FirstTimeScreen
              isLoading={isLoading}
              onUpdateActive={this.handleUpdateActive}
            />
          )}

          {activeWindow !== 'first-screen' && (
            <>
              <WavyHeader className="absolute" />

              <div className="p-8 pt-32 h-full">
                {activeWindow === 'login' && (
                  <Login
                    accounts={accounts}
                    onUpdateActive={this.handleUpdateActive}
                  />
                )}
                {activeWindow === 'register' && (
                  <Register
                    onUpdateActive={this.handleUpdateActive}
                    firstAccount={accounts.length === 0}
                  />
                )}
              </div>

              <WavyFooter className="absolute bottom-0 z-0" />

              <span className="absolute bottom-2 left-4 text-white z-10 select-none text-sm">
                <span>v</span>
                {pkg.version}
              </span>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default LoginPage;
