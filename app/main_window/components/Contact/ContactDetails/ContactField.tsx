import React, { useState, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';

// Helper function
import {
  fromJSDateToString,
  fullDatefromJS
} from '../../../../utils/helpers/date';

type Props = {
  label: string;
  value: string;
  editMode: boolean;
  type: string;
  onEdit?: (e: Event) => void;
};

const countries = require('../countries.json');

const ContactField = (props: Props) => {
  const { label, value, type = 'text', editMode, onEdit = () => {} } = props;
  const [selectedCountry, setSelectedCountry] = useState(countries[229]);

  return (
    <div className="sm:col-span-1">
      {!editMode && (
        <>
          <dt className="text-sm font-medium text-gray-500">{label}</dt>
          {type === 'birthday' && (
            <dd className="mt-1 text-sm text-gray-900">
              {value !== '' && value !== null ? fullDatefromJS(value) : ''}
            </dd>
          )}
          {!['birthday'].includes(type) && (
            <dd className="mt-1 text-sm text-gray-900">{value}</dd>
          )}
        </>
      )}
      {editMode && (
        <>
          <label
            htmlFor={label}
            className="block text-sm font-medium text-gray-500"
          >
            {label}
          </label>
          {!['url', 'address', 'birthday', 'tel'].includes(type) && (
            <div className="mt-1">
              <input
                type={type}
                name={label}
                id={label}
                onChange={onEdit}
                className="form-input placeholder:text-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={value}
              />
            </div>
          )}
          {type === 'birthday' && (
            <div className="mt-1">
              <input
                type="text"
                name={label}
                id={label}
                onChange={onEdit}
                className="form-input placeholder:text-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={fromJSDateToString(value)}
                placeholder="mm/dd/yyyy"
              />
            </div>
          )}
          {type === 'tel' && (
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 flex items-center">
                <label htmlFor="country" className="sr-only">
                  Phone Type
                </label>
                <select
                  id="phoneType"
                  name="phoneType"
                  autoComplete="type"
                  className="form-select focus:ring-purple-500 focus:border-purple-500 h-full py-0 pl-3 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                >
                  <option>Cell</option>
                  <option>Home</option>
                  <option>Work</option>
                  <option>Other</option>
                </select>
              </div>
              <input
                type="tel"
                name="phone-number"
                id="phone-number"
                onChange={onEdit}
                className="form-input placeholder:text-gray-300 focus:ring-purple-500 focus:border-purple-500 block w-full pl-20 sm:text-sm border-gray-300 rounded-md"
                placeholder="+1 (910) 999-9999"
              />
            </div>
          )}
          {type === 'url' && (
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                http://
              </span>
              <input
                type={type}
                name={label}
                id={label}
                value={value}
                onChange={onEdit}
                className="placeholder:text-gray-300 form-input flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-purple-500 focus:border-purple-500 sm:text-sm border-gray-300"
                placeholder="www.example.com"
              />
            </div>
          )}
          {type === 'address' && (
            <div className="mt-1 rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="country" className="sr-only">
                  Country
                </label>
                {/* <select
                  id="country"
                  name="country"
                  autoComplete="country-name"
                  className="form-select placeholder:text-gray-300 focus:ring-purple-500 focus:border-purple-500 relative block w-full rounded-none rounded-t-md bg-transparent focus:z-10 sm:text-sm border-gray-300"
                >
                  <option>United States</option>
                  <option>Canada</option>
                  <option>Mexico</option>
                </select> */}
                <Listbox value={selectedCountry} onChange={setSelectedCountry}>
                  <div className="relative mt-1">
                    <Listbox.Button
                      className="form-select relative w-full py-2 pl-3 pr-10 text-left bg-transparent focus:border-purple-500 focus:ring-purple-500 block 
                    rounded-none rounded-t-md focus:z-10 border-gray-300 cursor-default focus:outline-none 
                    sm:text-sm"
                    >
                      <span className="block truncate">
                        {selectedCountry.label}
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute w-full mt-1 z-50 py-1 overflow-auto text-base bg-white rounded-md shadow-lg border-2 border-purple-500 max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm divide-y">
                        {countries.map(country => (
                          <Listbox.Option
                            key={country.value}
                            className={({ active }) =>
                              `${
                                active
                                  ? 'text-purple-900 bg-purple-100'
                                  : 'text-gray-900'
                              }
                          cursor-pointer select-none relative py-2 pl-10 pr-4`}
                            style={{ cursor: 'pointer' }}
                            value={country}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={`${
                                    selected ? 'font-medium' : 'font-normal'
                                  } block truncate`}
                                >
                                  {country.label}
                                </span>
                                {selected ? (
                                  <span
                                    className={`${
                                      active
                                        ? 'text-purple-600'
                                        : 'text-purple-600'
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
                </Listbox>
              </div>
              <div>
                <label htmlFor="postal-code" className="sr-only">
                  Street
                </label>
                <input
                  type="text"
                  name="street"
                  id="street"
                  autoComplete="street"
                  className="form-input placeholder:text-gray-300 focus:ring-purple-500 focus:border-purple-500 relative block w-full rounded-none  bg-transparent focus:z-10 sm:text-sm border-gray-300"
                  placeholder="Street"
                />
              </div>
              <div>
                <label htmlFor="postal-code" className="sr-only">
                  Street 2
                </label>
                <input
                  type="text"
                  name="street2"
                  id="street2"
                  autoComplete="street2"
                  className="form-input placeholder:text-gray-300 focus:ring-purple-500 focus:border-purple-500 relative block w-full rounded-none  bg-transparent focus:z-10 sm:text-sm border-gray-300"
                  placeholder="Street 2"
                />
              </div>
              <div>
                <label htmlFor="postal-code" className="sr-only">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  autoComplete="city"
                  className="form-input placeholder:text-gray-300 focus:ring-purple-500 focus:border-purple-500 relative block w-full rounded-none  bg-transparent focus:z-10 sm:text-sm border-gray-300"
                  placeholder="City"
                />
              </div>
              <div>
                <label htmlFor="postal-code" className="sr-only">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  id="state"
                  autoComplete="state"
                  className="form-input placeholder:text-gray-300 focus:ring-purple-500 focus:border-purple-500 relative block w-full rounded-none bg-transparent focus:z-10 sm:text-sm border-gray-300"
                  placeholder="State"
                />
              </div>
              <div>
                <label htmlFor="postal-code" className="sr-only">
                  ZIP / Postal code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  id="postalCode"
                  autoComplete="postal-code"
                  className="form-input placeholder:text-gray-300 focus:ring-purple-500 focus:border-purple-500 relative block w-full rounded-none rounded-b-md bg-transparent focus:z-10 sm:text-sm border-gray-300"
                  placeholder="ZIP / Postal code"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ContactField;
