/* eslint-disable prettier/prettier */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Show, Hide, Paper } from 'react-iconly';
import SettingsSection from './shared/SettingsSection';

const { clipboard } = require('electron');

const SecurityPanel = () => {
  const account = useSelector(state => state.account);
  const [hideSigningKey, setHideSigningKey] = useState(true);
  const [hideSecretKey, setHideSecretKey] = useState(true);
  const [copyText, setCopyText] = useState('Copy')

  const handleCopy = (value: string) => {
    clipboard.writeText(value);
    setCopyText('Copied!')
  }

  const resetCopy = () => {
      if (copyText === 'Copied!'){
        setCopyText('Copy')
      }
  }

  const redactString = (str: string) => {
    const lgth = str.length
    return "x".repeat(lgth)

  }

  return (
    <div className='space-y-6'>
      <SettingsSection header="Device Signature" description="The key pair used to sign your communication over the network, thus ensuring that your traffic is safe and authenticated.">
        <div className="bg-white py-6 px-7 space-y-6">
          <div>
            <span className="block text-sm font-medium text-gray-700">Device Id</span>
            <div className="mt-2 flex flex-row w-full border border-gray-300 bg-gray-100 rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm font-medium justify-between">
              <div className="break-words flex-1 min-w-[40%]">{account.deviceId}</div>

              {/* COPY BUTTON */}
              <button type="button" onMouseLeave={resetCopy} onClick={() => handleCopy(account.deviceId)} className="relative flex flex-col items-center group outline-none">
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
              <div className="break-words flex-1 min-w-[40%]">{account.deviceSigningPubKey}</div>
              {/* COPY BUTTON */}
              <button type="button" onMouseLeave={resetCopy} onClick={() => handleCopy(account.deviceSigningPubKey)} className="relative flex flex-col items-center group outline-none">
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
            <div className={`break-words flex-1 min-w-[40%] ${hideSigningKey? "text-gray-300" : ""}`}>{hideSigningKey ? redactString(account.deviceSigningPrivKey) : account.deviceSigningPrivKey }</div>
              {/* COPY BUTTON */}
              <button type="button" onMouseLeave={resetCopy} onClick={() => handleCopy(account.deviceSigningPrivKey)} className="relative flex flex-col items-center group outline-none">
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
              <div className="break-words flex-1 min-w-[40%]">{account.secretBoxPubKey}</div>
              {/* COPY BUTTON */}
              <button type="button" onMouseLeave={resetCopy} onClick={() => handleCopy(account.secretBoxPubKey)} className="relative flex flex-col items-center group outline-none">
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
              <div className={`break-words flex-1 min-w-[40%] ${hideSecretKey? "text-gray-300" : ""}`}>{hideSecretKey ? redactString(account.secretBoxPrivKey) : account.secretBoxPrivKey }</div>
              {/* COPY BUTTON */}
              <button type="button" onMouseLeave={resetCopy} onClick={() => handleCopy(account.secretBoxPrivKey)} className="relative flex flex-col items-center group outline-none">
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
