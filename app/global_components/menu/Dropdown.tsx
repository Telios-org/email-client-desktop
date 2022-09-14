import React, { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import { UsersIcon } from '@heroicons/react/outline';

// EXTERNAL LIBRAIRIES
import clsx from 'clsx';

type Props = {
  label: string;
  selected: { id: string | number; label: string } | null;
  onChange: (value: { id: string | number; label: string }) => void;
  data: { id: string | number; label: string }[];
  className: string;
  icon: 'none' | 'people';
};

const Dropdown = (props: Props) => {
  const {
    selected,
    onChange,
    data,
    label = '',
    className,
    icon = 'none'
  } = props;

  return (
    <div className={className}>
      <Listbox value={selected} onChange={onChange}>
        {({ open }) => (
          <>
            <Listbox.Label className="block text-sm font-medium text-gray-700">
              {label}
            </Listbox.Label>
            <div className="mt-1 relative">
              <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 sm:text-sm flex row">
                {icon === 'people' && (
                  <UsersIcon className="h-5 w-5 text-gray-400 mr-2" />
                )}
                <span className="block truncate text-gray-500">
                  {selected?.label}
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
                  {data.map(item => (
                    <Listbox.Option
                      key={item.id}
                      className={({ active }) =>
                        clsx(
                          active
                            ? 'bg-blue-200 text-gray-900'
                            : 'text-gray-900',
                          'cursor-default select-none relative py-2 pl-8 pr-4 text-sm'
                        )
                      }
                      style={{ cursor: 'pointer' }}
                      value={item}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={clsx(
                              selected ? 'font-semibold' : 'font-normal',
                              'block truncate'
                            )}
                          >
                            {item.label}
                          </span>

                          {selected ? (
                            <span
                              className={clsx(
                                active ? '' : 'text-purple-600',
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
    </div>
  );
};

export default Dropdown;
