import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// EXTERNAL LIBRARIES
import { Dialog, Tab } from '@headlessui/react';
import { GlobeIcon, LightningBoltIcon } from '@heroicons/react/outline';
import { InformationCircleIcon } from '@heroicons/react/solid';
import clsx from 'clsx';

// INTERNAL COMPONENT
import { domain } from 'process';
import { fromBuffer } from 'file-type';
import { Button } from '../../../../../global_components/button';
import {
  Input,
  ReadOnlyWithCopy
} from '../../../../../global_components/input-groups';
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

type Props = {
  domain?: string;
  close: (isSuccess: boolean, message: string, show?: boolean) => void;
};

const tabs = ['Add Domain', 'Ownership Verification', 'DNS Verification'];

const DomainRegistration = forwardRef((props: Props, ref) => {
  const { close, domain = null } = props;
  const dispatch = useDispatch();
  const [loading, setLoader] = useState(false);
  const [validationLoader, setValidationLoader] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const {
    handleChange,
    manualChange,
    handleSubmit,
    bulkChange,
    setErrors,
    data: form,
    errors
  } = useForm({
    initialValues: {
      domain: '',
      vcode: {
        verified: false
      },
      dns: {
        mx: {
          verified: false
        },
        spf: {
          verified: false
        },
        dkim: {
          verified: false
        },
        dmarc: {
          verified: false
        }
      },
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
            if (res === true) {
              return true;
            }

            if (res.status === 409) {
              return false;
            }
          },
          message: 'Domain already in use'
        }
      }
    },
    onSubmit: async data => {
      setLoader(true);
      const res = await dispatch(addCustomDomain(data.domain));
      console.log(res);
      setLoader(false);
      if (res?.dns?.vcode) {
        bulkChange({
          vcode: res?.dns?.vcode,
          domainAdded: true
        });
      } else {
        setErrors({
          domain: 'Something went wrong!'
        });
      }
    }
  });

  const handleNext = () => {
    setSelectedIndex((selectedIndex + 1) % 3);
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

  const verifyOwnership = async () => {
    setLoader(true);
    const res = await Domain.verifyOwnership(form.domain);
    if (res) {
      manualChange('vcode', {
        ...form.vcode,
        verified: true
      });
      try {
        const dns = await Domain.verifyDNS(form.domain);
        console.log(dns);
      } catch (error) {
        console.log(error);
      }
    } else {
      setErrors({
        vcode: 'Ownership Not verified. It may take some time.'
      });
    }
    setLoader(false);
  };

  const verifyDNS = async () => {
    setLoader(true);
    const dns = await Domain.verifyDNS(form.domain);
    manualChange('dns', dns);
    setLoader(false);
  };

  useEffect(() => {
    if (domain && domain.length > 0) {
      const getData = async () => {
        console.log(domain);
        const res = await Domain.getByName(domain);
        console.log('GET DATA', domain);
        bulkChange({
          domain,
          vcode: res.dns?.vcode,
          dns: {
            mx: {
              ...form.dns.mx,
              ...res.dns?.mx
            },
            spf: {
              ...form.dns.spf,
              ...res.dns?.spf
            },
            dkim: {
              ...form.dns.dkim,
              ...res.dns?.dkim
            },
            dmarc: {
              ...form.dns.dmarc,
              ...res.dns?.dmarc
            }
          },
          domainAdded: true
        });
      };
      getData();
    }
  }, [domain]);

  return (
    <Dialog.Panel
      ref={ref}
      className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all"
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
            {tabs.map((tab, idx) => (
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
                disabled={
                  idx !== 0 &&
                  (!form.domainAdded || (idx === 2 && !form?.vcode?.verified))
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
                  {!form.domainAdded && (
                    <div className="self-end">
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        variant="secondary"
                        className="pt-2 pb-2"
                        loading={loading}
                        disabled={form.domain.length === 0 || form.domainAdded}
                      >
                        Add Domain
                      </Button>
                    </div>
                  )}
                </div>
                {form.domainAdded && (
                  <div>
                    <p className="text-sm pl-1 pb-2">
                      The statuses below indicate whether or not your domain is
                      ready for use. To fully configure your domain click
{' '}
                      <b>Next</b>
{' '}
and follow the rest of the setup.
</p>
                    <div className="grid grid-cols-5 pl-1 pt-2">
                      <VerificationStatus
                        status={form.vcode.verified ? 'verified' : 'unverified'}
                        label="Ownership"
                        className="text-sm"
                      />
                      <VerificationStatus
                        status={
                          form.dns?.mx?.verified ? 'verified' : 'unverified'
                        }
                        label="MX"
                        className="text-sm"
                      />
                      <VerificationStatus
                        status={
                          form.dns?.spf?.verified ? 'verified' : 'unverified'
                        }
                        label="SPF"
                        className="text-sm"
                      />
                      <VerificationStatus
                        status={
                          form.dns?.dkim?.verified ? 'verified' : 'unverified'
                        }
                        label="DKIM"
                        className="text-sm"
                      />
                      <VerificationStatus
                        status={
                          form.dns?.dmarc?.verified ? 'verified' : 'unverified'
                        }
                        label="DMARC"
                        className="text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Tab.Panel>
            <Tab.Panel className="outline-none">
              <>
                <div className="my-1 border-l-4 border-sky-400 bg-sky-50 p-4">
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
<b>up to a day</b> for changes to DNS
                        records to take effect.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="py-2">
                  Log into your domain provider and add the following record to
                  your DNS settings.
                </p>
                <div className="flex flex-row space-x-2  mb-2">
                  <VerificationStatus
                    status={form.vcode.verified ? 'verified' : 'unverified'}
                    label="Status"
                    className="text-sm"
                  />
                  <ReadOnlyWithCopy
                    label="Type"
                    value={form.vcode?.type}
                    valueClassName="h-full"
                    className="h-auto"
                  />
                  <ReadOnlyWithCopy
                    label="Name"
                    value={form.vcode?.name}
                    valueClassName="h-full"
                    className="h-auto"
                  />
                  <ReadOnlyWithCopy label="Value" value={form.vcode?.value} />
                  <Button
                    className="pt-1 pb-1 whitespace-nowrap mt-7"
                    variant="outline"
                    loading={loading}
                    onClick={verifyOwnership}
                  >
                    Verify
                  </Button>
                </div>

                <div className="relative">
                  <p className="pt-4">
                    Once you have entered the DNS record in your domain
                    provider, you can verify your ownership.
                  </p>
                  <div className="absolute -bottom-6 flex items-center justify-start text-xs">
                    <div className="text-red-600">{errors?.vcode}</div>
                  </div>
                </div>
              </>
            </Tab.Panel>
            <Tab.Panel className="outline-none">
              <p>
                Once you have verified your ownership, you must enter 4 more DNS
                Records in your domain provider's portal.
              </p>
              {form.dns.length === 0 && (
                <div className="text-red-500 w-full text-center mt-4">
                  Ownership not yet verified!
                </div>
              )}
              <div className="grid grid-cols-8 gap-2 mt-4">
                {Object.keys(form.dns)
                  .map(record => form.dns[record])
                  .map((vr, idx) => (
                    <>
                      <div className="col-span-1">
                        <VerificationStatus
                          status={vr.verified ? 'verified' : 'unverified'}
                          label={idx === 0 ? 'Status' : null}
                          className="text-sm h-full"
                        />
                      </div>
                      <div className="col-span-1">
                        <ReadOnlyWithCopy
                          label={idx === 0 ? 'Type' : null}
                          value={vr.type}
                          className="max-w-none"
                          valueClassName="h-full"
                        />
                      </div>
                      <div className="col-span-2">
                        <ReadOnlyWithCopy
                          label={idx === 0 ? 'Name' : null}
                          value={vr.name}
                          className="max-w-none"
                          valueClassName="h-full"
                        />
                      </div>
                      <div className="col-span-3">
                        <ReadOnlyWithCopy
                          label={idx === 0 ? 'Value' : null}
                          className="max-w-none"
                          value={vr.value}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          className={clsx(
                            idx === 0 ? 'mt-7' : 'mt-2',
                            'pt-2 pb-2 whitespace-nowrap'
                          )}
                          variant="outline"
                          loading={loading}
                          onClick={verifyDNS}
                        >
                          Verify
                        </Button>
                      </div>
                    </>
                  ))}
              </div>
            </Tab.Panel>
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
          {selectedIndex === 2 && (
            <Button
              type="button"
              variant="primary"
              className="pt-2 pb-2 whitespace-nowrap"
              onClick={() => close(false, '', false)}
            >
              Done
            </Button>
          )}
          {selectedIndex !== 2 && (
            <Button
              type="button"
              variant="primary"
              className="pt-2 pb-2 whitespace-nowrap"
              disabled={
                !form.domainAdded ||
                (selectedIndex === 1 && !form.vcode.verified)
              }
              onClick={() => handleNext()}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </Dialog.Panel>
  );
});

DomainRegistration.displayName = 'DomainRegistration';

export default DomainRegistration;
