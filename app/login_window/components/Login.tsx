import React, { Component } from 'react';
import { BsLock } from 'react-icons/bs';
import {
  InputPicker,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  InputGroup,
  Button,
  Schema
} from 'rsuite';
import { Show, Hide, Lock } from 'react-iconly';
import Store from 'electron-store';
import i18n from '../../i18n/i18n';

const { ipcRenderer, remote } = require('electron');
const fs = require('fs');
const LoginService = require('../../services/login.service');

const { dialog } = remote;

const { StringType } = Schema.Types;
const errorStyles = errorVisible => {
  return {
    display: errorVisible ? 'block' : 'none',
    color: 'red',
    marginTop: 6
  };
};

// THE FUNCTIONS BELOW SHOULD BE MOVED TO A SEPARATE UTILITY FILE PROBABLY
const initAccount = async (name, password) => {
  let account;

  try {
    account = await LoginService.initAccount(password, name);
  } catch (err) {
    console.log('INITACCOUNT ERR', err);
  }

  if (account?.error?.message?.indexOf('Unable to decrypt message') > -1) {
    ipcRenderer.send('restartMainWindow');
    throw i18n.t('login.incorrectPass');
  }

  if (account?.error?.message?.indexOf('ELOCKED') > -1) {
    ipcRenderer.send('restartMainWindow');
    throw account.error.message;
  }

  return account;
};

// const loadMailbox = async () => {
//   try {
//     await LoginService.loadMailbox();
//   } catch (err) {
//     console.log(err);
//   }
// };

const goToMainWindow = account => {
  ipcRenderer.send('showMainWindow', account);
};
// END OF WHAT SHOULD BE MOVED

const formModel = Schema.Model({
  masterpass: StringType()
});

type Props = {
  accounts: {
    label: string;
    value: string;
  }[];
  onUpdateActive: (value: string) => void;
};

type State = {
  selectedAccount: string | null;
  formValue: Record<string, any>;
  formError: string | null;
  canSubmit: boolean;
  loading: boolean;
  visiblePassword: boolean;
  showMigrationScreen: boolean;
  account: any;
};

class Login extends Component<Props, State> {
  inputStyle = {
    width: '100%'
  };

