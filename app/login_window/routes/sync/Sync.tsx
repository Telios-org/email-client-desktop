import React, { useState } from 'react';

// EXTERNAL LIBRAIRIES
import { useNavigate } from 'react-router';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline';
// INTERNAL SERVICES
import AccountService from '../../../services/account.service';
// INTERNAL COMPONENTS
import IntroHeader from '../../window_compoments/IntroHeader';
import { Input } from '../../../global_components/input-groups';
import { Button } from '../../../global_components/button';

const Sync = () => {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const getSyncInfo = async () => {
    setLoading(true);
    const {
      drive_key: driveKey,
      peer_pub_key: peerPubKey,
      email
    } = await AccountService.getSyncInfo(code);
    navigate('masterpassword', {
      state: {
        driveKey,
        email
      }
    });
  };

  return (
    <div className="h-full">
      <div className="relative w-full">
        <button
          type="button"
          className="absolute top-5 left-5 flex flex-row items-center text-gray-400 hover:text-gray-700 outline-none"
          onClick={() => navigate(-1)}
        >
          <ChevronLeftIcon
            className="flex-shrink-0 h-5 w-5 "
            aria-hidden="true"
          />
          <span>Back</span>
        </button>
      </div>
      <div className="max-w-xs mx-auto h-full">
        <IntroHeader title="Device Sync.">
          <p className="text-sm pt-2 text-gray-500">
            Add your Telios account to another device. Sign into your other
            device and generate a sync code by navigating to:
          </p>
          <p className="text-xs my-6 text-center w-full space-x-1 flex flex-row justify-center">
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
        </IntroHeader>

        <form onSubmit={getSyncInfo} className="mt-4 space-y-4">
          <Input
            label="Temporary Sync Code"
            id="sync-code"
            name="sync-code"
            type="text"
            placeholder="Enter it here..."
            required
            onChange={(e: {
              target: { value: React.SetStateAction<string> };
            }) => setCode(e.target.value)}
            value={code}
          />
          <Button type="submit" loading={loading}>
            Next
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Sync;
