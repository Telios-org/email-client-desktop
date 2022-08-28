import React, { useState } from 'react';

// EXTERNAL COMPONENTS
import { useNavigate, useLocation } from 'react-router';
import { Link } from 'react-router-dom';

// INTERNAL COMPONENTS
import { Button, BackButton, Close } from '../../../global_components/button';
import IntroHeader from '../../window_components/IntroHeader';
import { Textareas } from '../../../global_components/textareas';
import { Input, Password } from '../../../global_components/input-groups';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state as { email: string };

  const handleChange = e => {
    const { value } = e.target;
    setPassphrase(value);
  };

  const onPressNext = async e => {
    e.preventDefault();
    setLoading(true);
    if (passphrase) {
      navigate('./setnewpassword', {
        state: {
          passphrase,
          email
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
        <IntroHeader title="Forgot Password.">
          <p className="text-sm pt-2 text-gray-500">
            Reset your password using the recovery phrase assigned to you during
            account registration.
          </p>
        </IntroHeader>

        <form
          onSubmit={onPressNext}
          className="mt-8 space-y-4 flex-1 flex flex-col justify-between pb-8"
        >
          <div className="space-y-5">
            <Input
              label="Email"
              id="sync-code"
              name="sync-code"
              type="text"
              placeholder=""
              disabled
              value={email}
            />
            <div>
              <Textareas
                id="passphrase"
                name="passphrase"
                value={passphrase}
                onChange={handleChange}
                required
                error={error}
                label="Recovery Phrase"
              />
              <Link
                to="/accountrecovery"
                className="block w-full text-right mt-3 text-xs text-purple-500 hover:text-purple-600 font-medium"
              >
                I lost my recovery phrase?
              </Link>
            </div>
          </div>
          <Button type="submit" loading={loading}>
            Next
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
