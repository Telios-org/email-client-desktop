import React, { useState } from 'react';

// EXTERNAL COMPONENTS
import { useNavigate, useLocation } from 'react-router';

// INTERNAL COMPONENTS
import { Button, BackButton, Close } from '../../../global_components/button';
import IntroHeader from '../../window_compoments/IntroHeader';
import Loader from '../../../global_components/Loader';

const { ipcRenderer } = require('electron');
const LoginService = require('../../../services/login.service');

const SyncSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setLoading] = useState(false)

  const syncData: {
    email: string;
    password: string;
  } = location.state as {
    email: string;
    password: string;
  };

  const goToInbox = async () => {
    setLoading(true);
    const account = await LoginService.initAccount(
      syncData.password,
      syncData.email
    );
    ipcRenderer.send('showMainWindow', account);
  };

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
          <p className="text-sm pt-2 text-gray-500">bla bla bla</p>
        </IntroHeader>
        <div className="mt-4">
          <Button type="button" onClick={goToInbox} loading={isLoading}>
            Go to mailbox
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SyncSuccess;
