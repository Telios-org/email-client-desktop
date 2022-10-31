import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// EXTERNAL LIBRARIES
import { Dialog } from '@headlessui/react';
import { AtSymbolIcon, LightningBoltIcon } from '@heroicons/react/outline';
import { generateSlug } from 'random-word-slugs';

// SELECTORS
import { selectActiveMailbox } from '../../../../selectors/mail';

// REDUX ACTION
import { registerNamespace } from '../../../../actions/mailbox/aliases';

import i18n from '../../../../../i18n/i18n';

import { validateString } from '../../../../../utils/helpers/regex';

// INTERNAL COMPONENTS
import { Button } from '../../../../../global_components/button';

type Props = {
  close: (isSuccess: boolean, message: string, show?: boolean) => void;
  domain: string;
};

const NamespaceRegistration = forwardRef((props: Props, ref) => {
  const { close, domain } = props;
  const dispatch = useDispatch();
  const { mailboxId } = useSelector(selectActiveMailbox);
  const [namespace, setNamespace] = useState('');
  const [loading, setLoader] = useState(false);
  const [error, setError] = useState({
    showError: false,
    msg: ''
  });

  // dispatch(registerNamespace(mailboxId, data.namespace.toLowerCase()));
  const handleSubmit = async () => {
    setLoader(true);
    // In case of retry clear out error block.
    setError({
      showError: false,
      msg: ''
    });

    if (validateString(namespace)) {
      const results = await dispatch(
        registerNamespace(mailboxId, namespace.toLowerCase())
      );

      if (!results?.success && results?.status === 'already-registered') {
        setError({
          showError: true,
          msg: 'Namespace is unavailable.'
        });
        setLoader(false);
        return false;
      }

      if (results?.name && results?.message) {
        setError({
          showError: true,
          msg: results?.message
        });
        setLoader(false);
        return false;
      }

      setLoader(false);
      close(true, 'Namespace Registered!');
    } else {
      setError({
        showError: true,
        msg: 'Malformed Namespace, special characters not allowed.'
      });
      setLoader(false);
      return false;
    }
  };

  const handleChange = (val: string) => {
    setError({
      showError: false,
      msg: ''
    });
    setNamespace(val);
  };

  const generateRandomString = () => {
    const slug = generateSlug(2, {
      format: 'kebab',
      partsOfSpeech: ['adjective', 'noun'],
      categories: {
        noun: [
          'animals',
          'place',
          'food',
          'sport',
          'science',
          'technology',
          'thing'
        ],
        adjective: ['color', 'shapes', 'sounds', 'time']
      }
    }).replace('-', '');

    handleChange(slug);
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
        <AtSymbolIcon
          className="w-5 h-5 text-sky-500 mr-2"
          aria-hidden="true"
        />
        New Namespace
      </Dialog.Title>
      <div className="px-6">
        <div className="">
          <p className="text-sm pl-7 pb-2">
            To create aliases you first need to create an alias namespace. This
            namespace will be the basis for all your aliases as shown below.
          </p>
          <p className="text-sm text-center bg-coolGray-100 shadow-sm border border-coolGray-200 py-3 my-3 rounded max-w-sm mx-auto">
            <b className="text-blue-500">
              {namespace.length === 0 ? 'namespace' : namespace}
            </b>
            <b>{`+myalias@${domain}`}</b>
          </p>
          <p className="text-sm inline-block pl-7 pt-2">
            You can choose it yourself or
            <LightningBoltIcon
              className="h-4 w-4 text-gray-400 m-0 mx-1 inline"
              aria-hidden="true"
            />
            randomly generate it. Your namespace is unique to you. If you run
            out, head to your
            <span className="font-semibold">account settings</span>
{' '}
and upgrade
            your plan.
</p>
        </div>
        <div className="bg-white w-full scrollbar-hide mt-4 max-w-sm m-auto relative">
          {/* <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Namespace
            </label> */}
          <div className="mt-1 flex rounded-md">
            <div className="relative flex items-stretch flex-grow focus-within:z-10">
              <input
                type="email"
                name="email"
                id="email"
                className="form-input focus:ring-purple-500 focus:border-purple-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                placeholder="Enter namespace here"
                onChange={event => handleChange(event.currentTarget.value)}
                value={namespace}
              />
            </div>
            <button
              type="button"
              onClick={generateRandomString}
              className="-ml-px relative group inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            >
              <LightningBoltIcon
                className="h-5 w-5 text-gray-400 group-hover:text-gray-600"
                aria-hidden="true"
              />
            </button>
          </div>
          <div className="absolute text-red-500 text-sm mt-2 pl-2">
            {error?.msg}
          </div>
          <div className="text-xs text-gray-400 pt-3 mt-6">
              <b>Note:</b> Namespaces are NOT currently DELETABLE so chose wisely!
            </div>
            <p className="text-xs text-gray-400 pt-3">
            <b>Tip:</b> A namespace allows you to do ON THE FLY alias creation. 
            On any website you can use an email you made up on the spot with that namespace.
            i.e. namespace+sickblog@telios.io that folder will create once it recieves it first email. 
          </p>
          <p className="text-xs text-gray-400">
            <b>i.e.</b> namespace+sickblog@telios.io that folder will create as soon as its receives it first email. 
          </p>
        </div>
        
      </div>

      <div className="flex justify-end py-3 bg-gray-50 text-right px-6 border-t border-gray-300 mt-14">
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
    </Dialog.Panel>
  );
});

NamespaceRegistration.displayName = 'NamespaceRegistration';

export default NamespaceRegistration;
