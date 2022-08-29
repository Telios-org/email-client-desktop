import React, { useState } from 'react';

// EXTERNAL COMPONENTS
import { useNavigate, useLocation } from 'react-router';
import { Link } from 'react-router-dom';

// INTERNAL COMPONENTS
import { Button, BackButton, Close } from '../../../global_components/button';
import IntroHeader from '../../window_components/IntroHeader';
import { Textareas } from '../../../global_components/textareas';
import { Input, Password } from '../../../global_components/input-groups';

const envAPI = require('../../../env_api.json');

const params = window.location.search.replace('?', '');
const env = params.split('=')[1];
const mailDomain = env === 'production' ? envAPI.prodMail : envAPI.devMail;

const Recovery = () => {
  const [loading, setLoading] = useState(false);
  const [accountEmail, setAccountEmail] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [accountError, setAccountError] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const handleAccountChange = e => {
    const { value } = e.target;
    setAccountEmail(value);
  };

  const handleRecoveryChange = e => {
    const { value } = e.target;
    setRecoveryEmail(value);
  };

  const onPressNext = async e => {
    e.preventDefault();
    setLoading(true);
    if (accountEmail && recoveryEmail) {
      navigate('./code', {
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
        <IntroHeader title="Account Recovery.">
          <p className="text-base pt-2 text-gray-500">
            Retrieve your account using your recovery email.
          </p>
        </IntroHeader>

        <form
          onSubmit={onPressNext}
          className="mt-8 space-y-4 flex-1 flex flex-col justify-between pb-8"
        >
          <div className="space-y-5">
            <Input
              id="accountEmail"
              name="accountEmail"
              label="Telios Account"
              icon="email"
              value={accountEmail}
              error={accountError}
              onChange={handleAccountChange}
              addonPosition="right"
              addonLabel={`@${mailDomain}`}
              className="text-right"
            />
            <Input
              id="accountRecovery"
              name="accountRecovery"
              label="Recovery Email"
              icon="email"
              value={recoveryEmail}
              error={recoveryError}
              onChange={handleRecoveryChange}
            />
          </div>
          <Button
            type="submit"
            loading={loading}
            disabled={accountEmail.length === 0 || recoveryEmail.length === 0}
          >
            Next
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Recovery;
