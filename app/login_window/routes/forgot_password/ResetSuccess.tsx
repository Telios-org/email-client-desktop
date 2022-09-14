import React from 'react';

// EXTERNAL COMPONENTS
import { useNavigate, useLocation } from 'react-router';
import { CheckIcon } from '@heroicons/react/outline';


// INTERNAL COMPONENTS
import { Button, BackButton, Close } from '../../../global_components/button';

const ResetSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();


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
        <div className=" mt-28 mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
          <CheckIcon
            className="h-8 w-8 text-green-600"
            aria-hidden="true"
          />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <h3 className="font-bold text-black">Password changed!</h3>
          <div className="mt-5">
            <p className="text-sm text-gray-500">
              Your password was successfully updated. 
              You can now return to the login page and log back into your account.
            </p>
          </div>
        </div>
      </div>
      <Button onClick={() => navigate('/')}>Back to Login</Button>
    </div>
  </div>
  );
};

export default ResetSuccess;
