import React, { useState, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import { ExternalLinkIcon } from '@heroicons/react/solid';

// Helper function
import {
  fromJSDateToString,
  fullDatefromJS,
  fromStringToJSDate,
  fullDatefromString
} from '../../../../utils/helpers/date';

type Props = {
  label: string;
  value: string;
  editMode: boolean;
  type: string;
  onEdit?: (e: Event) => void;
};

const ContactField = (props: Props) => {
  const { label, value, type = 'text', editMode, onEdit = () => {} } = props;

  return (
    <div className="sm:col-span-1">
      {!editMode && (
        <>
          <dt className="text-sm font-medium text-gray-500">{label}</dt>
          {type === 'birthday' && (
            <dd className="mt-1 text-sm text-gray-900">
              {value !== '' && value !== null ? fullDatefromString(value) : ''}
            </dd>
          )}
          {!['birthday', 'url'].includes(type) && (
            <dd className="mt-1 text-sm text-gray-900">{value}</dd>
          )}
          {type === 'url' && (
            <dd className="mt-1 text-sm text-gray-900 group">
              {value.length > 0 && (
                <>
                  <a
                    href={`http://${value}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ cursor: 'pointer' }}
                    className="flex flex-row text-gray-900 group-hover:text-sky-500"
                  >
                    {value}
                    <ExternalLinkIcon className="ml-1 mt-0.5 h-4 w-4 text-gray-400 group-hover:text-sky-500" />
                  </a>
                  
                </>
              )}
            </dd>
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
          {!['url','birthday'].includes(type) && (
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
                value={value}
                placeholder="mm/dd/yyyy"
              />
            </div>
          )}
          {type === 'url' && (
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                http://
              </span>
              <input
                type="text"
                name={label}
                id={label}
                value={value}
                onChange={onEdit}
                className="placeholder:text-gray-300 form-input flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-purple-500 focus:border-purple-500 sm:text-sm border-gray-300"
                placeholder="www.example.com"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ContactField;
