import React from 'react';

// EXTERNAL COMPONENTS
import { useNavigate, useLocation } from 'react-router';

// INTERNAL COMPONENTS
import { Button, BackButton, Close } from '../../../global_components/button';
import IntroHeader from '../../window_components/IntroHeader';
import Loader from '../../../global_components/Loader';

// INTERNAL HOOK LIBRARY
import useAccountSync from '../../../utils/hooks/useAccountSync';

const SyncPending = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const syncData: {
    driveKey: string;
    email: string;
    password: string;
  } = location.state as {
    driveKey: string;
    email: string;
    password: string;
  };

  console.log(syncData, 'SYNCDATA');

  const onSyncSuccess = () => {
    navigate('../syncsuccess', {
      state: {
        email: syncData.email,
        password: syncData.password
      }
    });
  };

  const onSyncError = (error: Error) => {
    navigate('../syncerror', {
      state: {
        email: syncData.email,
        password: syncData.password,
        error
      }
    });
  };

  const { isLoading, initSync, filesSynced } = useAccountSync(
    onSyncSuccess,
    onSyncError
  );

  const loadingComponent =
    filesSynced > 0 && filesSynced <= 100 ? (
      <div>{`In progress. ${filesSynced}% complete.`}</div>
    ) : (
      <Loader className="h-8 w-8 text-gray-600" />
    );

  return (
    <div className="h-full">
      <div className="relative w-full">
        <div className="absolute top-5 flex justify-between flex-row w-full px-5">
          <BackButton className="" />
          <Close handleClose={() => navigate('/')} />
        </div>
      </div>
      <div className="max-w-xs mx-auto h-full">
        <IntroHeader title="Sync.">
          <p className="text-sm pt-2 text-gray-500">
            Your files are being downloaded and synced onto this device. This
            may take a minute.
          </p>
        </IntroHeader>
        <div>
          {isLoading ? (
            loadingComponent
          ) : (
            <Button
              className="mt-4"
              onClick={() =>
                initSync(
                  syncData?.driveKey,
                  syncData?.email,
                  syncData?.password
                )}
            >
              Initiate Sync
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncPending;
