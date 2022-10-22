import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// EXTERNAL LIBRARIES
import { Dialog } from '@headlessui/react';
import { GlobeIcon, LightningBoltIcon } from '@heroicons/react/outline';
import { InformationCircleIcon } from '@heroicons/react/solid';
import { Paper } from 'react-iconly';
import clsx from 'clsx';

// INTERNAL COMPONENT
import { Button } from '../../../../../global_components/button';
import { Input } from '../../../../../global_components/input-groups';

// SELECTORS

// HELPER
import useForm from '../../../../../utils/hooks/useForm';

// REDUX ACTION
import { registerNamespace } from '../../../../actions/mailbox/aliases';

import i18n from '../../../../../i18n/i18n';

import { validateString } from '../../../../../utils/helpers/regex';

const { clipboard } = require('electron');

type Props = {
  close: (isSuccess: boolean, message: string, show?: boolean) => void;
};

const DomainRegistration = forwardRef((props: Props, ref) => {
  const { close } = props;
  const dispatch = useDispatch();
  const [loading, setLoader] = useState(false);
  const [copyText, setCopyText] = useState('Copy');

  const { handleChange, handleSubmit, data: form, errors } = useForm({
    initialValues: {
      domain: '',
      status: 'unverified',
      cnameRecord: ''
    },
    onSubmit: async data => {}
  });

  const handleCopy = (value: string) => {
    clipboard.writeText(value ?? '');
    setCopyText('Copied!');
  };

  const resetCopy = () => {
    if (copyText === 'Copied!') {
      setCopyText('Copy');
    }
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
        <GlobeIcon className="w-5 h-5 text-sky-500 mr-2" aria-hidden="true" />
        Add Custom Domain
      </Dialog.Title>
      <div className="px-6">
        <div>
          <p className="text-sm pl-7 pb-2">
            Before you can use a custom domain with Telios, you must verify that
            you own your domain. This is to prevent unauthorized use. To verify
            your ownership, add the verification record (CNAME) listed to your
            domain's DNS record.
          </p>
          <div className="ml-7 my-2 border-l-4 border-sky-400 bg-sky-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <InformationCircleIcon
                  className="h-5 w-5 text-sky-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm text-sky-700">
                  It may take 
{' '}
<b>up to a day</b> for changes to DNS records to
                  take effect.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-sm m-auto w-full mt-4 space-y-2">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-slate-700 capitalize pb-1">
              Status
            </div>
            <div className="flex flex-row items-center pl-1">
              <span className="flex h-2 w-2 relative">
                <span
                  className={clsx(
                    form.status === 'pending' && 'bg-yellow-400',
                    form.status === 'verified' && 'bg-green-400',
                    form.status === 'error' && 'bg-red-400',
                    form.status === 'unverified' && 'bg-gray-300',
                    'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75'
                  )}
                />
                <span
                  className={clsx(
                    form.status === 'pending' && 'bg-yellow-500',
                    form.status === 'verified' && 'bg-green-500',
                    form.status === 'error' && 'bg-red-500',
                    form.status === 'unverified' && 'bg-gray-400',
                    'relative inline-flex rounded-full h-2 w-2'
                  )}
                />
              </span>
              <span className="ml-2 text-sm pb-0.5 text-gray-400">{`${form.status}`}</span>
            </div>
          </div>
          <div className="flex flex-row w-full space-x-2 flex-1">
            <Input
              label="Domain"
              onChange={handleChange('domain')}
              id="domain"
              name="domain"
              value={form.domain}
            />
            <div className="self-end">
              <Button
                type="button"
                variant="outline"
                className="pt-2 pb-2 w-[118px]"
              >
                GET CNAME
              </Button>
            </div>
          </div>
          <div className="flex flex-row w-full space-x-2 flex-1">
            <div className="flex flex-col w-full">
              <div className="text-sm font-medium text-slate-700 capitalize">
                CNAME Content
              </div>
              <div className="mt-2 flex flex-row w-full border border-gray-300 bg-gray-100 rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm font-medium h-[38px]">
                <div className="break-words flex-1">{form.cnameRecord}</div>
                {/* COPY BUTTON */}
                <button
                  type="button"
                  onMouseLeave={resetCopy}
                  onClick={() => handleCopy(form.cnameRecord)}
                  className="relative flex flex-col items-center group outline-none"
                >
                  <Paper
                    size="small"
                    set="broken"
                    className="text-gray-400 hover:text-purple-600 mt-0.5 ml-1"
                    style={{ cursor: 'pointer' }}
                  />
                  <div className="absolute top-0 flex-col items-center hidden group-hover:flex -mt-9">
                    <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-700 shadow-lg rounded">
                      {copyText}
                    </span>
                    <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-700" />
                  </div>
                </button>
                {/* END */}
              </div>
            </div>

            <div className="self-end">
              <Button
                type="button"
                variant="outline"
                className="pt-2 pb-2 w-[118px]"
              >
                VERIFY
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end py-3 bg-gray-50 text-right px-6 border-t border-gray-300 mt-14">
        <div className="flex flex-row space-x-2">
          <Button
            type="button"
            variant="outline"
            className="pt-2 pb-2"
            onClick={() => close()}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            className="pt-2 pb-2 whitespace-nowrap"
          >
            Add Domain
          </Button>
        </div>
      </div>
    </Dialog.Panel>
  );
});

DomainRegistration.displayName = 'DomainRegistration';

export default DomainRegistration;
