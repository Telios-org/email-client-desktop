import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

// EXTERNAL HELPERS
import clsx from 'clsx';

// INTERNAL COMPONENTS
import { Button, BackButton, Close } from '../../../global_components/button';
import IntroHeader from '../../window_components/IntroHeader';
import { Password } from '../../../global_components/input-groups';

// internal Helpers
import passwordStrengthClass from '../../../utils/helpers/security';

const zxcvbn = require('zxcvbn');

type Form = {
  handleChange: (
    key: string,
    validation?: boolean,
    sanitize?: (val: any) => any,
    validationCallback?: () => void
  ) => (e) => void;
  manualChange: (key: string, value: any) => void;
  runValidations: (subset: string[]) => Promise<any>;
  data: {
    recoveryEmail: '';
    password: '';
    confirmPassword: '';
    email: '';
    terms: false;
    marketing: false;
    passwordStrength: {
      score: number;
      crackTime: string;
    };
  };
  errors: any;
  mailDomain: string;
  bulkChange: (obj: any, validationArray?: string[]) => void;
};

const SetPassword = () => {
  const {
    handleChange,
    manualChange,
    runValidations,
    data,
    errors,
    mailDomain,
    bulkChange
  }: Form = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [nextStepDisabled, setNextStepDisabled] = useState(false);
  const navigate = useNavigate();

  const onPressNext = async e => {
    e.preventDefault();
    setLoading(true);

    const formValid = await runValidations(['password', 'confirmPassword']);

    if (formValid) {
      navigate('../recovery');
    } else {
      setLoading(false);
    }
  };

  const togglePasswordView = () => {
    setShowPassword(!showPassword);
  };

  const onPasswordChange = async e => {
    const password = e.target.value;
    const result = zxcvbn(password);
    await bulkChange(
      {
        password,
        passwordStrength: {
          score: result.score,
          crackTime:
            result.crack_times_display.offline_slow_hashing_1e4_per_second
        }
      },
      data.confirmPassword.length > 0
        ? ['password', 'confirmPassword']
        : ['password']
    );
  };

  useEffect(() => {
    if (errors.password !== '') {
      setNextStepDisabled(true);
    } else if (errors.confirmPassword !== '') {
      setNextStepDisabled(true);
    } else if (data.password.length < 14) {
      setNextStepDisabled(true);
    } else {
      setNextStepDisabled(false);
    }
  }, [
    errors.password,
    errors.confirmPassword,
    data.password,
    data.confirmPassword
  ]);

  return (
    <div className="h-full">
      <div className="relative w-full">
        <div className="absolute top-5 flex justify-between flex-row w-full px-5">
          <BackButton className="" />
          <Close handleClose={() => navigate('/')} />
        </div>
      </div>
      <div className="max-w-xs mx-auto h-full flex flex-col">
        <IntroHeader title="Master Password.">
          <p className="text-base pt-2 text-gray-500">
            This is a critical part of your account security. Keep your password
            safe.
          </p>
        </IntroHeader>

        <form
          onSubmit={onPressNext}
          className="mt-8 space-y-4 flex-1 flex flex-col justify-between pb-8"
        >
          <div className="flex flex-col space-y-5">
            <Password
              label="Password"
              id="password"
              name="password"
              autoComplete="current-password"
              required
              onChange={onPasswordChange}
              error={errors.password}
              show={showPassword}
              value={data.password}
              onVisibilityToggle={togglePasswordView}
            />
            <Password
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="current-password"
              required
              onChange={handleChange('confirmPassword', true)}
              error={errors.confirmPassword}
              show={showPassword}
              value={data.confirmPassword}
              onVisibilityToggle={togglePasswordView}
            />
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Time to Crack Password
              </label>
              <div
                className={clsx(
                  `mt-1 items-center justify-center appearance-none block w-full px-3 py-2 rounded-md shadow-sm font-medium sm:text-sm`,
                  passwordStrengthClass(
                    data.password,
                    data.passwordStrength.score
                  )
                )}
              >
                <span className="self-center justify-center flex capitalize tracking-wider">
                  {data.password.length > 0
                    ? data.passwordStrength.crackTime
                    : 'No Password'}
                </span>
              </div>
              {/* <div className="mt-1 text-xs text-neutral-500 text-center">
                Note: Your password should be 14 characters or more.
                </div> */}
            </div>
          </div>
          <Button type="submit" loading={loading} disabled={nextStepDisabled}>
            Next
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SetPassword;
