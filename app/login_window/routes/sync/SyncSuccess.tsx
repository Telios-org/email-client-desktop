import React, { useState, useEffect } from 'react';

// EXTERNAL COMPONENTS
import { useNavigate, useLocation } from 'react-router';

// INTERNAL COMPONENTS
import { Button, BackButton, Close } from '../../../global_components/button';
import IntroHeader from '../../window_components/IntroHeader';
import Loader from '../../../global_components/Loader';

const { ipcRenderer } = require('electron');
const LoginService = require('../../../services/login.service');
const AccountService = require('../../../services/account.service');

const SyncSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const syncData: {
    email: string;
    password: string;
    newPassword: string;
    type: string;
  } = location.state as {
    email: string;
    password: string;
    newPassword: string;
    type: string;
  };

  const goToInbox = async () => {
    setLoading(true);

    const account = await LoginService.initAccount(
      syncData.password,
      syncData.email
    );

    if (syncData.type === 'claim') {
      await AccountService.updateAccountPassword({
        email: syncData.email,
        newPass: syncData.newPassword
      });
    }

    ipcRenderer.send('showMainWindow', account);
  };

  useEffect(() => {
    ipcRenderer.on('ACCOUNT_IPC::account:login:status', (event, payload) => {
      setLoadingText(payload);
    });

    return () => {
      ipcRenderer.removeAllListeners('ACCOUNT_IPC::account:login:status');
    };
  }, []);

  return (
    <div className="h-full">
      <div className="relative w-full">
        <div className="absolute top-5 flex justify-between flex-row w-full px-5">
          <BackButton className="" />
          <Close handleClose={() => navigate('/')} />
        </div>
      </div>
      <div className="max-w-xs mx-auto h-full">
        <IntroHeader title="Sync Success.">
          <p className="text-base pt-2 text-gray-500">
            Your file have been successfully synced to this device. You can now
            use your Telios account.
          </p>
        </IntroHeader>
        <div className="mt-4">
          <Button
            type="button"
            onClick={goToInbox}
            loading={isLoading}
            loadingText={loadingText}
          >
            Go to mailbox
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SyncSuccess;
