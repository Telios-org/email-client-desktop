import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// EXTERNAL LIBRARIES
import { Dialog, Tab } from '@headlessui/react';
import { GlobeIcon, LightningBoltIcon } from '@heroicons/react/outline';
import { InformationCircleIcon } from '@heroicons/react/solid';
import { Paper } from 'react-iconly';
import clsx from 'clsx';

// INTERNAL COMPONENT
import { domain } from 'process';
import { Button } from '../../../../../global_components/button';
import { Input } from '../../../../../global_components/input-groups';
import { VerificationStatus } from '../../../../../global_components/status';

// SERVICE
import Domain from '../../../../../services/domain.service';

// SELECTORS

// HELPER
import useForm from '../../../../../utils/hooks/useForm';

// REDUX ACTION
import { addCustomDomain } from '../../../../actions/domains/domains';

import i18n from '../../../../../i18n/i18n';

import { validateString } from '../../../../../utils/helpers/regex';

const { clipboard } = require('electron');

type Props = {
  close: (isSuccess: boolean, message: string, show?: boolean) => void;
};

const tabs = ['Add Domain', 'Ownership Verification', 'DNS Verification'];

const DomainRegistration = forwardRef((props: Props, ref) => {
  const { close } = props;
  const dispatch = useDispatch();
  const [loading, setLoader] = useState(false);
  const [copyText, setCopyText] = useState('Copy');
  const [validationLoader, setValidationLoader] = useState(false);
  const [cnameLoader, setcnameLoader] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0)

  const {
    handleChange,
    manualChange,
    handleSubmit,
    data: form,
    errors
  } = useForm({
    initialValues: {
      domain: '',
      status: 'unverified',
      ownershipRecord: '',
      domainAdded: false
    },
    validationDebounce: 500,
    validations: {
      domain: {
        required: {
          value: true,
          message: 'Required field.'
        },
        custom: {
          isValid: async (value, data) => {
            const res = await Domain.isAvailable(value);
            console.log(res);
            return res;
          },
          message: 'Domain already in use'
        }
      }
    },
    onSubmit: async data => {
        console.log(data.domain)
        dispatch(addCustomDomain(data.domain));
    }
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

  const onDomainChange = e => {
    setValidationLoader(true);
    handleChange(
      'domain',
      true,
      value => value.toLowerCase(),
      () => {
        setValidationLoader(false);
      }
    )(e);
  };

  const fetchCNAME = () => {
    setcnameLoader(true);
    // FUNCTION TO FETCH CNAME HERE
    manualChange('cnameRecord', 'VALUE HERE');
    setcnameLoader(false);
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
        Custom Domain
      </Dialog.Title>
      <div className="px-12">
        <p className="text-sm pl-1 pb-2">
          To use your own domain on Telios you need to perform a few
          verification steps and setup your DNS records on your domain
          provider's web portal.
        </p>
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="border-b border-gray-200 flex space-x-8 text-sm">
            {tabs.map(tab => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  clsx(
                    selected
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm outline-none'
                  )
                }
              >
                {tab}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="py-4 px-2 text-sm">
            <Tab.Panel className="outline-none">
              <div className="flex flex-col space-y-6">
                <div className="flex flex-row w-full space-x-2 flex-1">
                  <Input
                    label="Domain Name"
                    onChange={onDomainChange}
                    id="domain"
                    name="domain"
                    activityPosition="right"
                    value={form.domain}
                    error={errors?.domain}
                    disabled={form.domainAdded}
                    isValid={
                      errors?.domain === '' || errors?.domain === undefined
                    }
                    showLoader={validationLoader}
                  />
                  <div className="self-end">
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      variant="secondary"
                      className="pt-2 pb-2"
                      loading={cnameLoader}
                      disabled={
                        errors.domain ||
                        form.domain.length === 0 ||
                        form.domainAdded
                      }
                    >
                      ADD DOMAIN
                    </Button>
                  </div>
                </div>
                <p className="text-sm pl-1 pb-2">
                  The statuses below indicate whether or not your domain is
                  ready for use. To fully configure your domain click next and
                  follow the rest of the setup.
                </p>
                <div className="grid grid-cols-5 pl-1">
                  <VerificationStatus status={form.status} label="Ownership" />
                  <VerificationStatus status={form.status} label="DKIM" />
                  <VerificationStatus status={form.status} label="SPF" />
                  <VerificationStatus status={form.status} label="MX" />
                  <VerificationStatus status={form.status} label="DMARC" />
                </div>
              </div>
            </Tab.Panel>
            <Tab.Panel className="outline-none">Content 2</Tab.Panel>
            <Tab.Panel className="outline-none">Content 3</Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
      <div className="flex justify-between py-3 bg-gray-50 text-right px-6 border-t border-gray-300 mt-7">
        <div className="flex flex-row">
          {/* <Button
            type="button"
            variant="dangerous"
            className="pt-2 pb-2"
            disabled={!form.domainAdded}
            onClick={() => close(false, '', false)}
          >
            Delete Domain
          </Button> */}
        </div>

        <div className="flex flex-row space-x-2">
          <Button
            type="button"
            variant="outline"
            className="pt-2 pb-2"
            onClick={() => close(false, '', false)}
          >
            Close
          </Button>
          <Button
            type="button"
            variant="primary"
            className="pt-2 pb-2 whitespace-nowrap"
          >
            Next
          </Button>
        </div>
      </div>
    </Dialog.Panel>
  );
});

DomainRegistration.displayName = 'DomainRegistration';

export default DomainRegistration;
