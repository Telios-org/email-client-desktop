import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

// INTERNAL COMPONENTS
import { Button, Close } from '../../../global_components/button';
import IntroHeader from '../../window_components/IntroHeader';

const { ipcRenderer, remote } = require('electron');

const { dialog } = remote;
const fs = require('fs');

const RegistrationSuccess = () => {
  const { Account } = useOutletContext();
  const navigate = useNavigate();

  const showMainWindow = () => {
    ipcRenderer.send('showMainWindow', Account);
  };

  const saveKey = async () => {
    // Specify the name of the file to be saved
    const { filePath } = await dialog.showSaveDialog({
      title: 'Save Passphrase',
      defaultPath: 'passphrase.txt',
      filters: [{ name: 'Text file', extensions: ['txt'] }]
    });
    if (Account) {
      fs.writeFileSync(filePath, Account?.mnemonic, 'utf-8'); // eslint-disable-line
    }
  };

  return (
    <div className="h-full">
      <div className="relative w-full">
        <div className="absolute top-5 flex justify-end flex-row w-full px-5">
          <Close handleClose={() => navigate('/')} />
        </div>
      </div>
      <div className="max-w-xs mx-auto h-full flex flex-col">
        <IntroHeader title="Recovery Passphrase">
          <p className="text-base pt-2 text-gray-500">
            Download and keep somewhere safe.
          </p>
        </IntroHeader>
        <div className="mt-6 justify-between flex-1 flex flex-col pb-8">
          <div className=" grid grid-cols-3 gap-2 text-xs">
            {Account?.mnemonic.split(' ').map(word => (
              <span
                key={word}
                className="bg-coolGray-100 text-center text-gray-500 rounded py-1 px-2 border border-gray-300 shadow-sm"
              >
                {word}
              </span>
            ))}
          </div>
          <div className="space-y-2">
            <Button type="button" onClick={saveKey} variant="outline">
              Download
            </Button>
            <Button type="button" onClick={showMainWindow}>
              Go to Mailbox
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
