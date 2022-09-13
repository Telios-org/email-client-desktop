import React, { useState, useEffect } from 'react';

// EXTERNAL COMPONENTS
import { useNavigate, useLocation } from 'react-router';
import clsx from 'clsx';


// INTERNAL HOOKS
import useForm from '../../../utils/hooks/useForm';

// INTERNAL HELPERS
import passwordStrengthClass from '../../../utils/helpers/security';

// INTERNAL COMPONENTS
import { Button, BackButton, Close } from '../../../global_components/button';
import IntroHeader from '../../window_components/IntroHeader';
import { Password } from '../../../global_components/input-groups';

const zxcvbn = require('zxcvbn');
const AccountService = require('../../../services/account.service');

const SetNewPassword = () => {
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    crackTime: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { passphrase, email } = location.state as {
    passphrase: string;
    email: string;
  };

  const {
    handleSubmit,
    handleChange,
    manualChange,
    resetForm,
    isDirty,
    runValidations,
    data,
    errors
  } = useForm({
    initialValues: {
      password: '',
      confirmPassword: ''
    },
    validationDebounce: 500,
    validations: {
      password: {
        required: {
          value: true,
          message: 'Required field.'
        },
        custom: {
          isValid: (value, data) => {
            return value.length > 14 && passwordStrength.score > 3;
          },
          message: 'Password too weak. You need at least 14 characters.'
        }
      },
      confirmPassword: {
        required: {
          value: true,
          message: 'Required field.'
        },
        custom: {
          isValid: (value, data) => {
            return value === data.password;
          },
          message: 'Passwords must match'
        }
      }
    },
    onSubmit: async data => {
      console.log(data);
      setLoading(true);
      AccountService.resetAccountPassword({
        passphrase,
        email,
        newPass: data.password
      })
        .then(data => {
          navigate('../resetsuccess');
          return data;
        })
        .catch(error => {
          navigate('../resetfailure', { state: { error } });
        });
      setLoading(false);
    }
  });

  const togglePasswordView = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const result = zxcvbn(data.password);
    setPasswordStrength({
      score: result.score,
      crackTime: result.crack_times_display.offline_slow_hashing_1e4_per_second
    });
  }, [data.password]);

  return (
    <div className="h-full">
      <div className="relative w-full">
        <div className="absolute top-5 flex justify-between flex-row w-full px-5">
          <BackButton className="" />
          <Close handleClose={() => navigate('/')} />
        </div>
      </div>
      <div className="max-w-xs mx-auto h-full flex flex-col">
        <IntroHeader title="Reset Password.">
          <p className="text-base pt-2 text-gray-500">
            Set your new master password. This is used to access your data and
            encryption keys. Don't forget it.
          </p>
        </IntroHeader>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex-1 flex flex-col justify-between pb-8"
        >
          <div className="flex flex-col space-y-5">
            <Password
              label="Password"
              id="password"
              name="password"
              autoComplete="current-password"
              required
              onChange={handleChange('password', true)}
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
                  passwordStrengthClass(data.password, passwordStrength.score)
                )}
              >
                <span className="self-center justify-center flex capitalize tracking-wider">
                  {data.password.length > 0
                    ? passwordStrength.crackTime
                    : 'No Password'}
                </span>
              </div>
              {/* <div className="mt-1 text-xs text-neutral-500 text-center">
                Note: Your password should be 14 characters or more.
                </div> */}
            </div>
          </div>
          <Button type="submit" loading={loading}>
            Change Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SetNewPassword;
