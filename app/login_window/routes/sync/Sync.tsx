import React, { useState } from 'react';

// EXTERNAL LIBRAIRIES
import { useNavigate, useLocation } from 'react-router';
import { ChevronRightIcon } from '@heroicons/react/outline';
// INTERNAL SERVICES
import AccountService from '../../../services/account.service';
// INTERNAL COMPONENTS
import IntroHeader from '../../window_components/IntroHeader';
import { Input } from '../../../global_components/input-groups';
import { Button, BackButton, Close } from '../../../global_components/button';

const Sync = () => {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { type = 'accountsettings' } = location.state as {
    type: string;
  };

  const getSyncInfo = async e => {
    e.preventDefault();
    setLoading(true);
    AccountService.getSyncInfo(code)
      .then(data => {
        const { driveKey, email } = data;
        navigate('./masterpassword', {
          state: {
            type,
            driveKey,
            email
          }
        });
        return data;
      })
      .catch(error => {
        console.log(error);
        setLoading(false);
        setError('Invalid Code');
      });
  };

  const onChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    if (error.length > 0) {
      setError('');
    }
    setCode(e.target.value);
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
        <IntroHeader title="Device Sync.">
          {type === null ||
            (type === 'accountsettings' && (
              <>
                <p className="text-base pt-2 text-gray-500">
                  Add your Telios account to another device. Sign into your
                  other device and generate a sync code by navigating to:
                </p>
                <p className="text-xs my-6 text-center w-full space-x-1 flex flex-row justify-center items-center">
                  <span className="font-medium text-center bg-gray-100 rounded p-1 shadow-inner">
                    Settings
                  </span>
                  <ChevronRightIcon className="h-4 w-4 " aria-hidden="true" />
                  <span className="font-medium text-center bg-gray-100 rounded p-1 shadow-inner">
                    Devices
                  </span>
                  <ChevronRightIcon className="h-4 w-4 " aria-hidden="true" />
                  <span className="font-medium text-center bg-gray-100 rounded p-1 shadow-inner">
                    Sync New Device
                  </span>
                </p>
              </>
            ))}
          {type && type === 'recovery' && (
            <>
              <p className="text-base pt-2 text-gray-500">
                Add your Telios account to this device by using the sync code
                sent to your recovery email.
              </p>
            </>
          )}
          {type && type === 'claim' && (
            <>
              <p className="text-base pt-2 text-gray-500">
                Claim your Telios Business account by using the sync code
                in the email invitation sent by your organization admin.
              </p>
            </>
          )}
        </IntroHeader>
        <form onSubmit={getSyncInfo} className="mt-4 space-y-8">
          <Input
            label="Temporary Sync Code"
            id="sync-code"
            name="sync-code"
            type="text"
            placeholder="Enter it here..."
            required
            icon="key"
            error={error}
            onChange={onChange}
            value={code}
          />
          <Button type="submit" loading={loading} disabled={code.length === 0}>
            Next
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Sync;
