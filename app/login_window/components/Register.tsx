import React, { Component } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import { BsLock, BsCheckCircle, BsXCircleFill } from 'react-icons/bs';
import { FaRegEnvelope } from 'react-icons/fa';
import {
  AiOutlineLoading3Quarters,
  AiFillCheckCircle,
  AiOutlineHistory,
  AiFillCloseCircle
} from 'react-icons/ai';
import { Show, Hide, Lock } from 'react-iconly';
import {
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  InputGroup,
  Button,
  Steps,
  Icon,
  Whisper,
  Tooltip,
  CheckboxGroup,
  Checkbox
} from 'rsuite';
import { Mailbox } from '@telios/client-sdk';
import Store from 'electron-store';
import i18n from '../../i18n/i18n';

const { ipcRenderer, remote } = require('electron');

const { dialog } = remote;
const fs = require('fs');
const zxcvbn = require('zxcvbn');
const envAPI = require('../../env_api.json');

const Login = require('../../services/login.service');

const params = window.location.search.replace('?', '');
const env = params.split('=')[1];

console.log('ENV VAR::', env);

const requestBase = env === 'production' ? envAPI.prod : envAPI.dev;
const mailDomain = env === 'production' ? envAPI.prodMail : envAPI.devMail;

const mailbox = new Mailbox({
  provider: requestBase
});

const errorStyles = errorVisible => {
  return {
    display: errorVisible ? 'block' : 'none',
    color: 'red',
    marginTop: 6
  };
};

const validateTeliosEmail = (email: string) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/g; // eslint-disable-line
  return re.test(email);
};

const validateEmail = (email: string) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line
  return re.test(email);
};

type Props = {
  onUpdateActive: (value: string) => void;
  firstAccount: boolean;
};

type State = {
  formValue: Record<string, any>;
  formError: Record<string, any>;
  formSuccess: Record<string, any>;
  step: number;
  canSubmit: boolean;
  loading: boolean;
  emailCheckLoading: boolean;
  betaCheckLoading: boolean;
  nextStepDisabled: boolean;
  passwordStrength: number | null;
  crackTime: string | null;
  account: any;
  visiblePassword: boolean;
};

