import React, { useState } from 'react';

// EXTERNAL COMPONENTS
import { useNavigate, useLocation } from 'react-router';

// INTERNAL COMPONENTS
import { Button, BackButton, Close } from '../../../global_components/button';
import IntroHeader from '../../window_compoments/IntroHeader';
import { Input, Password } from '../../../global_components/input-groups';

const MasterPassword = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const syncData: { driveKey: string; email: string } = location.state as {
    driveKey: string;
    email: string;
  };

  const onPressNext = async e => {
    e.preventDefault();
    setLoading(true);
    navigate('../syncpending', {
      state: {
        ...syncData,
        password
      }
    });
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
        <IntroHeader title="Verify Sync.">
          <p className="text-sm pt-2 text-gray-500">
            Enter the Master Password for the email below.
          </p>
        </IntroHeader>

        <form onSubmit={onPressNext} className="mt-4 space-y-4">
          <Input
            label="Email"
            id="sync-code"
            name="sync-code"
            type="text"
            placeholder=""
            disabled
            value={syncData?.email}
          />
          <Password
            label="Password"
            id="password"
            name="password"
            value={password}
            required
            onChange={e => {
              setPassword(e.target.value);
            }}
            error={error}
            className=""
          />
          <Button type="submit" loading={loading}>
            Next
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MasterPassword;
