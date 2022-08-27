import React, { useState } from 'react';

// EXTERNAL COMPONENTS
import { useNavigate, useLocation } from 'react-router';
import { ExclamationIcon, DocumentSearchIcon } from '@heroicons/react/solid';

// INTERNAL COMPONENTS
import { Button, BackButton, Close } from '../../../global_components/button';

const ResetFailure = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showError, setShowError] = useState(false);

  const { error } = location.state as {
    error: Error;
  };

  return (
    <div className="h-full">
      <div className="relative w-full">
        <div className="absolute top-5 flex justify-between flex-row w-full px-5">
          <BackButton className="" />
          <Close handleClose={() => navigate('/')} />
        </div>
      </div>
      <div className="max-w-xs mx-auto h-full flex flex-col">
        <div className="mb-8">
          <div className=" mt-28 mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <ExclamationIcon
              className="h-8 w-8 text-red-600"
              aria-hidden="true"
            />
          </div>
          <div className="mt-3 text-center sm:mt-5">
            <h3 className="font-bold text-black">Something went wrong!</h3>
            <div className="mt-5">
              <p className="text-sm text-gray-500">
                We were unable to reset your password, make sure the recovery
                passphrase is accurate. Should this issue persist contact
                Support at <b>support@corp.telios.io</b> for further assistsance.
              </p>
            </div>
          </div>
        </div>
        <Button onClick={() => navigate('/')}>Back to Login</Button>
       {showError && <div className="text-red-500 text-sm overflow-scroll mt-5">
            <p><span className="text-gray-500 font-medium">Error:</span> {error.message}</p>
            <p><span className="text-gray-500 font-medium">Stacktrace:</span> {error.stack}</p>
        </div>}
      </div>
      <div className="absolute bottom-4 right-4">
        <DocumentSearchIcon
          className="h-6 w-6 text-gray-300"
          aria-hidden="true"
          style={{ cursor: 'pointer' }}
          onClick={() => setShowError(!showError)}
        />
      </div>
    </div>
  );
};

export default ResetFailure;
