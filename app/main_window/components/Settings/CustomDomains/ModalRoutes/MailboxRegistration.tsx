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

// INTERNAL LIBRAIRIES
import useForm from '../../../../../utils/hooks/useForm';
import { Input } from '../../../../../global_components/input-groups';

// INTERNAL COMPONENT
import { Button } from '../../../../../global_components/button';

// SELECTORS

// HELPER
import generateRandomString from '../../../../../utils/helpers/generators';

import { validateString } from '../../../../../utils/helpers/regex';

type Props = {
  close: (isSuccess: boolean, message: string, show?: boolean) => void;
};

const MailboxRegistration = forwardRef((props: Props, ref) => {
  const { close } = props;
  const dispatch = useDispatch();
  const domains = useSelector(state => state.domains.allIds);
  const [searchDomains, setSearchDomains] = useState('');
  const [mailbox, setMailbox] = useState('');
  const [loading, setLoader] = useState(false);
  const [error, setError] = useState({
    showError: false,
    msg: ''
  });

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
    handleSubmit,
    data: form,
    errors
  } = useForm({
    initialValues: {
      domain: domains[0],
      address: '',
      displayName: '',
      recoveryEmail: ''
    },
    validations: {
      address: {
        pattern: {
          value: /^\w+([\.-]?\w+)*$/g, // empty ^$ or string
          message: 'No special characters allowed except for . allowed.'
        },
        displayName: {
          pattern: {
            value: /^$|^([A-Za-zÀ-ÖØ-öø-ÿ0-9\.\-\/]+\s)*[A-Za-zÀ-ÖØ-öø-ÿ0-9\.\-\/]+$/, // empty ^$ or string
            message: 'No special characters allowed except for . - / allowed.'
          }
        }
      }
    },
    onSubmit: async data => {}
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

  const generateRandomAlias = () => {
    const cb = (rstr: string) => {
      manualChange('address', rstr);
    };
    setError({
      showError: false,
      msg: ''
    });
    generateRandomString('random', randomFormat.value, cb);
  };

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
        Add New Mailbox
      </Dialog.Title>
      <div className="px-6">
        <div className="text-sm">
          <p className="text-sm text-center font-bold bg-coolGray-100 shadow-sm border border-coolGray-200 py-2 my-3 rounded max-w-md mx-auto">
            <span className="text-purple-600">{form.address}</span>@
            <span>{form.domain}</span>
          </p>
        </div>
        <div className="flex flex-col pl-7 my-4">
          <span className="text-sm font-normal">
            This will create a brand new mailbox. You can switch between
            mailboxes by clicking on your profile, in the top right corner of
            the app.
          </span>
          {/* <span >
            Optionally, you can add forwarding addresses below to have email
            sent to this alias forwarded to additional email addresses
          </span> */}
        </div>
      </div>
      <form className="max-w-md m-auto">
        <Combobox
          value={form.domain}
          onChange={val => manualChange('domain', val)}
        >
          <Combobox.Label className="block text-sm font-medium text-gray-700">
            Domain
          </Combobox.Label>
          <div className="relative mt-1">
            <div className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-2 pr-10 text-left transition duration-150 ease-in-out focus-within:border-purple-500 focus-within:outline-none focus-within:ring-1 focus-within:ring-purple-500 sm:text-sm sm:leading-5">
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
                        }`
                      }
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
        <div className="mt-6 relative">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Address
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <div className="relative flex items-stretch flex-grow focus-within:z-10">
              <input
                type="email"
                name="email"
                id="email"
                value={form.address}
                onChange={handleChange('address', true)}
                className="form-input focus:ring-purple-500 focus:border-purple-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                placeholder="Type choice here..."
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
        </div>
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
              <div className="flex items-center">
                <input
                  id="word"
                  name="random-format"
                  type="radio"
                  defaultChecked
                  className="form-radio focus:ring-sky-500 h-4 w-4 text-sky-500 border-gray-300"
                  onChange={() => setRandomFormat(format[2])}
                />
                <label
                  htmlFor="word"
                  className="ml-2 block text-xs text-gray-700"
                >
                  UID
                </label>
              </div>
            </div>
          </fieldset>
        </div>
        <div className="text-xs text-red-500 absolute -bottom-5 pl-2">
          {errors?.address?.length > 0 && errors?.address}
        </div>
        <div className="mt-6 relative">
          <Input
            label="Display Name"
            onChange={handleChange('displayName', true)}
            value={form.displayName}
            placeholder={`${form.address}@${form.domain}`}
          />
        </div>
        <div className="text-xs text-red-500 absolute -bottom-5 pl-2">
          {errors?.displayName?.length > 0 && errors?.displayName}
        </div>
      </form>
      <div className="flex justify-end py-3 bg-gray-50 text-right px-6 border-t border-gray-300 mt-14">
        <div className="flex flex-row space-x-2">
          <Button type="button" variant="outline" className="pt-2 pb-2">
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="pt-2 pb-2 whitespace-nowrap"
          >
            Add Mailbox
          </Button>
        </div>
      </div>
    </Dialog.Panel>
  );
});

MailboxRegistration.displayName = 'MailboxRegistration';

export default MailboxRegistration;
