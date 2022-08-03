import React from 'react';

// EXTERNAL COMPONENTS
import { useNavigate, useLocation } from 'react-router';

// INTERNAL COMPONENTS
import { Button, BackButton, Close } from '../../../global_components/button';
import IntroHeader from '../../window_compoments/IntroHeader';
import Loader from '../../../global_components/Loader';

const SyncError = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const syncData: {
    error: Error;
    email: string;
    password: string;
  } = location.state as {
    error: Error;
    email: string;
    password: string;
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
        <IntroHeader title="Sync Error.">
          <p className="text-sm pt-2 text-gray-500">Something went wrong!</p>
        </IntroHeader>
        <div className="mt-4">{syncData?.error?.message}</div>
      </div>
    </div>
  );
};

export default SyncError;