  constructor(props: Props) {
    super(props);

    this.store = new Store();

    let lastAccount = this.store.get('lastAccount');

    if (!lastAccount && props.accounts.length === 1) {
      lastAccount = props.accounts[0].value;
    }

    this.state = {
      selectedAccount: lastAccount,
      formValue: {
        masterpass: ''
      },
      formError: null,
      canSubmit: false,
      loading: false,
      visiblePassword: false,
      showMigrationScreen: false,
      account: null
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChangeSelectedAccount = this.onChangeSelectedAccount.bind(this);
    this.clearState = this.clearState.bind(this);
    this.togglePassword = this.togglePassword.bind(this);
  }

  async handleLogin() {
    const {
      selectedAccount,
      formValue: { masterpass }
    } = this.state;

    try {
      this.store.set('lastAccount', selectedAccount);
      const accountMigrated = await LoginService.checkMigrationStatus(
        selectedAccount
      );

      if (accountMigrated) {
        const account = await initAccount(selectedAccount, masterpass);
        goToMainWindow(account);
        this.clearState();
      } else {
        this.setState({ showMigrationScreen: true });
        const account = await initAccount(selectedAccount, masterpass);

        if (account.mnemonic) {
          this.setState({
            showMigrationScreen: false,
            account
          });
        }
      }
    } catch (err) {
      let error = null;
      if (typeof err === 'string') {
        error = err;
      }
      this.setState({
        loading: false,
        formError: error
      });
      console.log(err);
    }
  }

  handleSubmit() {
    this.setState({
      loading: true
    });
    this.handleLogin();
  }

  handleCheck(formValue: Record<string, any>) {
    if (!formValue.masterpass) {
      this.setState({
        canSubmit: false,
        formValue
      });
      return;
    }
    this.setState({
      canSubmit: true,
      formValue
    });
  }

  onChangeSelectedAccount(account: string) {
    this.setState({
      selectedAccount: account
    });
  }

  clearState() {
    const { formValue } = this.state;

    this.setState({
      formValue: {
        ...formValue,
        masterpass: ''
      },
      formError: null,
      canSubmit: false,
      loading: false
    });
  }

  togglePassword() {
    const { visiblePassword } = this.state;
    this.setState({ visiblePassword: !visiblePassword });
  }

  // For migration
  // eslint-disable-next-line class-methods-use-this
  async saveKey(key: string) {
    try {
      const { filePath } = await dialog.showSaveDialog({
        title: 'Save Passphrase',
        defaultPath: 'passphrase.txt',
        filters: [{ name: 'Text file', extensions: ['txt'] }]
      });

      if (filePath) {
      fs.writeFileSync(filePath, key, 'utf-8'); // eslint-disable-line
      }
    } catch (error) {
      console.log('Recovery File Saving Error', error);
    }
  }

  render() {
    const {
      selectedAccount,
      formError,
      formValue,
      canSubmit,
      loading,
      visiblePassword,
      showMigrationScreen,
      account
    } = this.state;
    const { accounts, onUpdateActive } = this.props;

    if (accounts.length > 0 && !showMigrationScreen && account === null) {
      return (
        <div className="flex flex-col h-full">
          <div className="text-2xl text-gray-700 font-semibold mb-6 select-none">
            {i18n.t('global.login')}
          </div>
          <div className="text-sm text-gray-500 mb-8 select-none">
            {i18n.t('login.text')}
          </div>

          <InputPicker
            data={accounts}
            disabled={loading}
            defaultValue={selectedAccount}
            menuClassName="text-sm"
            cleanable={false}
            onChange={this.onChangeSelectedAccount}
            block
          />

          <Form
            ref={ref => (this.form = ref)}
            className="text-sm mt-5"
            model={formModel}
            formValue={formValue}
            onChange={newVal => {
              this.handleCheck(newVal);
            }}
          >
            <FormGroup>
              <ControlLabel className="font-medium mb-2 text-gray-500 select-none">
                {i18n.t('global.masterPass')}
              </ControlLabel>
              <InputGroup style={this.inputStyle} inside>
                <InputGroup.Addon>
                  <Lock
                    size="small"
                    set="broken"
                    className="mr-1 text-gray-400"
                  />
                </InputGroup.Addon>
                <FormControl
                  disabled={loading}
                  name="masterpass"
                  type={`${visiblePassword ? 'text' : 'password'}`}
                />
                <InputGroup.Addon>
                  {!visiblePassword && (
                    <Hide
                      size="small"
                      set="broken"
                      onClick={this.togglePassword}
                      className="lr-1 text-gray-400 hover:text-purple-600"
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                  {visiblePassword && (
                    <Show
                      size="small"
                      set="broken"
                      onClick={this.togglePassword}
                      className="lr-1 text-gray-400 hover:text-purple-600"
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                </InputGroup.Addon>
              </InputGroup>
              <div style={errorStyles(formError)}>{formError}</div>
            </FormGroup>
            <Button
              disabled={!canSubmit}
              loading={loading}
              onClick={this.handleSubmit}
              type="submit"
              appearance="primary"
              className="mt-5 mb-5 select-none"
              block
            >
              {i18n.t('global.login')}
            </Button>
          </Form>
          <Button
            className="select-none"
            disabled={loading}
            onClick={() => {
              onUpdateActive('register');
            }}
            appearance="link"
            block
          >
            {i18n.t('login.register')}
          </Button>
        </div>
      );
    }
    // the below is only for nebula migration purposes (Feb 2022)
    if (showMigrationScreen) {
      return (
        <div className="flex flex-col h-full items-center mt-24">
          <div className="text-sm text-gray-500 mb-8 select-none px-2 text-center">
            Migrating your account to the latest and greatest.
          </div>
          <svg
            className="animate-spin h-10 w-10 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <div className="text-sm text-gray-500 mt-8 select-none px-2 text-center">
            Thank you for being an early adopter.
          </div>
        </div>
      );
    }

    if (account && account.mnemonic !== null) {
      return (
        <div className="flex flex-col h-full items-center mt-4">
          <div className="flex-none mb-6">
            <div className="text-xl text-gray-700 font-semibold select-none">
              Recovery Update
            </div>

            <div className="text-sm text-gray-500 mt-6 select-none">
              As part of our upgrade we had to generate new recovery
              passpharses, it can now be used to recover lost passwords.
            </div>
          </div>
          <div className="select-all text-sm text-gray-600 font-medium rounded p-4 mb-8 bg-gray-200 break-words">
            {account.mnemonic}
          </div>

          <Button
            className="mb-4"
            appearance="ghost"
            block
            onClick={() => this.saveKey(account.mnemonic)}
          >
            Download Key
          </Button>

          <Button
            appearance="primary"
            type="button"
            block
            onClick={() => {
              goToMainWindow(account);
              this.clearState();
            }}
          >
            Go to mailbox
          </Button>
        </div>
      );
    }
    return <div />;
  }
}

export default Login;
