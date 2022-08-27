import React, { useState, useEffect } from 'react';

// External Libraries
import {
  useNavigate,
  useLocation,
  Navigate,
  Outlet,
  matchRoutes,
  Link
} from 'react-router-dom';
import Store from 'electron-store';

// Internal Librairies
import ClientSDK from '@telios/client-sdk';
import { validateEmail } from '../../../utils/helpers/regex';

// Internal Helper Librairies
import useForm from '../../../utils/hooks/useForm';

const { ipcRenderer, remote } = require('electron');

const { dialog } = remote;
const fs = require('fs');
const zxcvbn = require('zxcvbn');
const envAPI = require('../../../env_api.json');

const Login = require('../../../services/login.service');

const params = window.location.search.replace('?', '');
const env = params.split('=')[1];

console.log('ENV VAR::', env);

const requestBase = env === 'production' ? envAPI.prod : envAPI.dev;
const mailDomain = env === 'production' ? envAPI.prodMail : envAPI.devMail;

const teliosSDK = new ClientSDK({
  provider: requestBase
});
const mailbox = teliosSDK.Mailbox;

const Registration = () => {
  const navigate = useNavigate();

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
      recoveryEmail: '',
      password: '',
      confirmPassword: '',
      email: '',
      terms: false,
      marketing: false
    },
    validationDebounce: 500,
    validations: {
      email: {
        required: {
          value: true,
          message: 'Required field.'
        },
        pattern: {
          value: /^[A-Z0-9]+(?:\.[A-Z0-9]+)*$/i,
          message: 'Invalid email address.'
        },
        custom: {
          isValid: async (value, data) => {
            const val = `${value}@${mailDomain}`;
            const mailboxes = await mailbox.getMailboxPubKeys([val]);
            if (!mailboxes[val]) {
              return true;
            }
            return false;
          },
          message: 'Email is not available'
        }
      },
      recoveryEmail: {
        required: {
          value: true,
          message: 'Required field.'
        },
        custom: {
          isValid: async (value, data) => {
            return validateEmail(value);
          },
          message: 'Invalid email address.'
        }
      },
      password: {
        required: {
          value: true,
          message: 'Required field.'
        },
        custom: {
          isValid: (value, data) => {
            return value.length > 14;
          },
          message: 'Password must be at least 14 characters'
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
      },
      terms: {
        custom: {
          isValid: (value, data) => value
        },
        message: 'You must accept the terms and conditions'
      }
    },
    onSubmit: async data => {
      const email = `${data.email.toLowerCase()}@${mailDomain}`;
    }
  });

  return (
    <Outlet
      context={{
        handleSubmit,
        handleChange,
        manualChange,
        resetForm,
        isDirty,
        runValidations,
        data,
        errors,
        mailDomain
      }}
    />
  );
};

export default Registration;
