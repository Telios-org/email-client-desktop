import React, { useState } from 'react';

// EXTERNAL COMPONENTS
import { useNavigate, useLocation } from 'react-router';
import { Link } from 'react-router-dom';

// INTERNAL COMPONENTS
import { Button, BackButton, Close } from '../../../global_components/button';
import IntroHeader from '../../window_components/IntroHeader';
import { Textareas } from '../../../global_components/textareas';
import { Input, Password } from '../../../global_components/input-groups';

const RecoveryCode = () => {
  const [loading, setLoading] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [codeError, setCodeError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { accountEmail, recoveryEmail } = location.state as { accountEmail: string; recoveryEmail:string; };

  const handleCodeChange = e => {
    const { value } = e.target;
    setRecoveryCode(value);
  };

  const onPressNext = async e => {
    e.preventDefault();
    setLoading(true);
    if (recoveryCode) {
      navigate('./success', {
        state: {
          accountEmail,
          recoveryEmail
        }
      });
    }
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
        <IntroHeader title="Recovery Code.">
          <p className="text-base pt-2 text-gray-500">
            Enter the recovery code
          </p>
        </IntroHeader>

        <form
          onSubmit={onPressNext}
          className="mt-8 space-y-4 flex-1 flex flex-col justify-between pb-8"
        >
          <div className="space-y-5">
            <Input
              id="code"
              name="code"
              label="Code"
              value={recoveryCode}
              error={codeError}
              onChange={handleCodeChange}
            />
          </div>
          <Button type="submit" loading={loading}>
            Next
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RecoveryCode;
