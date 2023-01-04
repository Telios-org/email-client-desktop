import React, { useState, useEffect } from 'react';

// EXTERNAL COMPONENTS
import { useNavigate, useLocation } from 'react-router';

// INTERNAL COMPONENTS
import clsx from 'clsx';
import { Button, BackButton, Close } from '../../../global_components/button';
import IntroHeader from '../../window_components/IntroHeader';
import { Input, Password } from '../../../global_components/input-groups';

// internal Helpers
import passwordStrengthClass from '../../../utils/helpers/security';
import useForm from '../../../utils/hooks/useForm';

const zxcvbn = require('zxcvbn');

const MasterPassword = () => {
  const [loading, setLoading] = useState(false);
  const [nextStepDisabled, setNextStepDisabled] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const syncData: { driveKey: string; email: string } = location.state as {
    type: string;
    driveKey: string;
    email: string;
  };

  const {
    handleSubmit,
    handleChange,
    manualChange,
    runValidations,
    bulkChange,
    data,
    errors
  } = useForm({
    initialValues: {
      password: '',
      newPassword: '',
      confirmPassword: '',
      passwordStrength: {
        score: 0,
        crackTime: ''
      }
    },
    validationDebounce: 500,
    validations: {
      password: {
        required: {
          value: true,
          message: 'Required field.'
        }
      },
      newPassword: {
        custom: {
          isValid: (value, data) => {
            if (syncData?.type === 'claim') {
              return (
                value.length >= 14 &&
                data.passwordStrength.score > 3 &&
                (data.confirmPassword.length === 0 ||
                  value === data.confirmPassword)
              );
            }
            return true;
          },
          message: 'Password too weak. You need at least 14 characters.'
        }
      },
      confirmPassword: {
        custom: {
          isValid: (value, data) => {
            if (syncData?.type === 'claim') {
              return value === data.newPassword;
            }
            return true;
          },
          message: 'Passwords must match'
        }
      }
    },
    onSubmit: async data => {
      setLoading(true);
      navigate('../syncpending', {
        state: {
          ...syncData,
          password: data.password,
          newPassword: data.newPassword
        }
      });
    }
  });

  const togglePasswordView = () => {
    setShowPassword(!showPassword);
  };

  const onPasswordChange = async e => {
    const newPassword = e.target.value;
    const result = zxcvbn(newPassword);
    await bulkChange(
      {
        newPassword,
        passwordStrength: {
          score: result.score,
          crackTime:
            result.crack_times_display.offline_slow_hashing_1e4_per_second
        }
      },
      data.confirmPassword.length > 0
        ? ['newPassword', 'confirmPassword']
        : ['newPassword']
    );
  };

  // const onPressNext = async e => {
  //   e.preventDefault();
  //   setLoading(true);
  //   navigate('../syncpending', {
  //     state: {
  //       ...syncData,
  //       password: data.password
  //     }
  //   });
  // };

  useEffect(() => {
    if (syncData.type === 'claim') {
      if (errors.newPassword !== '') {
        setNextStepDisabled(true);
      } else if (errors.confirmPassword !== '') {
        setNextStepDisabled(true);
      } else if (
        data.newPassword.length < 14 ||
        data.confirmPassword.length < 14
      ) {
        setNextStepDisabled(true);
      } else {
        setNextStepDisabled(false);
      }
    } else if (errors.password !== '' && data.password.length > 0) {
      setNextStepDisabled(false);
    }
  }, [
    errors.password,
    errors.newPassword,
    errors.confirmPassword,
    data.newPassword,
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
      <div className="max-w-xs mx-auto h-full">
        <IntroHeader title="Verify Sync.">
          <p
            className={clsx(
              syncData.type === 'claim' && 'hidden',
              'text-base pt-2 text-gray-500'
            )}
          >
            Enter the Master Password for the email below.
          </p>
        </IntroHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          <Input
            label="Email"
            id="sync-code"
            name="sync-code"
            type="text"
            icon="email"
            placeholder=""
            disabled
            value={syncData?.email}
          />
          <Password
            label={syncData.type === 'claim' ? 'Current Password' : 'Password'}
            id="password"
            name="password"
            value={data.password}
            required
            show={showPassword}
            onVisibilityToggle={togglePasswordView}
            onChange={handleChange('password')}
            error={errors.password}
            className=""
          />
          {syncData.type === 'claim' && (
            <>
              <Password
                label="New Password"
                id="newpassword"
                name="newpassword"
                value={data.newPassword}
                required
                show={showPassword}
                onVisibilityToggle={togglePasswordView}
                onChange={onPasswordChange}
                error={errors.newPassword}
                className=""
              />
              <Password
                label="Confirm New Password"
                id="confirmpassword"
                name="confrimpassword"
                value={data.confirmPassword}
                required
                show={showPassword}
                onVisibilityToggle={togglePasswordView}
                onChange={handleChange('confirmPassword', true)}
                error={errors.confirmPassword}
                className=""
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
                      data.newPassword,
                      data.passwordStrength.score
                    )
                  )}
                >
                  <span className="self-center justify-center flex capitalize tracking-wider">
                    {data.newPassword.length > 0
                      ? data.passwordStrength.crackTime
                      : 'No Password'}
                  </span>
                </div>
                {/* <div className="mt-1 text-xs text-neutral-500 text-center">
                Note: Your password should be 14 characters or more.
                </div> */}
              </div>
            </>
          )}
          <Button type="submit" loading={loading} disabled={nextStepDisabled}>
            Next
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MasterPassword;
