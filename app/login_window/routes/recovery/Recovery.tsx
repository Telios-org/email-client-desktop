import React, { useState } from 'react';

// INTERNAL LIBRAIRIES
import ClientSDK from '@telios/client-sdk';

// EXTERNAL COMPONENTS
import { useNavigate, useLocation } from 'react-router';
import { Link } from 'react-router-dom';

// INTERNAL COMPONENTS
import { Button, BackButton, Close } from '../../../global_components/button';
import IntroHeader from '../../window_components/IntroHeader';
import { Textareas } from '../../../global_components/textareas';
import { Input, Password } from '../../../global_components/input-groups';

// INTERNAL HELPERS
import useForm from '../../../utils/hooks/useForm';
import { externalEmailRE } from '../../../utils/helpers/regex';

const envAPI = require('../../../env_api.json');

const params = window.location.search.replace('?', '');
const env = params.split('=')[1];
const requestBase = env === 'production' ? envAPI.prod : envAPI.dev;
const mailDomain = env === 'production' ? envAPI.prodMail : envAPI.devMail;

const teliosSDK = new ClientSDK({
  provider: requestBase
});
const mailbox = teliosSDK.Mailbox;
const AccountService = require('../../../services/account.service');

const Recovery = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [validationLoader, setValidationLoader] = useState(false);
  const [accountValidationLoader, setAccountValidationLoader] = useState(false);

  const {
    handleSubmit,
    handleChange,
    manualChange,
    resetForm,
    isDirty,
    runValidations,
    bulkChange,
    data,
    errors
  } = useForm({
    initialValues: {
      recoveryEmail: '',
      accountEmail: ''
    },
    validationDebounce: 500,
    validations: {
      accountEmail: {
        required: {
          value: true,
          message: 'Required field.'
        },
        pattern: {
          value: externalEmailRE,
          message: 'Invalid email address'
        },
        custom: {
          isValid: async (value, data) => {
            const mailboxes = await mailbox.getMailboxPubKeys([value]);
            if (mailboxes[value]) {
              return true;
            }
            return false;
          },
          message: 'Invalid email address'
        }
      },
      recoveryEmail: {
        required: {
          value: true,
          message: 'Required field.'
        },
        pattern: {
          value: externalEmailRE,
          message: 'Invalid email address'
        }
      }
    },
    onSubmit: async data => {
      const email = `${data.accountEmail.toLowerCase()}`;
      
      setLoading(true);

      AccountService.recoverAccount({
        email,
        recoveryEmail: data.recoveryEmail
      })
        .then(data => {
          return data;
        })
        .catch(error => {
          console.log(error);
        });

      navigate('/sync', {
        state: {
          type: 'recovery'
        }
      });
    }
  });

  const handleAccountChange = e => {
    setAccountValidationLoader(true);
    handleChange(
      'accountEmail',
      true,
      value => value.toLowerCase(),
      () => {
        setAccountValidationLoader(false);
      }
    )(e);
  };

  const handleRecoveryChange = e => {
    setValidationLoader(true);
    handleChange(
      'recoveryEmail',
      true,
      value => value.toLowerCase(),
      () => {
        setValidationLoader(false);
      }
    )(e);
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
            Retrieve your account using the recovery email you chose when
            registering your account.
          </p>
        </IntroHeader>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 flex-1 flex flex-col justify-between pb-8"
        >
          <div className="space-y-5">
            <Input
              id="accountEmail"
              name="accountEmail"
              label="Telios Account"
              icon="email"
              value={data.accountEmail}
              error={errors.accountEmail}
              onChange={handleAccountChange}
              activityPosition="right"
              isValid={
                errors.accountEmail === '' || errors.accountEmail === undefined
              }
              showLoader={accountValidationLoader}
            />
            <Input
              id="accountRecovery"
              name="accountRecovery"
              label="Recovery Email"
              icon="email"
              value={data.recoveryEmail}
              error={errors.recoveryEmail}
              onChange={handleRecoveryChange}
              activityPosition="right"
              isValid={
                errors.recoveryEmail === '' ||
                errors.recoveryEmail === undefined
              }
              showLoader={validationLoader}
            />
          </div>
          <Button
            type="submit"
            loading={loading}
            disabled={
              data.accountEmail.length === 0 || data.recoveryEmail.length === 0
            }
          >
            Send Code
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Recovery;