class Register extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      formValue: {
        email: '',
        masterpass: '',
        confirmpass: '',
        recoveryemail: '',
        checkbox: [],
        betacode: ''
      },
      step: 0,
      formError: {},
      formSuccess: {},
      canSubmit: false,
      loading: false,
      betaCheckLoading: false,
      emailCheckLoading: false,
      nextStepDisabled: true,
      passwordStrength: null,
      crackTime: null,
      account: {
        mnemonic: null
      },
      visiblePassword: false
    };

    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.onChangeRecoveryEmail = this.onChangeRecoveryEmail.bind(this);
    this.onChangePass = this.onChangePass.bind(this);
    this.onChangeConfirmPass = this.onChangeConfirmPass.bind(this);
    this.onChangeBetaCode = this.onChangeBetaCode.bind(this);
    this.handleNextStep = this.handleNextStep.bind(this);
    this.isNextStepDisabled = this.isNextStepDisabled.bind(this);
    this.passwordStrengthlass = this.passwordStrengthlass.bind(this);
    this.showMainWindow = this.showMainWindow.bind(this);
    this.togglePassword = this.togglePassword.bind(this);
  }

  onChangeBetaCode = debounce(async input => {
    // eslint-disable-next-line prefer-const
    let { formError, formSuccess, betaCheckLoading, nextStepDisabled } = {
      ...this.state
    };

    const options = {
      url: `${requestBase}/account/beta/verify`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        vcode: input
      }
    };

    if (!input) {
      betaCheckLoading = false;
      delete formSuccess.betacode;
      formError.betacode = i18n.t('form.betaCodeRequired');
      this.setState({
        betaCheckLoading,
        formSuccess,
        formError,
        nextStepDisabled: true
      });
      return;
    }

    delete formSuccess.betacode;
    delete formError.betacode;
    betaCheckLoading = true;
    this.setState({ betaCheckLoading, formSuccess, formError });

    try {
      await axios(options);
      betaCheckLoading = false;
      formSuccess.betacode = true;
      nextStepDisabled = false;
    } catch (error) {
      betaCheckLoading = false;
      formError.betacode = i18n.t('register.betaCodeNotValid');

      if (error.response && error.response.status !== 400) {
        formError.betacode = error;
      }

      nextStepDisabled = true;
    }

    this.setState({
      betaCheckLoading,
      formSuccess,
      formError,
      nextStepDisabled
    });
  }, 500);

  // onChangeBetaCode = formValue => {
  //   const state = { ...this.state };
  //   const { formSuccess, formError } = state;

  //   if (!formValue.betacode) {
  //     delete formSuccess.betacode;
  //     formError.betacode = i18n.t('form.betaCodeRequired');
  //     this.setState({ formError, formSuccess });
  //     return;
  //   }

  //   delete formError.betacode;
  //   delete formSuccess.betacode;

  //   // INSERT HERE THE CHECK FOR VALIDITY OF BETACODE
  //   formSuccess.betacode = true;
  // };

  onChangeEmail = debounce(async input => {
    // eslint-disable-next-line prefer-const
    let { formError, formSuccess, emailCheckLoading, nextStepDisabled } = {
      ...this.state
    };
    const email = `${input.toLowerCase()}@${mailDomain}`;

    if (!input) {
      emailCheckLoading = false;
      delete formSuccess.email;
      formError.email = i18n.t('form.emailRequired');
      this.setState({
        emailCheckLoading,
        formSuccess,
        formError,
        nextStepDisabled: true
      });
      return;
    }

    delete formSuccess.email;
    delete formError.email;
    emailCheckLoading = true;
    this.setState({ emailCheckLoading, formSuccess, formError });

    if (validateTeliosEmail(email)) {
      const mailboxes = await mailbox.getMailboxPubKeys([email]);
      // check if available
      emailCheckLoading = false;

      // if available
      if (!mailboxes[email]) {
        formSuccess.email = true;
        nextStepDisabled = false;
      } else {
        formError.email = i18n.t('register.emailNotAvailable');
        nextStepDisabled = true;
      }
    } else {
      emailCheckLoading = false;
      nextStepDisabled = true;
      formError.email = i18n.t('register.emailNotAvailable');
    }

    this.setState({
      emailCheckLoading,
      formSuccess,
      formError,
      nextStepDisabled
    });
  }, 500);

  async handleRegister() {
    const { formValue, formError, step } = this.state;
    this.onChangePass(formValue);
    this.onChangeConfirmPass(formValue);
    this.onChangeRecoveryEmail(formValue);

    const errors = Object.keys(formError).length;

    if (
      formValue.betacode &&
      formValue.email &&
      formValue.masterpass &&
      formValue.confirmpass &&
      formValue.recoveryemail &&
      errors === 0
    ) {
      this.setState({ formSuccess: {}, loading: true });
      const email = `${formValue.email}@${mailDomain}`;

      try {
        const acct = await Login.createAccount({
          password: formValue.masterpass,
          email,
          recoveryEmail: formValue.recoveryemail,
          vcode: formValue.betacode
        });
        this.setState({ account: acct, loading: false });
        this.handleNextStep(step + 1);

        const store = new Store();
        store.set('lastAccount', email);
      } catch (e) {
        console.log('ERROR', e);
        this.setState({
          formError: {
            ...formError,
            email: i18n.t('register.emailNotAvailable')
          },
          loading: false
        });
      }
    }
  }

  showMainWindow() {
    const { account } = this.state;
    ipcRenderer.send('showMainWindow', account);
  }

  handleFormChange(formValue) {
    const { formError, step, formSuccess } = { ...this.state };

    if (formValue.masterpass) {
      this.onChangePass(formValue);
    }

    if (formValue.confirmpass) {
      this.onChangeConfirmPass(formValue);
    }

    if (formValue.recoveryemail) {
      this.onChangeRecoveryEmail(formValue);
    }

    if (formValue.checkbox) {
      if (
        formValue.checkbox.includes('emailComm') &&
        formValue.checkbox.includes('termAndPrivacy')
      ) {
        formSuccess.checkboxes = true;
        this.setState({ formSuccess });
      } else {
        delete formSuccess.checkboxes;
        this.setState({ formSuccess });
      }
    }

    // if (formValue.betacode) {
    //   this.onChangeBetaCode(formValue);
    // }

    const nextStepDisabled = this.isNextStepDisabled(step);

    this.setState({
      formValue,
      nextStepDisabled
    });

    const errors = Object.keys(formError).length;

    if (
      formValue.betacode &&
      formValue.email &&
      formValue.masterpass &&
      formValue.checkbox.includes('emailComm') &&
      formValue.checkbox.includes('termAndPrivacy') &&
      formValue.confirmpass &&
      formValue.recoveryemail &&
      errors === 0
    ) {
      this.setState({ canSubmit: true });
    }
  }

  handleNextStep(nextStep: number) {
    const { step } = this.state;

    if (nextStep === 6) {
      return this.showMainWindow();
    }

    const previousStepDisabled = this.isNextStepDisabled(nextStep - 1);
    if (nextStep > step && previousStepDisabled && nextStep !== 5) {
      return true;
    }

    const nextStepDisabled = this.isNextStepDisabled(nextStep);

    this.setState({
      step: nextStep,
      nextStepDisabled
    });
    return true;
  }

  onChangeConfirmPass(formValue) {
    const state = { ...this.state };
    const { formSuccess, formError } = state;

    if (!formValue.confirmpass) {
      delete formSuccess.confirmpass;
      formError.confirmpass = i18n.t('form.confirmRequired');
      this.setState({ formError, formSuccess });
      return;
    }

    delete formError.confirmpass;
    delete formSuccess.confirmpass;

    if (formValue.confirmpass === formValue.masterpass) {
      formSuccess.confirmpass = true;
    } else {
      formError.confirmpass = i18n.t('form.passMismatch');
    }

    this.setState({ formError, formSuccess });
  }

  onChangePass(formValue) {
    const state = { ...this.state };
    const { formSuccess, formError } = state;
    const result = zxcvbn(formValue.masterpass);

    if (!formValue.masterpass) {
      delete formSuccess.masterpass;
      formError.masterpass = i18n.t('form.masterPassRequired');
      this.setState({ formError, formSuccess });
      return;
    }

    delete formError.masterpass;
    delete formSuccess.masterpass;

    if (result.score < 3) {
      formError.masterpass = i18n.t('form.weakPass');
    }
    if (result.score === 3) {
      formSuccess.masterpass = true;
      delete formError.masterpass;
    }
    if (result.score > 3) {
      formSuccess.masterpass = true;
      delete formError.masterpass;
    }

    if (formValue.confirmpass) {
      if (formValue.masterpass !== formValue.confirmpass) {
        delete formSuccess.confirmpass;
        formError.confirmpass = i18n.t('form.passMismatch');
      } else {
        formSuccess.confirmpass = true;
        delete formError.confirmpass;
      }
    }

    let passwordStrength;
    let crackTime;

    if (formValue.masterpass === '') {
      passwordStrength = null;
      crackTime = null;
    } else {
      passwordStrength = result.score;
      crackTime =
        result.crack_times_display.offline_slow_hashing_1e4_per_second;
    }

    this.setState({ formError, formSuccess, passwordStrength, crackTime });
  }

  onChangeRecoveryEmail(formValue) {
    const state = { ...this.state };
    const { formSuccess, formError } = state;

    if (!formValue.recoveryemail) {
      delete formSuccess.recoveryemail;
      formError.recoveryemail = i18n.t('form.recoveryRequired');
      this.setState({ formError, formSuccess });
      return;
    }

    delete formError.recoveryemail;
    delete formSuccess.recoveryemail;

    if (validateEmail(formValue.recoveryemail)) {
      formSuccess.recoveryemail = true;
    } else {
      formError.recoveryemail = i18n.t('form.recoveryEmailInvalid');
    }

    this.setState({ formError, formSuccess });
  }

  isNextStepDisabled(currentStep: number) {
    const { formSuccess } = this.state;
    if (
      (currentStep === 0 && formSuccess.betacode) ||
      (currentStep === 1 && formSuccess.checkboxes) ||
      (currentStep === 2 && formSuccess.email) ||
      currentStep === 5
    ) {
      return false;
    }

    if (
      currentStep === 3 &&
      formSuccess.confirmpass &&
      formSuccess.masterpass
    ) {
      return false;
    }

    if (currentStep === 4 && formSuccess.recoveryemail) {
      return false;
    }

    return true;
  }

  passwordStrengthlass() {
    const { passwordStrength, formValue } = this.state;
    const { masterpass = '' } = formValue;
    if (masterpass !== '') {
      switch (passwordStrength) {
        case 0:
        case 1:
          return 'bg-red-300 text-white';
        case 2:
          return 'bg-orange-300 text-white';
        case 3:
          return 'bg-yellow-300 text-white';
        case 4:
          return 'bg-green-300 text-white';
        default:
          return 'bg-gray-200 text-gray-300';
      }
    }

    return 'bg-gray-200 text-gray-300';
  }

  // eslint-disable-next-line class-methods-use-this
  async saveKey(key: string) {
    // Specify the name of the file to be saved
    const { filePath } = await dialog.showSaveDialog({
      title: 'Save Passphrase',
      defaultPath: 'passphrase.txt',
      filters: [{ name: 'Text file', extensions: ['txt'] }]
    });

    fs.writeFileSync(filePath, key, 'utf-8'); // eslint-disable-line
  }

  togglePassword() {
    const { visiblePassword } = this.state;
    this.setState({ visiblePassword: !visiblePassword });
  }

  render() {
    const {
      formValue,
      formError,
      formSuccess,
      canSubmit,
      nextStepDisabled,
      loading,
      emailCheckLoading,
      betaCheckLoading,
      step,
      passwordStrength,
      crackTime,
      account,
      visiblePassword
    } = this.state;

    const { onUpdateActive, firstAccount } = this.props;

    const tooltip = (
      <Tooltip>
        This represent the amount of time it would take a computer to crack your
        password given
        <b> 10 thousand guesses per seconds.</b>
      </Tooltip>
    );

    return (
      <Form
        className="flex flex-col h-full"
        // eslint-disable-next-line no-return-assign
        ref={ref => (this.form = ref)}
        // eslint-disable-next-line no-shadow
        onChange={formValue => {
          this.handleFormChange(formValue);
        }}
        formValue={formValue}
      >
        {!firstAccount && (
          <div className="absolute top-24 text-gray-300 hover:text-purple-400 cursor-pointer">
            <Icon
              icon="back-arrow"
              size="lg"
              onClick={() => onUpdateActive('login')}
            />
          </div>
        )}
        <div className="flex-none mb-6">
          <div className="text-xl text-gray-700 font-semibold select-none">
            {i18n.t(`register.steps.${step}.header`)}
          </div>
          {i18n.t(`register.steps.${step}.description`).length > 0 && (
            <div className="text-sm text-gray-500 mt-6 select-none">
              {i18n.t(`register.steps.${step}.description`)}
            </div>
          )}
        </div>
        <div className="flex-1">
          {step === 0 && (
            <>
              <FormGroup className="mb-0 -mt-2">
                <ControlLabel className="font-medium text-gray-500 select-none">
                  {i18n.t('global.code')}
                </ControlLabel>
                <InputGroup className="w-full" inside>
                  <FormControl
                    name="betacode"
                    onChange={this.onChangeBetaCode}
                  />
                  <InputGroup.Addon className="bg-transparent">
                    {betaCheckLoading &&
                      !formSuccess.betacode &&
                      !formError.betacode && (
                        <AiOutlineLoading3Quarters className="loading-indicator" />
                      )}
                    {!betaCheckLoading &&
                      formSuccess.betacode &&
                      !formError.betacode && (
                        <BsCheckCircle className="text-green-500" />
                      )}
                    {!betaCheckLoading &&
                      !formSuccess.betacode &&
                      formError.betacode && (
                        <BsXCircleFill className="text-red-500" />
                      )}
                    {/* <BsCheck className="mr-1 text-gray-400" /> */}
                  </InputGroup.Addon>
                </InputGroup>
                <div style={errorStyles(formError.betacode)}>
                  {formError.betacode}
                </div>
              </FormGroup>
            </>
          )}
          {step === 1 && (
            <>
              <FormGroup className="-mt-2">
                <FormControl name="checkbox" accepter={CheckboxGroup}>
                  <Checkbox value="emailComm">
                    <p className="text-sm">
                      I understand that my Telios account will receive occasional emails containing important product updates and surveys that will help us make this beta a success.
                    </p>
                    <p>
                      Telios will never sell or distribute your email address to any third party at any time.
                    </p>
                    <p>
                      If you wish to unsubscribe from future emails, you can do so at any time.
                    </p>
                  </Checkbox>
                  <Checkbox value="termAndPrivacy">
                    <p className="text-sm">
                      I agree to the Telios
                      {' '}
                      <a href="https://docs.google.com/document/u/1/d/e/2PACX-1vQXqRRpBkB-7HqwLd2XtsWVDLjCUnBUIeNQADb56FuKHdj_IF9wbmsl4G7RLxR2_yKYMhnSO1M-X39H/pub">
                        {' '}
                        Terms of Service
                      </a>
                      {' '}
                      and
                      {' '}
                      <a href="https://docs.google.com/document/u/1/d/e/2PACX-1vTIL7a6NbUhBDxHmRy5tW0e5H4YoBWXUO1WvPseVuEATSLHMIemVAG6nnRe_xIJZ-s5YYPh2C05JwKR/pub">
                        Privacy Policy
                      </a>
                    </p>
                  </Checkbox>
                </FormControl>
              </FormGroup>
            </>
          )}
          {step === 2 && (
            <>
              <FormGroup>
                <ControlLabel className="font-medium mb-2 text-gray-500 select-none">
                  {i18n.t('global.email')}
                </ControlLabel>
                <InputGroup className="w-full">
                  <InputGroup.Addon className="bg-transparent">
                    {!emailCheckLoading && !formSuccess.email && (
                      <FaRegEnvelope
                        className={`text-gray-400
                    ${formError.email && !formSuccess.email
                            ? 'text-red-600'
                            : ''
                          }
                    ${formSuccess.email && !formError.email
                            ? 'text-green-500'
                            : ''
                          }`}
                      />
                    )}
                    {emailCheckLoading &&
                      !formSuccess.email &&
                      !formError.email && (
                        <AiOutlineLoading3Quarters className="loading-indicator" />
                      )}

                    {!emailCheckLoading &&
                      formSuccess.email &&
                      !formError.email && (
                        <BsCheckCircle className="text-green-500" />
                      )}
                  </InputGroup.Addon>
                  <FormControl
                    onChange={this.onChangeEmail}
                    disabled={loading}
                    name="email"
                  />
                  <InputGroup.Addon>
                    {' '}
                    <div
                      className={`${loading ? 'text-gray-400 select-none' : ''
                        }`}
                    >
                      {`@${mailDomain}`}
                    </div>
                  </InputGroup.Addon>
                </InputGroup>
                <div style={errorStyles(formError.email)}>
                  {formError.email}
                </div>
              </FormGroup>
            </>
          )}
          {step === 3 && (
            <>
              <FormGroup className="mb-0 -mt-2">
                <ControlLabel className="font-medium text-gray-500 select-none">
                  {i18n.t('global.masterPass')}
                </ControlLabel>
                <InputGroup className="w-full" inside>
                  <InputGroup.Addon>
                    <Lock
                      size="small"
                      set="broken"
                      className={`mr-1 text-gray-400
                  ${formError.masterpass ? 'text-red-600' : ''}
                  ${formSuccess.masterpass ? 'text-green-500' : ''}`}
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
                {/* <div style={errorStyles(formError.masterpass)}>
                  {formError.masterpass}
                </div> */}
              </FormGroup>
              <div className="flex flex-row h-1 w-full mt-1 mb-3 px-1">
                <div
                  className={`flex-1  mr-2 rounded ${passwordStrength !== null ? 'bg-red-400' : 'bg-gray-300'
                    }`}
                />
                <div
                  className={`flex-1  mr-2 rounded ${passwordStrength !== null && passwordStrength >= 1
                    ? 'bg-red-400'
                    : 'bg-gray-300'
                    }`}
                />
                <div
                  className={`flex-1  mr-2 rounded ${passwordStrength !== null && passwordStrength >= 2
                    ? 'bg-orange-400'
                    : 'bg-gray-300'
                    }`}
                />
                <div
                  className={`flex-1  mr-2 rounded ${passwordStrength !== null && passwordStrength >= 3
                    ? 'bg-yellow-400'
                    : 'bg-gray-300'
                    }`}
                />
                <div
                  className={`flex-1 rounded ${passwordStrength !== null && passwordStrength === 4
                    ? 'bg-green-400'
                    : 'bg-gray-300'
                    }`}
                />
              </div>

              <FormGroup className="mb-3">
                <ControlLabel className="font-medium mb-2 text-gray-500 select-none">
                  {i18n.t('register.confirmPass')}
                </ControlLabel>
                <InputGroup className="w-full" inside>
                  <InputGroup.Addon>
                    <Lock
                      size="small"
                      set="broken"
                      className={`mr-1 text-gray-400
                  ${formError.confirmpass ? 'text-red-600' : ''}
                  ${formSuccess.confirmpass ? 'text-green-500' : ''}`}
                    />
                  </InputGroup.Addon>
                  <FormControl
                    disabled={loading}
                    name="confirmpass"
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
                <div className="text-red-500">
                  {`${formError.masterpass ? formError.masterpass : ''} ${formError.confirmpass ? formError.confirmpass : ''
                    }`}
                </div>
              </FormGroup>
              <Whisper placement="top" trigger="hover" speaker={tooltip}>
                <div className="flex flex-col font-medium text-gray-500 cursor-help select-none">
                  <div>Time to Crack Password</div>
                  <div
                    className={`h-9 rounded-md my-2 text-sm
                   font-semibold flex items-center justify-center border-gray-300
                   ${this.passwordStrengthlass()}
                   `}
                  >
                    <span className="self-center flex capitalize tracking-wider">
                      {formValue.masterpass.length > 0
                        ? crackTime
                        : 'No Password'}
                    </span>
                  </div>
                </div>
              </Whisper>
            </>
          )}
          {step === 4 && (
            <FormGroup>
              <ControlLabel className="font-medium mb-2 text-gray-500 select-none">
                {i18n.t('global.recoveryEmail')}
              </ControlLabel>
              <InputGroup className="bg-transparent" inside>
                <InputGroup.Addon>
                  <AiOutlineHistory
                    className={`mr-1 text-gray-400
                      ${formError.recoveryemail ? 'text-red-600' : ''}
                      ${formSuccess.recoveryemail ? 'text-green-500' : ''}`}
                  />
                </InputGroup.Addon>
                <FormControl disabled={loading} name="recoveryemail" />
              </InputGroup>
              <div style={errorStyles(formError.recoveryemail)}>
                {formError.recoveryemail}
              </div>
              {loading && (
                <div className="flex-none mt-2 text-gray-500 text-sm animate-pulse">
                  {i18n.t('register.connecting')}
                </div>
              )}
            </FormGroup>
          )}

          {step === 5 && (
            <div>
              <div className="text-sm text-gray-600 font-medium rounded p-4 mb-8 bg-gray-200 break-words">
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
            </div>
          )}
        </div>
        <div className="flex-none mb-6 select-none">
          {step !== 4 && (
            <Button
              appearance="primary"
              block
              onClick={() => this.handleNextStep(step + 1)}
              disabled={nextStepDisabled}
            >
              Next
            </Button>
          )}
          {step === 4 && (
            <Button
              appearance="primary"
              loading={loading}
              type="submit"
              block
              onClick={this.handleRegister}
              disabled={!canSubmit}
            >
              Register
            </Button>
          )}
        </div>
        {step !== 5 && (
          <div className="w-8/12 flex-none self-center mb-2 registrationSteps select-none">
            <Steps current={step} small>
              <Steps.Item onClick={() => this.handleNextStep(0)} />
              <Steps.Item onClick={() => this.handleNextStep(1)} />
              <Steps.Item onClick={() => this.handleNextStep(2)} />
              <Steps.Item onClick={() => this.handleNextStep(3)} />
              <Steps.Item onClick={() => this.handleNextStep(4)} />
            </Steps>
          </div>
        )}
      </Form>
    );
  }
}

export default Register;

// function axios(options: {
//   url: any;
//   method: string;
//   headers: { Accept: string; 'Content-Type': string };
//   data: { vcode: any };
// }) {
//   throw new Error('Function not implemented.');
// }
