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
  ChevronLeftIcon
} from '@heroicons/react/outline';
import {
  CheckIcon,
  SelectorIcon,
  CheckCircleIcon
} from '@heroicons/react/solid';

import clsx from 'clsx';
// INTERNAL LIBRAIRIES
import useForm from '../../../../../utils/hooks/useForm';
import { validateString } from '../../../../../utils/helpers/regex';

// SELECTORS
import { selectAllNamespaces } from '../../../../selectors/mail';

// REDUX ACTION
import { registerAlias } from '../../../../actions/mailbox/aliases';

// HELPER FUNCTIONS
import { generateRandomString } from '../../../../../utils/helpers/generators';

// INTERNAL COMPONENTS
import { Button } from '../../../../../global_components/button';

type Props = {
  close: (isSuccess: boolean, message: string, show?: boolean) => void;
  domain: string;
};

const AliasRegistration = forwardRef((props: Props, ref) => {
  const { close, domain } = props;
  const dispatch = useDispatch();
  const namespaces = useSelector(selectAllNamespaces);
  const fwdAddresses = useSelector(state => state.mail.aliases.fwdAddresses);
  const [queryNs, setQueryNs] = useState('');
  const [queryFwd, setQueryFwd] = useState('');
  const [loading, setLoader] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [step, setStep] = useState('intro');
  const [type, setType] = useState('random');

  const format = [
    { label: '3 Word String', value: 'words' },
    { label: 'Alphanumeric', value: 'letters' },
    { label: 'UID', value: 'uid' }
  ];
  const [randomFormat, setRandomFormat] = useState(format[0]);

  const {
    handleChange,
    manualChange,
    bulkChange,
    resetForm,
    isDirty,
    handleSubmit,
    data: form,
    errors
  } = useForm({
    initialValues: {
      namespace: '',
      alias: '',
      description: '',
      fwdAddresses: []
    },
    validations: {
      alias: {
        pattern: {
          value: /^\w+([\.-]?\w+)*$/g, // empty ^$ or string
          message: 'No special characters allowed except for . allowed.'
        }
      }
    },
    onSubmit: async data => {
      const {
        namespace,
        alias,
        description = '',
        fwdAddresses: fwd = []
      } = data;

      const disabled = false;

      setSubmitError('');
      setLoader(true);

      const res = await dispatch(
        registerAlias(
          type === 'namespace' ? namespace.toLowerCase() : null, // if it's a non namespace alias we keep this null
          domain,
          alias.toLowerCase(),
          description,
          fwd,
          disabled
        )
      );
      if (res.success) {
        close(true, 'Alias created!');
      } else {
        setSubmitError(res.message);
      }
      setLoader(false);
    }
  });

  const filteredNamespaces =
    queryNs === ''
      ? namespaces.allIds.sort()
      : namespaces.allIds
          .filter(ns =>
            ns
              .toLowerCase()
              .replace(/\s+/g, '')
              .includes(queryNs.toLowerCase().replace(/\s+/g, ''))
          )
          .sort();

  const filteredForwards =
    queryFwd === ''
      ? [...form.fwdAddresses, ...fwdAddresses]
      : [...form.fwdAddresses, ...fwdAddresses]
          .filter(fwd =>
            fwd
              .toLowerCase()
              .replace(/\s+/g, '')
              .includes(queryFwd.toLowerCase().replace(/\s+/g, ''))
          )
          .sort();

  useEffect(() => {
    if (namespaces.allIds.length > 0) {
      manualChange('namespace', namespaces.allIds[0]);
    }
  }, [namespaces]);

  const generateRandomAlias = () => {
    const cb = (rstr: string) => {
      manualChange('alias', rstr);
    };
    generateRandomString(type, randomFormat.value, cb);
  };

  useEffect(() => {
    const fn = async () => {
      if (namespaces.allIds.length > 0) {
        await bulkChange({
          namespace: namespaces.allIds[0],
          alias: ''
        });
      } else {
        manualChange('alias', '');
      }
      setSubmitError('');
    };

    if (type === 'random') {
      generateRandomAlias();
      setSubmitError('');
    } else {
      fn();
    }
  }, [type, step]);

  useEffect(() => {
    generateRandomAlias();
    setSubmitError('');
  }, [randomFormat]);

  return (
    <Dialog.Panel
      ref={ref}
      className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all"
    >
      <Dialog.Title
        as="h3"
        className="text-base font-medium leading-6 text-gray-900 flex flex-row mb-4 pt-6 px-6 items-center"
      >
        <AtSymbolIcon
          className="w-5 h-5 text-sky-500 mr-2"
          aria-hidden="true"
        />
        New Alias - 
{' '}
{step === 'intro' ? 'Type' : 'Registration'}
      </Dialog.Title>
      {step === 'intro' && (
        <>
          <div className="max-w-md m-auto mb-10">
            {/* <legend className="text-sm font-normal">Select a mailing list</legend> */}

            <div className="grid grid-cols-1 gap-y-2">
              <div
                className={clsx(
                  'relative bg-white border rounded-lg shadow-sm p-4 flex cursor-pointer focus:outline-none',
                  type === 'namespace'
                    ? 'border-2 border-purple-500'
                    : 'hover:border-gray-300',
                  namespaces.allIds.length === 0
                    ? 'border-gray-200 hover:border-gray-200'
                    : ''
                )}
                aria-hidden="true"
                onClick={() => setType('namespace')}
                style={{
                  cursor:
                    namespaces.allIds.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <span className="flex-1 flex">
                  <span className="flex flex-col">
                    <span
                      id="project-type-0-label"
                      className={clsx(
                        'block text-sm font-medium ',
                        namespaces.allIds.length === 0
                          ? 'text-gray-300'
                          : 'text-gray-900'
                      )}
                    >
                      Namespace
                    </span>
                    <span
                      id="project-type-0-description-0"
                      className={clsx(
                        'mt-1 text-sm ',
                        namespaces.allIds.length === 0
                          ? 'text-gray-300'
                          : 'text-gray-500'
                      )}
                    >
                      Custom aliases prefixed with your namespace, it follows
                      the
{' '}
                      <span className="font-medium">
                        {`namespace+alias@${domain}`}
                      </span>
{' '}
                      structure.
                    </span>
                  </span>
                </span>
                {type === 'namespace' && (
                  <CheckCircleIcon className="h-5 w-5 text-purple-600 absolute right-3 top-3" />
                )}
              </div>
              <div
                className={clsx(
                  'relative bg-white border rounded-lg shadow-sm p-4 flex cursor-pointer focus:outline-none',
                  type === 'random'
                    ? 'border-2 border-purple-500'
                    : 'hover:border-gray-300'
                )}
                aria-hidden="true"
                onClick={() => setType('random')}
                style={{ cursor: 'pointer' }}
              >
                <span className="flex-1 flex">
                  <span className="flex flex-col">
                    <span
                      id="project-type-1-label"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Random
                    </span>
                    <span
                      id="project-type-1-description-0"
                      className="mt-1 flex items-center text-sm text-gray-500"
                    >
                      Randomly generated UID, 3 words, alphanumeric string.
                    </span>
                  </span>
                </span>
                {type === 'random' && (
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
      {step === 'setup' && (
        <>
          <div className="px-6">
            <div className="text-sm">
              <p className="text-sm text-center font-bold bg-coolGray-100 shadow-sm border border-coolGray-200 py-2 my-3 rounded max-w-md mx-auto">
                {type === 'namespace' &&
                  `${
                    form.namespace.length === 0 ? 'namespace' : form.namespace
                  }+`}
                <span className="text-purple-600">
                  {form.alias.length === 0 ? 'alias' : form.alias}
                </span>
                {`@${domain}`}
              </p>
            </div>
            <div className="flex flex-col pl-7 my-4">
              <span className="text-sm font-normal">
                All emails sent to this alias will appear in Alias section of
                your inbox.
              </span>
              {/* <span >
            Optionally, you can add forwarding addresses below to have email
            sent to this alias forwarded to additional email addresses
          </span> */}
            </div>
          </div>
          <form className="max-w-md m-auto">
            {type === 'namespace' && (
              <Combobox
                value={form.namespace}
                onChange={val => manualChange('namespace', val)}
              >
                <Combobox.Label className="block text-sm font-medium text-gray-700">
                  Namespace
                </Combobox.Label>
                <div className="relative mt-1">
                  <div className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-2 pr-10 text-left transition duration-150 ease-in-out focus-within:border-purple-500 focus-within:outline-none focus-within:ring-1 focus-within:ring-purple-500 sm:text-sm sm:leading-5">
                    <Combobox.Input
                      className="form-input border-none p-0 focus:ring-0 text-sm pl-1"
                      displayValue={ns => ns}
                      onChange={event => setQueryNs(event.target.value)}
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
                    afterLeave={() => setQueryNs('')}
                  >
                    <Combobox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {namespaces.allIds.length === 0 && queryNs !== '' ? (
                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                          Nothing found.
                        </div>
                      ) : (
                        filteredNamespaces.map(ns => (
                          <Combobox.Option
                            key={ns}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                active
                                  ? 'bg-sky-500 text-white'
                                  : 'text-gray-900'
                              }`}
                            style={{ cursor: 'pointer' }}
                            value={ns}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={`block truncate ${
                                    selected ? 'font-medium' : 'font-normal'
                                  }`}
                                >
                                  {ns}

                                  <span
                                    className={`${
                                      active ? 'text-sky-300' : 'text-gray-400'
                                    }`}
                                  >
                                    +alias@telios.io
                                  </span>
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
            )}
            {type === 'random' && (
              <Listbox value={randomFormat} onChange={setRandomFormat}>
                {({ open }) => (
                  <>
                    <Listbox.Label className="block text-sm font-medium text-gray-700">
                      Format
                    </Listbox.Label>
                    <div className="mt-1 relative">
                      <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-2 pr-10 text-left transition duration-150 ease-in-out focus-within:border-purple-500 focus-within:outline-none focus-within:ring-1 focus-within:ring-purple-500 sm:text-sm sm:leading-5">
                        <span className="block truncate pl-1">
                          {randomFormat.label}
                        </span>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <SelectorIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>

                      <Transition
                        show={open}
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                          {format.map(fmt => (
                            <Listbox.Option
                              key={fmt.value}
                              className={({ active }) =>
                                clsx(
                                  active
                                    ? 'bg-sky-500 text-white'
                                    : 'text-gray-900',
                                  'cursor-default select-none relative py-2 pl-8 pr-4'
                                )
                              }
                              style={{ cursor: 'pointer' }}
                              value={fmt}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span
                                    className={clsx(
                                      fmt.value === randomFormat.value
                                        ? 'font-semibold'
                                        : 'font-normal',
                                      'block truncate'
                                    )}
                                  >
                                    {fmt.label}
                                  </span>

                                  {fmt.value === randomFormat.value ? (
                                    <span
                                      className={clsx(
                                        active ? 'text-white' : 'text-sky-600',
                                        'absolute inset-y-0 left-0 flex items-center pl-1.5'
                                      )}
                                    >
                                      <CheckIcon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </>
                )}
              </Listbox>
            )}
            <div className="mt-6 relative">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Alias
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <div className="relative flex items-stretch flex-grow focus-within:z-10">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={form.alias}
                    onChange={handleChange('alias')}
                    className="form-input focus:ring-purple-500 focus:border-purple-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                    placeholder="Type choice here..."
                    disabled={type === 'random'}
                  />
                </div>
                <button
                  type="button"
                  onClick={generateRandomAlias}
                  className="-ml-px relative group inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                >
                  <LightningBoltIcon
                    className="h-5 w-5 text-gray-400 group-hover:text-gray-600"
                    aria-hidden="true"
                  />
                </button>
              </div>
              {type === 'namespace' && (
                <div className="text-xs flex flex-row mt-2 justify-end">
                  <label className="font-medium text-gray-900 pr-4">
                    Random Format:
                  </label>
                  <fieldset className="">
                    <legend className="sr-only">Random Format</legend>
                    <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-4">
                      <div className="flex items-center">
                        <input
                          id="word"
                          name="random-format"
                          type="radio"
                          defaultChecked
                          className="form-radio focus:ring-sky-500 h-4 w-4 text-sky-500 border-gray-300"
                          onChange={() => setRandomFormat(format[0])}
                        />
                        <label
                          htmlFor="word"
                          className="ml-2 block text-xs text-gray-700"
                        >
                          Word Association
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="letters"
                          name="random-format"
                          type="radio"
                          className="form-radio focus:ring-sky-500 h-4 w-4 text-sky-500 border-gray-300"
                          onChange={() => setRandomFormat(format[1])}
                        />
                        <label
                          htmlFor="letters"
                          className="ml-2 block text-xs text-gray-700"
                        >
                          Shuffled Letters
                        </label>
                      </div>
                    </div>
                  </fieldset>
                </div>
              )}
              <div className="text-xs text-red-500 absolute -bottom-5 pl-2">
                {errors?.alias?.length > 0 && errors?.alias}
              </div>
            </div>
            <div className="mt-6">
              <Combobox
                value={form.fwdAddresses}
                onChange={val => manualChange('fwdAddresses', val)}
                name="forward"
                multiple
              >
                <Combobox.Label className="block text-sm font-medium text-gray-700 mb-1">
                  Forwarding Address(es)
                </Combobox.Label>

                <div className="relative">
                  <span className="inline-block w-full rounded-md shadow-sm">
                    <div className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-2 pr-10 text-left transition duration-150 ease-in-out focus-within:border-purple-500 focus-within:outline-none focus-within:ring-1 focus-within:ring-purple-500 sm:text-sm sm:leading-5">
                      <span className="block flex flex-wrap space-x-1">
                        {form.fwdAddresses.map(add => (
                          <span
                            key={add}
                            className="flex items-center rounded bg-blue-50 px-2 py-0.5 my-1"
                          >
                            <span>{add}</span>
                            <svg
                              className="h-4 w-4 cursor-pointer"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                              onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                manualChange(
                                  'fwdAddresses',
                                  form.fwdAddresses.filter(
                                    (a: string) => a !== add
                                  )
                                );
                              }}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </span>
                        ))}
                        <Combobox.Input
                          onChange={event => setQueryFwd(event.target.value)}
                          className="form-input border-none p-0 focus:ring-0 text-sm"
                          placeholder="Type Email..."
                        />
                      </span>
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Combobox.Button>
                    </div>
                  </span>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQueryFwd('')}
                  >
                    <Combobox.Options
                      style={{ cursor: 'pointer' }}
                      className="absolute z-20 mt-1 max-h-60 w-full bg-white overflow-auto rounded-md py-1 text-base leading-6 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm sm:leading-5"
                    >
                      {filteredForwards.length === 0 &&
                        queryFwd.length === 0 && (
                          <div className="flex justify-center select-none py-2 text-center focus:outline-none text-gray-400">
                            Type forwarding address
                          </div>
                        )}
                      {queryFwd.length > 0 &&
                        !filteredForwards.includes(queryFwd) && (
                          <Combobox.Option
                            value={queryFwd}
                            style={{ cursor: 'pointer' }}
                            className={({ active }) => {
                              return clsx(
                                'relative cursor-default select-none py-2 pl-3 pr-9 focus:outline-none',
                                active
                                  ? 'bg-sky-500 text-white'
                                  : 'text-gray-900'
                              );
                            }}
                          >
                            Add 
{' '}
<b>"{queryFwd}"</b> as forwarding address
                          </Combobox.Option>
                        )}
                      {filteredForwards.map(fwd => (
                        <Combobox.Option
                          key={fwd}
                          value={fwd}
                          style={{ cursor: 'pointer' }}
                          className={({ active }) => {
                            return clsx(
                              'relative cursor-default select-none py-2 pl-3 pr-9 focus:outline-none',
                              active ? 'bg-sky-500 text-white' : 'text-gray-900'
                            );
                          }}
                        >
                          {({ active, selected }) => (
                            <>
                              <span
                                className={clsx(
                                  'block truncate',
                                  selected ? 'font-semibold' : 'font-normal'
                                )}
                              >
                                {fwd}
                              </span>
                              {selected && (
                                <span
                                  className={clsx(
                                    'absolute inset-y-0 right-0 flex items-center pr-4',
                                    active ? 'text-white' : 'text-sky-500'
                                  )}
                                >
                                  <svg
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </span>
                              )}
                            </>
                          )}
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>
                  </Transition>
                </div>
              </Combobox>
            </div>
            <div className="mt-6 relative">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <div className="mt-1">
                <textarea
                  rows={1}
                  name="comment"
                  id="comment"
                  value={form.description}
                  onChange={handleChange('description')}
                  className="form-textarea shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div className="text-xs text-red-500 absolute -bottom-9 text-center w-full">
                {submitError.length > 0 && submitError}
              </div>
            </div>
            {type === 'namespace' && (
              <div className="text-xs text-gray-400 pt-3 mt-6">
                <b>Note:</b>
                The + separator is interchangeable with - or # in case a website
                doesn't accept certain characters
              </div>
            )}
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
              >
                Register
              </Button>
            </div>
          </div>
        </>
      )}
    </Dialog.Panel>
  );
});

AliasRegistration.displayName = 'AliasRegistration';

export default AliasRegistration;
