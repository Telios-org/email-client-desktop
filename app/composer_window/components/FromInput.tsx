import React, { Fragment, useState, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';


// SELECTORS
import { selectActiveMailbox } from '../../main_window/selectors/mail';

// TS TYPE
import { MailboxType, MailType } from '../../main_window/reducers/types';

// SERVICE
import MailService from '../../services/mail.service';

// HELPER
import { arrayToObject } from '../../utils/reducer.util';
import sortingHat from '../../utils/helpers/sort';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

type Props = {
  fromDataSet: { address: string; name: string }[];
  fromAddress: { address: string; name: string } | null;
  onFromChange: (obj: { address: string; name: string }) => void;
};

const FromInput = (props: Props) => {
  const { fromDataSet, fromAddress, onFromChange } = props;

  return (
    <Listbox value={fromAddress} onChange={onFromChange}>
      {({ open }) => (
        <>
          <div className="relative mt-0.5">
            <Listbox.Button className="bg-white relative w-full pl-3 pr-10 py-2 text-left cursor-default focus:outline-none sm:text-xs">
              <span className="block truncate">{fromAddress?.address}</span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <SelectorIcon
                  className="h-4 w-4 text-gray-400"
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
              <Listbox.Options className="absolute z-10 mt-2 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {fromDataSet.map(email => (
                  <Listbox.Option
                    key={email.address}
                    className={({ active }) =>
                      classNames(
                        active ? 'bg-blue-200 text-gray-900' : 'text-gray-900',
                        'cursor-default select-none relative py-2 pl-8 pr-4 text-xs'
                      )
                    }
                    style={{ cursor: 'pointer' }}
                    value={email}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={classNames(
                            selected ? 'font-semibold' : 'font-normal',
                            'block truncate'
                          )}
                        >
                          {email.address}
                        </span>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? '' : 'text-purple-600',
                              'absolute inset-y-0 left-0 flex items-center pl-1.5'
                            )}
                          >
                            <CheckIcon className="h-4 w-4" aria-hidden="true" />
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
  );
};

export default FromInput;
