/* eslint-disable prettier/prettier */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Show, Hide, Paper } from 'react-iconly';
import clsx from 'clsx';
import SettingsSection from './shared/SettingsSection';

import useForm from '../../../utils/hooks/useForm';

import { Password } from '../../../global_components/input-groups';
import { Button } from '../../../global_components/button';
import Notification from '../../../global_components/Notification';

// SELECTORS
import { selectActiveMailbox } from '../../selectors/mail';

// ACTION CREATORS
import { updateAccountPassword, createNewPassphrase } from '../../actions/account/account';

// HELPERS
import passwordStrengthClass from '../../../utils/helpers/security';

const { ipcRenderer, remote, clipboard } = require('electron');

const { dialog } = remote;
const fs = require('fs');

const zxcvbn = require('zxcvbn');

const SecurityPanel = () => {
  const dispatch = useDispatch();
  const account = useSelector(state => state.account);
  const [hideSigningKey, setHideSigningKey] = useState(true);
  const [hideSecretKey, setHideSecretKey] = useState(true);
  const [copyText, setCopyText] = useState('Copy')

  const handleCopy = (value: string) => {
    clipboard.writeText(value ?? '');
    setCopyText('Copied!')
  }

  const resetCopy = () => {
      if (copyText === 'Copied!'){
        setCopyText('Copy')
      }
  }

  const redactString = (str: string) => {
    const lgth = str?.length ?? 0
    return "x".repeat(lgth)

  }


  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordVerification, setShowPasswordVerification] = useState(false);
  const [passwordVerification, setPasswordVerification] = useState('');
  const currentMailbox = useSelector(selectActiveMailbox);
  const [loading, setLoader] = useState(false);
  const [generatorLoading, setGeneratorLoader] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const togglePasswordView = () => {
    setShowPassword(!showPassword);
  };

  const togglePasswordVerificationView = () => {
    setShowPasswordVerification(!showPasswordVerification);
  };

  const [showNotification, setShowNotification] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [saveSucceeded, setSaveSucceeded] = useState(true);

  const callToaster = (isSuccess: boolean, message: string) => {
    if (isSuccess) {
      setSaveSucceeded(true);
      setNotifMessage(message);
      setShowNotification(true);
    } else {
      setSaveSucceeded(false);
      setNotifMessage(message);
      setShowNotification(true);
    }
  };

  const {
    handleSubmit,
    handleChange,
    manualChange,
    bulkChange,
    resetForm,
    isDirty,
    data,
    errors
  } = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
      passwordStrength: {
        score: 0,
        crackTime: ''
      },
    },
    validations: {
      currentPassword: {
        required: {
          value: true,
          message: 'Required field.'
        },
        custom: {
          isValid: (value, data) => {
            return value === currentMailbox.password;
          },
          message: 'Incorrect Current Password.'
        }
      },
      newPassword: {
        required: {
          value: true,
          message: 'Required field.'
        },
        custom: {
          isValid: (value, data) => {
            return value.length >= 14 && data.passwordStrength.score > 3 && (data.newPasswordConfirm.length === 0 || value === data.newPasswordConfirm);
          },
          message: 'Password too weak. You need at least 14 characters.'
        }
      },
      newPasswordConfirm: {
        required: {
          value: true,
          message: 'Required field.'
        },
        custom: {
          isValid: (value, data) => {
            return value === data.newPassword;
          },
          message: 'Passwords must match'
        }
      },
    },
    onSubmit: async (data) => {
      setSubmitError('');
      setLoader(true);

      const res = await dispatch(
        updateAccountPassword({
          mailboxId: currentMailbox.mailboxId,
          email: currentMailbox.address,
          newPass: data.newPassword
        })
      );
      if (!res.success) {
        setSubmitError(res.message);
        callToaster(false,'Something went wrong!')
      }else{
        callToaster(true, 'Password Updated.')
        resetForm();
      }
      setLoader(false);
      
    }
  });

  const onPasswordChange = async e => {
    const newPassword = e.target.value;
    const result = zxcvbn(newPassword);
    await bulkChange(
      {
        newPassword,
        passwordStrength: {
          score: result.score,
          crackTime:
            result.crack_times_display.offline_slow_hashing_1e4_per_second
        }
      },
      data.newPasswordConfirm.length > 0
        ? ['newPassword', 'newPasswordConfirm']
        : ['newPassword']
    );
  };

  const onPasswordVerification = async e => {
    const password = e.target.value;
    setPasswordVerification(password)
  }

  const downloadPassphrase = async () => {
    // Specify the name of the file to be saved
    const { filePath } = await dialog.showSaveDialog({
      title: 'Save Passphrase',
      defaultPath: `${currentMailbox.address}-passphrase.txt`,
      filters: [{ name: 'Text file', extensions: ['txt'] }]
    });
    fs.writeFileSync(filePath, account?.mnemonic, 'utf-8');
     // eslint-disable-line
     setPasswordVerification('')
  };

  const generateNewPassphrase = async () => {
    setGeneratorLoader(true)
    await dispatch(createNewPassphrase())
    callToaster(true, "New Passphrase Created!")
    setGeneratorLoader(false)
  }


  return (
    <div className='space-y-6 select-none mb-10'>
      <Notification
        show={showNotification}
        setShow={setShowNotification}
        success={saveSucceeded}
        successMsg={notifMessage}
        errorMsg={notifMessage}
      />
      <SettingsSection header="Password Change" description="The password that is the key to all of your encrypted data.">
        <form onSubmit={handleSubmit} className="relative">
          {!account.mnemonic && (
          <div className='bg-black/30 z-40 backdrop-grayscale absolute w-full h-full flex justify-center'>
            <span className="text-white uppercase text-xl self-center max-w-sm text-center font-semibold">Generate a new passphrase first (below) to make use of this feature.</span>
          </div>
          )}
          <div className="bg-white py-6 px-7 space-y-6">
            
            <div className="grid grid-cols-4 gap-6">
              <Password
                label="Current Password"
                id="currentPassword"
                name="currentPassword"
                className="col-span-2"
                autoComplete="current-password"
                required
                onChange={handleChange('currentPassword', true)}
                error={errors.currentPassword}
                show={showPassword}
                value={data.currentPassword}
                onVisibilityToggle={togglePasswordView}
              />
              <div className="col-span-2" />
              <Password
                label="New Password"
                id="newPassword"
                name="newPassword"
                className="col-span-2"
                required
                onChange={onPasswordChange}
                error={errors.newPassword}
                show={showPassword}
                value={data.newPassword}
                onVisibilityToggle={togglePasswordView}
              />
              <Password
                label="New Password Confirm"
                id="newPasswordConfirm"
                name="newPasswordConfirm"
                className="col-span-2"
                required
                onChange={handleChange('newPasswordConfirm', true)}
                error={errors.newPasswordConfirm}
                show={showPassword}
                value={data.newPasswordConfirm}
                onVisibilityToggle={togglePasswordView}
              />
              <div className="col-span-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Time to Crack New Password
                </label>
                <div
                  className={clsx(
                  `mt-1 items-center justify-center appearance-none block w-full px-3 py-2 rounded-md shadow-sm font-medium sm:text-sm`,
                  passwordStrengthClass(
                    data.newPassword,
                    data.passwordStrength.score
                  )
                )}
                >
                  <span className="self-center justify-center flex capitalize tracking-wider">
                    {data.newPassword.length > 0
                    ? data.passwordStrength.crackTime
                    : 'No Password'}
                  </span>
                </div>
              </div>
              
            </div>
          </div>
          <div className="relative flex justify-end py-3 bg-gray-50 text-right px-6 border-t border-gray-300">
            <button
              type="button"
              onClick={resetForm}
              disabled={!isDirty}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-blue-gray-900 disabled:text-gray-300 hover:bg-blue-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 mr-3"
            >
              Cancel
            </button>
            <div>
              <Button
                type="submit"
                variant="secondary"
                className="py-2 px-4"
                loading={loading}
                loadingText="Updating..."
                disabled={errors.newPasswordConfirm || data.newPasswordConfirm.length === 0 || errors.newPassword || data.newPassword.length === 0 || data.currentPassword.length === 0 || errors.currentPassword}
              >
                Update Password
              </Button>
            </div>
            <div className="text-xs text-red-500 absolute left-7 text-center">
              {submitError.length > 0 && submitError}
            </div>
          </div>
        </form>
      </SettingsSection>
      <SettingsSection header="Recovery Passphrase" description="Mnemonic to be used for recovery in case you forget your password. This file should be printed and kept in a safe place. Verify your password to download your passphrase.">
        <div>
          <div className="bg-white py-6 px-7 space-y-6">
            <div className="grid grid-cols-4 gap-6">
              <Password
                label="Password Verification"
                id="currentPassword"
                name="currentPassword"
                className="col-span-2"
                autoComplete="current-password"
                required
                onChange={onPasswordVerification}
                show={showPasswordVerification}
                value={passwordVerification}
                error=""
                onVisibilityToggle={togglePasswordVerificationView}
              />
              <div className="col-span-2" />
       
            </div>
          </div>
          <div className="relative flex justify-end py-3 bg-gray-50 text-right px-6 border-t border-gray-300">
            {account.mnemonic && (
              <div>
                <Button
                  type="submit"
                  variant="primary"
                  className="py-2 px-4"
                  onClick={downloadPassphrase}
                  disabled={currentMailbox.password !== passwordVerification}
                >
                  Download
                </Button>
              </div>
            )}
            {!account.mnemonic && (
              <div>
                <Button
                  type="submit"
                  variant="secondary"
                  className="py-2 px-4"
                  onClick={generateNewPassphrase}
                  loading={generatorLoading}
                  loadingText="Generating..."
                  disabled={currentMailbox.password !== passwordVerification}
                >
                  Generate New Passphrase
                </Button>
              </div>
            )}
          </div>
        </div>
          
      </SettingsSection>
      <SettingsSection header="Device Signature" description="The key pair used to sign your communication over the network, thus ensuring that your traffic is safe and authenticated.">
        <div className="bg-white py-6 px-7 space-y-6">
          <div>
            <span className="block text-sm font-medium text-gray-700">Device Id</span>
            <div className="mt-2 flex flex-row w-full border border-gray-300 bg-gray-100 rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm font-medium justify-between">
              <div className="break-words break-all flex-1 min-w-[40%]">{account?.deviceInfo?.deviceId}</div>

              {/* COPY BUTTON */}
              <button type="button" onMouseLeave={resetCopy} onClick={() => handleCopy(account?.deviceInfo?.deviceId)} className="relative flex flex-col items-center group outline-none">
                <Paper
                  size="small"
                  set="broken"
                  onClick={() => setHideSecretKey(true)}
                  className="text-gray-400 hover:text-purple-600 mt-0.5 ml-1"
                  style={{ cursor: 'pointer' }}
                />
                <div className="absolute top-0 flex-col items-center hidden -mt-9 group-hover:flex">
                  <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-700 shadow-lg rounded">{copyText}</span>
                  <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-700" />
                </div>
              </button>
              {/* END */}

            </div>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-700">Signing Public Key</span>
            <div className="mt-2 flex flex-row w-full border border-gray-300 bg-gray-100 rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm font-medium justify-between">
              <div className="break-words break-all flex-1 min-w-[40%]">{account?.deviceInfo?.keyPair?.publicKey}</div>
              {/* COPY BUTTON */}
              <button type="button" onMouseLeave={resetCopy} onClick={() => handleCopy(account?.deviceInfo?.keyPair?.publicKey)} className="relative flex flex-col items-center group outline-none">
                <Paper
                  size="small"
                  set="broken"
                  onClick={() => setHideSecretKey(true)}
                  className="text-gray-400 hover:text-purple-600 mt-0.5 ml-1"
                  style={{ cursor: 'pointer' }}
                />
                <div className="absolute top-0 flex-col items-center hidden -mt-9 group-hover:flex">
                  <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-700 shadow-lg rounded">{copyText}</span>
                  <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-700" />
                </div>
              </button>
              {/* END */}
            </div>
          </div>
          <div>
            <div className="flex text-sm font-medium text-gray-700 flex-row item-center">
              <span>Signing Private Key</span>
              {hideSigningKey && (
              <Hide
                size="small"
                set="broken"
                onClick={() => setHideSigningKey(false)}
                className="ml-2 text-gray-400 hover:text-purple-600 self-center"
                style={{ cursor: 'pointer' }}
              />
              )}
              {!hideSigningKey && (
              <Show
                size="small"
                set="broken"
                onClick={() => setHideSigningKey(true)}
                className="ml-2 text-gray-400 hover:text-purple-600 self-center"
                style={{ cursor: 'pointer' }}
              />
              )}
            </div>
            <div className="mt-2 flex flex-row w-full border border-gray-300 bg-gray-100 rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm font-medium justify-between">
              <div className={`break-words break-all flex-1 min-w-[40%] ${hideSigningKey? "text-gray-300" : ""}`}>{hideSigningKey ? redactString(account?.deviceInfo?.keyPair?.secretKey) : account?.deviceInfo?.keyPair?.secretKey }</div>
              {/* COPY BUTTON */}
              <button type="button" onMouseLeave={resetCopy} onClick={() => handleCopy(account?.deviceInfo?.keyPair?.secretKey)} className="relative flex flex-col items-center group outline-none">
                <Paper
                  size="small"
                  set="broken"
                  onClick={() => setHideSecretKey(true)}
                  className="text-gray-400 hover:text-purple-600 mt-0.5 ml-1"
                  style={{ cursor: 'pointer' }}
                />
                <div className="absolute top-0 flex-col items-center hidden group-hover:flex -mt-9">
                  <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-700 shadow-lg rounded">{copyText}</span>
                  <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-700" />
                </div>
              </button>
              {/* END */}
            </div>
          </div>
        </div>
      </SettingsSection>
      <SettingsSection header="Data Encryption" description="The key pair information used to encrypt all of your data at rest.">
        <div className="bg-white py-6 px-7 space-y-6">
          <div>
            <span className="block text-sm font-medium text-gray-700">Secret Box Public Key</span>
            <div className="mt-2 flex flex-row w-full border border-gray-300 bg-gray-100 rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm font-medium">
              <div className="break-words break-all flex-1 min-w-[40%]">{account?.secretBoxPubKey}</div>
              {/* COPY BUTTON */}
              <button type="button" onMouseLeave={resetCopy} onClick={() => handleCopy(account?.secretBoxPubKey)} className="relative flex flex-col items-center group outline-none">
                <Paper
                  size="small"
                  set="broken"
                  onClick={() => setHideSecretKey(true)}
                  className="text-gray-400 hover:text-purple-600 mt-0.5 ml-1"
                  style={{ cursor: 'pointer' }}
                />
                <div className="absolute top-0 flex-col items-center hidden group-hover:flex -mt-9">
                  <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-700 shadow-lg rounded">{copyText}</span>
                  <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-700" />
                </div>
              </button>
              {/* END */}
            </div>
          </div>
          <div>
            <div className="flex text-sm font-medium text-gray-700 flex-row item-center">
              <span>Secret Box Private Key</span>
              {hideSecretKey && (
                <Hide
                  size="small"
                  set="broken"
                  onClick={() => setHideSecretKey(false)}
                  className="ml-2 text-gray-400 hover:text-purple-600 self-center"
                  style={{ cursor: 'pointer' }}
                />
              )}
              {!hideSecretKey && (
                <Show
                  size="small"
                  set="broken"
                  onClick={() => setHideSecretKey(true)}
                  className="ml-2 text-gray-400 hover:text-purple-600 self-center"
                  style={{ cursor: 'pointer' }}
                />
              )}
            </div>
            <div className="mt-2 flex flex-row w-full border border-gray-300 bg-gray-100 rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm font-medium">
              <div className={`break-words break-all flex-1 min-w-[40%] ${hideSecretKey? "text-gray-300" : ""}`}>{hideSecretKey ? redactString(account?.secretBoxPrivKey) : account?.secretBoxPrivKey }</div>
              {/* COPY BUTTON */}
              <button type="button" onMouseLeave={resetCopy} onClick={() => handleCopy(account?.secretBoxPrivKey)} className="relative flex flex-col items-center group outline-none">
                <Paper
                  size="small"
                  set="broken"
                  onClick={() => setHideSecretKey(true)}
                  className="text-gray-400 hover:text-purple-600 mt-0.5 ml-1"
                  style={{ cursor: 'pointer' }}
                />
                <div className="absolute top-0 flex-col items-center hidden group-hover:flex -mt-9">
                  <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-700 shadow-lg rounded">{copyText}</span>
                  <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-700" />
                </div>
              </button>
              {/* END */}
            </div>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
};

export default SecurityPanel;
