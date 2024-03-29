import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  Fragment
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

// EXTERNAL LIBRARIES
import { Dialog, Combobox, Listbox, Transition } from '@headlessui/react';
import {
  AtSymbolIcon,
  LightningBoltIcon,
  ChevronLeftIcon,
  InboxIcon
} from '@heroicons/react/outline';
import {
  CheckIcon,
  SelectorIcon,
  CheckCircleIcon
} from '@heroicons/react/solid';
import clsx from 'clsx';

// INTERNAL LIBRAIRIES
import useForm from '../../../../../utils/hooks/useForm';
import { Input, Password } from '../../../../../global_components/input-groups';

// INTERNAL COMPONENT
import { Button } from '../../../../../global_components/button';

// ACTION CREATORS
import { registerMailbox } from '../../../../actions/domains/domains';

// HELPER
import { generateRandomPassword } from '../../../../../utils/helpers/generators';
import passwordStrengthClass from '../../../../../utils/helpers/security';

import { externalEmailRE } from '../../../../../utils/helpers/regex';

const zxcvbn = require('zxcvbn');

type Props = {
  close: (isSuccess: boolean, message: string, show?: boolean) => void;
};

const MailboxRegistration = forwardRef((props: Props, ref) => {
  const { close } = props;
  const dispatch = useDispatch();
  const domains = useSelector(state => state.domains.allIds);
  const mailboxes = useSelector(state => state.mail.mailboxes);
  const isBusinessUser = useSelector(
    state => state.account.plan === 'BUSINESS'
  );
  const [searchDomains, setSearchDomains] = useState('');
  const [validationLoader, setValidationLoader] = useState(false);
  const [mailbox, setMailbox] = useState('');
  const [step, setStep] = useState('intro');
  const [type, setType] = useState('SUB');
  const [loading, setLoader] = useState(false);
  const [error, setError] = useState('');

  // const [isBusinessUser, setIsBusinessUser] = useState(false);
  const [readyToSubmit, setReadyToSubmit] = useState(false);

  const {
    handleChange,
    manualChange,
    bulkChange,
    handleSubmit,
    data: form,
    errors
  } = useForm({
    initialValues: {
      domain: domains[0],
      address: '',
      displayName: '',
      recoveryEmail: '',
      password: '',
      passwordStrength: {
        score: 0,
        crackTime: ''
      }
    },
    validations: {
      address: {
        pattern: {
          value: /^\w+([\.-]?\w+)*$/g, // empty ^$ or string
          message: 'No special characters allowed except for . allowed.'
        },
        custom: {
          isValid: (value, data) => {
            const found = mailboxes.allIds.some(
              mb => mailboxes.byId[mb].address === `${value}@${data.domain}`
            );
            if (found) {
              return false;
            }
            return true;
          },
          message: 'Email already exist on this domain.'
        }
      },
      displayName: {
        pattern: {
          value: /^$|^([A-Za-zÀ-ÖØ-öø-ÿ0-9\.\-\/]+\s)*[A-Za-zÀ-ÖØ-öø-ÿ0-9\.\-\/]+$/, // empty ^$ or string
          message: 'No special characters allowed except for . - / allowed.'
        }
      },
      recoveryEmail: {
        custom: {
          isValid: (value, data) => {
            if (type === 'CLAIMABLE') {
              return value && value.length > 0;
            }
            return true;
          },
          message: 'Recovery email must be provided'
        },
        pattern: {
          value: externalEmailRE,
          message: 'Invalid email address'
        }
      },
      password: {
        required: {
          value: true,
          message: 'Password must be provided'
        },
        custom: {
          isValid: (value, data) => {
            return value.length >= 14 && data.passwordStrength.score > 3;
          },
          message: 'Password too weak. You need at least 14 characters.'
        }
      }
    },
    onSubmit: async data => {
      const email = `${data.address}@${data.domain}`;
      const payload = {
        type,
        email,
        displayName: data.displayName.length > 0 ? data.displayName : email,
        domain: data.domain,
        recoveryEmail: data.recoveryEmail,
        password: data.password,
        deviceType: 'DESKTOP'
      };
      setError('');
      setLoader(true);
      const res = await dispatch(registerMailbox({ ...payload }));
      if (res.success) {
        close(true, 'Mailbox created!');
      } else {
        setError(res.status);
      }
      setLoader(false);
    }
  });

  const filteredDomains =
    searchDomains === ''
      ? domains.sort()
      : domains
          .filter(ns =>
            ns
              .toLowerCase()
              .replace(/\s+/g, '')
              .includes(searchDomains.toLowerCase().replace(/\s+/g, ''))
          )
          .sort();

  const generatePassword = () => {
    const cb = async (password: string) => {
      const result = zxcvbn(password);
      await bulkChange({
        password,
        passwordStrength: {
          score: result.score,
          crackTime:
            result.crack_times_display.offline_slow_hashing_1e4_per_second
        }
      });
    };
    setError('');
    generateRandomPassword(14, cb);
  };

  const onEmailChange = e => {
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

  const onPasswordChange = async e => {
    const password = e.target.value;
    const result = zxcvbn(password);
    await bulkChange({
      password,
      passwordStrength: {
        score: result.score,
        crackTime:
          result.crack_times_display.offline_slow_hashing_1e4_per_second
      }
    });
  };

  useEffect(() => {
    const fn = async () => {
      await bulkChange({
        domain: domains[0],
        address: '',
        displayName: '',
        recoveryEmail: '',
        password: '',
        passwordStrength: {
          score: 0,
          crackTime: ''
        }
      });
      setError('');
    };
    fn();
  }, [type, step]);

  useEffect(() => {
    const fn = async () => {
      if (type === 'SUB') {
        if (
          form.address.length > 0 &&
          !errors.address &&
          form.password.length > 0 &&
          !errors.password
        ) {
          setReadyToSubmit(true);
        } else {
          setReadyToSubmit(false);
        }
      } else if (type === 'CLAIMABLE') {
        if (
          form.address.length > 0 &&
          !errors.address &&
          form.password.length > 0 &&
          !errors.password &&
          form.recoveryEmail.length > 0 &&
          !errors.recoveryEmail
        ) {
          setReadyToSubmit(true);
        } else {
          setReadyToSubmit(false);
        }
      }
    };

    fn();
  }, [form.address, form.recoveryEmail, form.password, errors]);

  return (
    <Dialog.Panel
      ref={ref}
      className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all"
    >
      <Dialog.Title
        as="h3"
        className="text-base font-medium leading-6 text-gray-900 flex flex-row mb-4 pt-6 px-6 items-center"
      >
        <InboxIcon
          className="w-5 h-5 text-purple-500 mr-2"
          aria-hidden="true"
        />
        {step === 'intro' && 'New Mailbox - Type'}
        {step !== 'intro' && type === 'CLAIMABLE' && ' New Business Mailbox'}
        {step !== 'intro' && type === 'SUB' && ' New Mailbox Registration'}
      </Dialog.Title>
      {step === 'intro' && (
        <>
          <div className="max-w-md m-auto mb-10">
            <div className="grid grid-cols-1 gap-y-2">
              <div
                className={clsx(
                  'relative bg-white border rounded-lg shadow-sm p-4 flex cursor-pointer focus:outline-none',
                  type === 'SUB'
                    ? 'border-2 border-purple-500'
                    : 'hover:border-gray-300'
                )}
                aria-hidden="true"
                onClick={() => setType('SUB')}
                style={{ cursor: 'pointer' }}
              >
                <span className="flex-1 flex">
                  <span className="flex flex-col">
                    <span
                      id="project-type-1-label"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Sub-Account
                    </span>
                    <span
                      id="project-type-1-description-0"
                      className="mt-1 flex items-center text-sm text-gray-500"
                    >
                      Add a mailbox under your domain for your own use.
                    </span>
                  </span>
                </span>
                {type === 'SUB' && (
                  <CheckCircleIcon className="h-5 w-5 text-purple-600 absolute right-3 top-3" />
                )}
              </div>

              <div
                className={clsx(
                  'relative bg-white border rounded-lg shadow-sm p-4 flex cursor-pointer focus:outline-none',
                  type === 'CLAIMABLE'
                    ? 'border-2 border-purple-500'
                    : 'hover:border-gray-300',
                  !isBusinessUser ? 'border-gray-200 hover:border-gray-200' : ''
                )}
                aria-hidden="true"
                onClick={() => isBusinessUser && setType('CLAIMABLE')}
                style={{
                  cursor: !isBusinessUser ? 'not-allowed' : 'pointer'
                }}
              >
                <span className="flex-1 flex">
                  <span className="flex flex-col">
                    <span
                      id="project-type-0-label"
                      className={clsx(
                        'block text-sm font-medium ',
                        !isBusinessUser ? 'text-gray-400' : 'text-gray-900'
                      )}
                    >
                      Business Account
                    </span>
                    <span
                      id="project-type-0-description-0"
                      className={clsx(
                        'mt-1 text-sm flex flex-col',
                        !isBusinessUser ? 'text-gray-400' : 'text-gray-500'
                      )}
                    >
                      <div>
                        <span>
                          Add a mailbox under your domain for use by someone
                          else.
                        </span>
                      </div>
                      {!isBusinessUser && (
                        <div className="mt-2">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-400 rounded font-medium">
                            Business Plan Feature
                          </span>
                        </div>
                      )}
                    </span>
                  </span>
                </span>
                {type === 'CLAIMABLE' && (
                  <CheckCircleIcon className="h-5 w-5 text-purple-600 absolute right-3 top-3" />
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end py-3 bg-gray-50 text-right px-6 border-t border-gray-300 mt-4">
            <div className="flex flex-row space-x-2">
              <Button
                type="button"
                variant="outline"
                className="pt-2 pb-2"
                onClick={() => close(false, '', false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                className="pt-2 pb-2 whitespace-nowrap"
                onClick={() => setStep('setup')}
                loading={loading}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
      {step !== 'intro' && (
        <>
          <div className="px-6">
            {/* <div className="text-sm mt-6">
              <p className="text-sm text-center font-bold bg-coolGray-100 shadow-sm border border-coolGray-200 py-2 my-3 rounded max-w-md mx-auto">
                {form.address.length > 0 && (
                  <span className="text-purple-600">{form.address}</span>
                )}
                {form.address.length === 0 && (
                  <span className="text-gray-300">address</span>
                )}
                @ 
{' '}
<span>{form.domain}</span>
              </p>
            </div> */}
            <div className="flex flex-col pl-7 my-4">
              {type === 'SUB' && (
                <span className="text-sm font-normal">
                  This will create a brand new mailbox. You can switch between
                  mailboxes by clicking on your profile, in the top right corner
                  of the app.
                </span>
              )}
              {type === 'CLAIMABLE' && (
                <span className="text-sm font-normal">
                  This will create a brand new mailbox that a user will be able
                  to claim via a claim code sent to their recovery email.
                </span>
              )}
            </div>
          </div>
          <form className="max-w-md m-auto relative">
            <div className="mb-6 relative">
              <Input
                label={type === 'SUB' ? 'Mailbox Name' : 'Full Name'}
                onChange={handleChange('displayName', true)}
                value={form.displayName}
                placeholder="Type here..."
                error={errors.displayName}
              />
            </div>
            <Combobox
              value={form.domain}
              onChange={val => manualChange('domain', val)}
            >
              <Combobox.Label className="block text-sm font-medium text-gray-700">
                Domain
              </Combobox.Label>
              <div className="relative mt-1">
                <div className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-2 pr-10 text-left transition duration-150 ease-in-out focus-within:border-violet-500 focus-within:outline-none focus-within:ring-1 focus-within:ring-violet-500 sm:text-sm sm:leading-5">
                  <Combobox.Input
                    className="form-input border-none p-0 focus:ring-0 text-sm pl-1"
                    displayValue={ns => ns}
                    onChange={event => setSearchDomains(event.target.value)}
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <SelectorIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </Combobox.Button>
                </div>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                  afterLeave={() => setSearchDomains('')}
                >
                  <Combobox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {filteredDomains.length === 0 && searchDomains !== '' ? (
                      <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                        Nothing found.
                      </div>
                    ) : (
                      filteredDomains.map(dm => (
                        <Combobox.Option
                          key={dm}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-sky-500 text-white' : 'text-gray-900'
                            }`}
                          style={{ cursor: 'pointer' }}
                          value={dm}
                        >
                          {({ selected, active }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? 'font-medium' : 'font-normal'
                                }`}
                              >
                                {dm}
                              </span>
                              {selected ? (
                                <span
                                  className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                    active ? 'text-white' : 'text-sky-600'
                                  }`}
                                >
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Combobox.Option>
                      ))
                    )}
                  </Combobox.Options>
                </Transition>
              </div>
            </Combobox>
            <div className="my-6 relative">
              <Input
                id="address"
                name="address"
                label="email"
                icon="email"
                value={form.address}
                error={errors.address}
                onChange={handleChange('address', true)}
                addonPosition="right"
                addonLabel={`@${form.domain}`}
                className="text-right"
                isValid={errors.address === '' || errors.address === undefined}
                showLoader={validationLoader}
              />
            </div>

            <div className="relative">
              <div className="my-6 relative">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <div className="relative flex items-stretch flex-grow focus-within:z-10">
                    <input
                      type="text"
                      name="password"
                      id="password"
                      value={form.password}
                      onChange={onPasswordChange}
                      className="form-input focus:ring-violet-500 focus:border-violet-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                      placeholder="Type password here..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="-ml-px relative group inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                  >
                    <LightningBoltIcon
                      className="h-5 w-5 text-gray-400 group-hover:text-gray-600"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>

              <div className="text-xs text-red-500 absolute -bottom-5 pl-2">
                {errors?.password?.length > 0 && errors?.password}
              </div>
            </div>
            <div className="mt-6 relative">
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
                    form.password,
                    form.passwordStrength.score
                  )
                )}
              >
                <span className="self-center justify-center flex capitalize tracking-wider">
                  {form.password.length > 0
                    ? form.passwordStrength.crackTime
                    : 'No Password'}
                </span>
              </div>
              {/* <div className="mt-1 text-xs text-neutral-500 text-center">
                  Note: Your password should be 14 characters or more.
                  </div> */}
            </div>
            {type === 'CLAIMABLE' && (
              <div className="mt-6 relative">
                <Input
                  id="recoveryEmail"
                  name="recoveryEmail"
                  label="Invitation Email"
                  icon="email"
                  value={form.recoveryEmail}
                  error={errors.recoveryEmail}
                  onChange={onEmailChange}
                  activityPosition="right"
                  isValid={
                    errors.recoveryEmail === '' ||
                    errors.recoveryEmail === undefined
                  }
                  showLoader={validationLoader}
                />
              </div>
            )}
            <div className="text-xs text-red-500 absolute -bottom-9 text-center w-full">
              {error.length > 0 && error}
            </div>
          </form>
          <div className="flex justify-between py-3 bg-gray-50 text-right px-6 border-t border-gray-300 mt-12">
            <div className="flex flex-row items-center text-gray-400 hover:text-gray-700">
              <ChevronLeftIcon
                className="flex-shrink-0 h-4 w-4 "
                aria-hidden="true"
              />
              <button
                type="button"
                className="outline-none text-sm"
                onClick={() => setStep('intro')}
              >
                Select Type
              </button>
            </div>

            <div className="flex flex-row space-x-2">
              <Button
                type="button"
                variant="outline"
                className="pt-2 pb-2"
                onClick={() => close(false, '', false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="pt-2 pb-2 whitespace-nowrap"
                onClick={handleSubmit}
                loading={loading}
                loadingText="Registering Mailbox..."
                disabled={!readyToSubmit}
              >
                {type === 'SUB' ? 'Add Mailbox' : 'Send Invitation'}
              </Button>
            </div>
          </div>
        </>
      )}
    </Dialog.Panel>
  );
});

MailboxRegistration.displayName = 'MailboxRegistration';

export default MailboxRegistration;
