// /* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/no-children-prop */
import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import {
  CheckIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/solid';

interface CreatorProps {
  dictArray: { label: string; value: string | number }[];
  cssProp: string;
  cssValueFn?: (value: any) => string;
}

interface Props {
  selected: { label: string; value: string | number };
  setSelected: (value: any) => void;
  className?: string;
}

const createListBoxMenuButton = ({
  dictArray,
  cssProp,
  cssValueFn = value => value
}: CreatorProps) => {
  const ListBoxButton = ({ className = '', selected, setSelected }: Props) => {
    return (
      <div className={`${className}`}>
        <Listbox value={selected} onChange={setSelected}>
          {({ open }) => (
            <div className="relative">
              <Listbox.Button className="relative w-full py-1 pl-3 pr-7 border-r text-left bg-white cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
                <span className="block truncate">{selected.label}</span>
                <span className="absolute inset-y-0 right-0 pr-1 flex items-center pointer-events-none">
                  {!open && (
                    <ChevronUpIcon
                      className="w-5 h-5 text-gray-400"
                      aria-hidden="true"
                    />
                  )}
                  {open && (
                    <ChevronDownIcon
                      className="w-5 h-5 text-gray-400"
                      aria-hidden="true"
                    />
                  )}
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="z-10 absolute origin-bottom transform -translate-y-72 w-max py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-10 focus:outline-none sm:text-sm">
                  {dictArray.map((obj, objIdx) => (
                    <Listbox.Option
                      key={objIdx}
                      className={({ active }) =>
                        `${
                          active ? 'text-blue-500 bg-blue-100' : 'text-gray-700'
                        }
                        text-left cursor-pointer select-none relative py-2 pl-10 pr-6`}
                      value={obj}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`${
                              selected ? 'font-bold' : 'font-normal'
                            } block truncate`}
                            style={{ [cssProp]: `${cssValueFn(obj.value)}` }}
                          >
                            {obj.label}
                          </span>
                          {selected ? (
                            <span
                              className={`${
                                active ? 'text-blue-500' : 'text-blue-500'
                              }
                                    absolute inset-y-0 left-0 flex items-center pl-3`}
                            >
                              <CheckIcon
                                className="w-5 h-5"
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
          )}
        </Listbox>
      </div>
    );
  };

  return ListBoxButton;
};

export default createListBoxMenuButton;
