import React, { useState, Fragment, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import { ExternalLinkIcon } from '@heroicons/react/solid';

type Props = {
  label: string;
  value: {
    formatted: string;
    street: string;
    street2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  editMode: boolean;
  onEdit: (id: string) => (e: any) => void;
};

const countries = require('../countries.json');

const AddressField = (props: Props) => {
  const { label, value, editMode, onEdit } = props;
  const [selectedCountry, setSelectedCountry] = useState(countries[229]);

  useEffect(() => {
    const c = countries.filter(c => c.value === value.country);
    if (c.length === 1) {
      setSelectedCountry(c[0]);
    }
  }, [value.country]);

  useEffect(() => {
    onEdit('address_type_0')({ target: { value: 'primary' } });
  }, []);

  useEffect(() => {
    const formatted = {
      target: {
        value: `${value.street}, ${value.street2} ${value.street2 ? ',' : ''} 
        ${value.city} ${value.state} ${value.zip} - ${value.country}`
      }
    };
    onEdit('address_formatted_0')(formatted);
  }, [
    value.street,
    value.street2,
    value.city,
    value.state,
    value.country,
    value.zip
  ]);

  const handleCountryChange = (val: { label: string; value: string }) => {
    setSelectedCountry(val);
    onEdit('address_country_0')({ target: { value: val.value } });
  };

  return (
    <div className="sm:col-span-1">
      {!editMode && (
        <>
          <dt className="text-sm font-medium text-gray-500">{label}</dt>
          <dd className="mt-1 text-sm text-gray-900 flex flex-col">
            <span>{value.street}</span>
            {value.street2 && <span>{value.street2}</span>}
            <span>{`${value.city} ${value.state} ${value.zip}`}</span>
            <span>{value.country && selectedCountry.label}</span>
          </dd>
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
              <Listbox value={selectedCountry} onChange={handleCountryChange}>
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
                onChange={onEdit('address_street_0')}
                value={value.street}
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
                onChange={onEdit('address_street2_0')}
                value={value.street2}
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
                onChange={onEdit('address_city_0')}
                value={value.city}
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
                onChange={onEdit('address_state_0')}
                value={value.state}
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
                onChange={onEdit('address_postalCode_0')}
                value={value.zip}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AddressField;
