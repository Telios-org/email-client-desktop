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

const { ipcRenderer } = require('electron');
const LoginService = require('../../services/login.service');

const { StringType } = Schema.Types;
const errorStyles = errorVisible => {
  return {
    display: errorVisible ? 'block' : 'none',
    color: 'red',
    marginTop: 6
  };
};

// THE FUNCTIONS BELOW SHOULD BE MOVED TO A SEPARATE UTILITY FILE PROBABLY
const getAccount = async (name, password) => {
  try {
    const account = await LoginService.getAccount(password, name);

    return account;
  } catch (err) {
    ipcRenderer.send('restartMainWindow');
    throw i18n.t('login.incorrectPass');
  }
};

const loadMailbox = async () => {
  try {
    await LoginService.loadMailbox();
  } catch (err) {
    console.log(err);
  }
};

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
      visiblePassword: false
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
      const account = await getAccount(selectedAccount, masterpass);
      await loadMailbox();

      goToMainWindow(account);

      this.clearState();
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

  render() {
    const {
      selectedAccount,
      formError,
      formValue,
      canSubmit,
      loading,
      visiblePassword
    } = this.state;
    const { accounts, onUpdateActive } = this.props;

    if (accounts.length > 0) {
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
    return <div />;
  }
}

export default Login;
