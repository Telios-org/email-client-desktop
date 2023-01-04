import React, { useState, useRef, useEffect, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// EXTERNAL LIBRARY
import {
  AtSymbolIcon,
  PlusIcon,
  LightningBoltIcon
} from '@heroicons/react/outline';
import { PlusSmIcon } from '@heroicons/react/solid';
import { Switch, Menu, Transition } from '@headlessui/react';

// SELECTORS
import { Edit, Delete, Paper } from 'react-iconly';
import {
  selectAllNamespaces,
  selectActiveMailbox
} from '../../../../selectors/mail';

// ACTION CREATORS
import {
  updateAlias,
  registerAlias
} from '../../../../actions/mailbox/aliases';

// UTILS
import { formatDateDisplay } from '../../../../../utils/helpers/date';
import sortingHat from '../../../../../utils/helpers/sort';
import { generateRandomString } from '../../../../../utils/helpers/generators';

const { clipboard } = require('electron');
const envAPI = require('../../../../../env_api.json');

const params = window.location.search.replace('?', '');
const env = params.split('=')[1];
// const mailDomain = env === 'production' ? envAPI.prodMail : envAPI.devMail;

const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

type Props = {
  openModalRoute: (route: string) => void;
  aliasSelection: (aliasId: string) => void;
  callToaster: (isSuccess: boolean, message: string) => void;
};

type AliasProps = {
  alias: {
    id: number;
    alias: string;
    ns: string;
    domain: string;
    createdDate: Date;
    disabled: boolean;
    fwdAddresses: string[];
    description: string;
  };
  aliasIdx: number;
};

const AliasManagement = (props: Props) => {
  const dispatch = useDispatch();
  const aliases = useSelector(state => state.mail.aliases);
  const namespaces = useSelector(selectAllNamespaces);
  const activeMailbox = useSelector(selectActiveMailbox);
  const mailDomain = activeMailbox?.domainKey;

  const [quickLoader, setQuickLoader] = useState(false);

  const { openModalRoute, aliasSelection, callToaster } = props;

  const AliasData = aliases.allIds.map((al, index) => {
    const d = aliases.byId[al];

    return {
      id: index,
      alias: d.name,
      ns: d.namespaceKey,
      domain: mailDomain,
      createdDate: d.createdAt,
      disabled: d.disabled,
      fwdAddresses: d.fwdAddresses,
      description: d.description
    };
  });

  const handleToggleAction = async (rowData: any, value: boolean) => {
    // console.log(rowData);
    const payload = {
      namespaceName: rowData.ns,
      domain: mailDomain,
      address: rowData.alias,
      description: rowData.description,
      fwdAddresses: rowData.fwdAddresses,
      disabled: !value
    };
    dispatch(updateAlias(payload));
  };

  const triggerEditAlias = (aliasId: string) => {
    aliasSelection(aliasId);
    openModalRoute('aliasEdit');
  };

  const triggerDeleteAlias = (aliasId: string) => {
    aliasSelection(aliasId);
    openModalRoute('aliasDelete');
  };

  const quickAlias = async (format: 'letters' | 'uid' | 'words') => {
    setQuickLoader(true);
    const register = async (rstr: string) => {
      const res = await dispatch(
        registerAlias(null, mailDomain, rstr.toLowerCase(), '', [], false)
      );

      if (res.success) {
        callToaster(true, 'Alias Created!');
      } else {
        callToaster(false, res.message);
      }

      setQuickLoader(false);
    };
    generateRandomString('random', format, register);
  };

  const AliasRow = (innerProps: AliasProps) => {
    const { alias, aliasIdx } = innerProps;

    return (
      <tr
        className={classNames(
          aliasIdx === 0 ? 'border-gray-300' : 'border-gray-200',
          'border-t'
        )}
      >
        <td className="border-b border-gray-200 whitespace-nowrap px-3 py-4 pl-6 text-sm text-gray-500">
          {formatDateDisplay(alias.createdDate)}
        </td>
        <td className="border-b border-gray-200 whitespace-nowrap px-3 py-4 text-sm text-gray-700">
          <div className="text-xs font-semibold">
            {alias.ns ? `${alias.ns}+` : ''}
            <span className="text-purple-600">{alias.alias}</span>
            {`@${alias.domain}`}
          </div>
          {alias.description?.length > 0 && (
            <div className="text-2xs text-coolGray-400">
              {alias.description}
            </div>
          )}
        </td>
        <td className="border-b border-gray-200 whitespace-nowrap px-3 py-4 text-sm text-gray-800">
          <div className="flex flex-wrap">
            {alias.fwdAddresses?.map((fwd: string) => (
              <div key={`fwd_${fwd}`} className="inline-flex truncate">
                <div
                  className={`${
                    fwd.length > 0
                      ? 'bg-yellow-200 py-1 px-3 text-xs rounded mb-1 mr-1 truncate font-medium border-yellow-400 border'
                      : ''
                  }`}
                >
                  {fwd}
                </div>
              </div>
            ))}
          </div>
        </td>
        <td className="border-b border-gray-200 whitespace-nowrap px-3 py-4 text-center w-[70px]">
          <Switch
            checked={!alias.disabled}
            onChange={(value): Promise<void> => {
              return handleToggleAction(alias, value);
              // return setEnabled(value);
            }}
            className={`${!alias.disabled ? 'bg-sky-500' : 'bg-red-500'}
                                      relative inline-flex h-[19px] w-[39px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
          >
            <span className="sr-only">Disable Alias</span>
            <span
              aria-hidden="true"
              className={`${!alias.disabled ? 'translate-x-5' : 'translate-x-0'}
                                        pointer-events-none inline-block h-[15px] w-[15px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
            />
          </Switch>
        </td>
        <td className="border-b border-gray-200 relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium w-[70px]">
          <div className="flex flex-row justify-end">
            <button type="button" className="group outline-none relative">
              <Paper
                set="broken"
                size="small"
                role="button"
                className="hover:text-blue-500"
                style={{ cursor: 'pointer' }}
                onClick={() =>
                  clipboard.writeText(
                    `${alias.ns ? `${alias.ns}+` : ''}${alias.alias}@${
                      alias.domain
                    }`
                  )}
              />
              <span className="bg-gray-900 opacity-70 text-white absolute right-5 -top-1 px-2 py-1 text-xs rounded hidden group-focus:block">
                Copied!
              </span>
            </button>

            <span className="mx-1" />
            <Edit
              set="broken"
              size="small"
              className="hover:text-blue-500"
              style={{ cursor: 'pointer' }}
              onClick={() =>
                triggerEditAlias(
                  `${alias.ns ? `${alias.ns}#` : ''}${alias.alias}`
                )}
            />
            <span className="mx-1" />
            <Delete
              set="broken"
              size="small"
              className="hover:text-red-500"
              style={{ cursor: 'pointer' }}
              onClick={() =>
                triggerDeleteAlias(
                  `${alias.ns ? `${alias.ns}#` : ''}${alias.alias}`
                )}
            />
          </div>
        </td>
      </tr>
    );
  };

  return (
    <>
      <div className="mt-6 flex justify-between">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-purple-500">
              {/* <ChevronDownIcon
                className="-mr-1 ml-2 h-5 w-5"
                aria-hidden="true"
              /> */}
              <span className={`${quickLoader ? 'opacity-0' : 'opacity-100'}`}>
                <LightningBoltIcon className="h-5 w-5" />
              </span>
              <span
                className={`${quickLoader ? 'visible' : 'invisible'} absolute`}
              >
                <svg
                  className="animate-spin h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </span>
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="origin-top-right absolute z-50 left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-gray-100 focus:outline-none">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm">Quick Random Alias</p>
              </div>
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => quickAlias('uid')}
                      type="button"
                      className={classNames(
                        active ? 'bg-sky-500 text-white' : 'text-gray-500',
                        'flex flex-row w-full px-4 py-2 text-sm'
                      )}
                    >
                      <PlusSmIcon className="h-5 w-5 mr-2" />
                      Add UID
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => quickAlias('words')}
                      type="button"
                      className={classNames(
                        active ? 'bg-sky-500 text-white' : 'text-gray-500',
                        'flex flex-row px-4 py-2  w-full text-sm'
                      )}
                    >
                      <PlusSmIcon className="h-5 w-5 mr-2" />
                      Add 3 Words
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => quickAlias('letters')}
                      type="button"
                      className={classNames(
                        active ? 'bg-sky-500 text-white' : 'text-gray-500',
                        'flex flex-row px-4 py-2  w-full text-sm'
                      )}
                    >
                      <PlusSmIcon className="h-5 w-5 mr-2" />
                      Add Alphanumeric
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
        <div>
          <button
            type="button"
            onClick={() => openModalRoute('nsRegistration')}
            className="mr-4 inline-flex justify-center px-4 py-2 border 
          border-gray-300 shadow-sm text-sm font-medium rounded-md 
          text-gray-500 bg-white hover:bg-gray-50 focus:outline-none
           focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            {/* <Delete set="broken" className="-ml-1 mr-2 h-5 w-5 text-gray-400" /> */}
            <span>Add Namespace</span>
          </button>
          <button
            type="button"
            onClick={() => openModalRoute('aliasRegistration')}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-bl from-purple-600 to-purple-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:w-auto"
          >
            Add Alias
          </button>
        </div>
      </div>
      <div className="mt-6 flex flex-col grow">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8 h-full">
          <div className="min-w-full py-2 align-middle md:px-6 lg:px-8 h-full flex flex-col">
            <div className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg h-full">
              <div className="absolute w-full h-full overflow-y-scroll overflow-hidden rounded-b-lg shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="w-full border-separate">
                  <thead className="bg-white">
                    <tr>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 bg-white bg-opacity-80 border-b border-gray-200 py-3.5 px-3 pl-6 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 backdrop-blur backdrop-filter"
                      >
                        Created
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 bg-white bg-opacity-80 border-b border-gray-200 px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 backdrop-blur backdrop-filter"
                      >
                        Alias
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 bg-white bg-opacity-80 border-b border-gray-200 px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 backdrop-blur backdrop-filter"
                      >
                        Forward Addresses
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 bg-white bg-opacity-80 border-b border-gray-200 px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 backdrop-blur backdrop-filter"
                      >
                        Active
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 bg-white bg-opacity-80 border-b border-gray-200 px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 w-[70px] backdrop-blur backdrop-filter"
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {namespaces.allIds.length === 0 && (
                      <div className="text-center absolute flex flex-col w-full pt-10">
                        <div className="flex self-center text-gray-400">
                          <AtSymbolIcon
                            className="h-10 w-10"
                            aria-hidden="true"
                          />
                        </div>
                        <h3 className="mt-1 text-sm font-medium text-gray-900">
                          No Namespace & Aliases
                        </h3>
                        <p className="-mt-1 text-sm text-gray-500">
                          Get started by creating a new namespace.
                        </p>
                        <div className="mt-6">
                          <button
                            type="button"
                            onClick={() => openModalRoute('nsRegistration')}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                          >
                            <PlusIcon
                              className="-ml-1 mr-2 h-5 w-5"
                              aria-hidden="true"
                            />
                            Create First Namespace
                          </button>
                        </div>
                      </div>
                    )}
                    {namespaces.allIds.length > 0 &&
                      namespaces.allIds.sort().map(ns => (
                        <Fragment key={ns}>
                          <tr className="border-t  border-gray-200">
                            <th
                              colSpan={5}
                              scope="colgroup"
                              className="border-b border-gray-200 bg-gray-50 px-6 py-2 text-left text-sm font-semibold text-gray-900"
                            >
                              <span className="text-sm text-gray-400">
                                Namespace:
                              </span>

                              {` ${ns}`}
                            </th>
                          </tr>
                          {AliasData.filter(f => f.ns === ns)
                            .sort(sortingHat('en', 'alias'))
                            .map((alias, aliasIdx) => (
                              <AliasRow
                                alias={alias}
                                aliasIdx={aliasIdx}
                                key={alias.alias}
                              />
                            ))}
                        </Fragment>
                      ))}
                    <tr className="border-t  border-gray-200">
                      <th
                        colSpan={5}
                        scope="colgroup"
                        className="border-b border-gray-200 bg-gray-50 px-6 py-2 text-left text-sm font-semibold text-gray-900"
                      >
                        <span className="text-sm text-gray-400">
                          Random Aliases
                        </span>
                      </th>
                    </tr>
                    {AliasData.filter(f => f.ns === null)
                      .sort(sortingHat('en', 'alias'))
                      .map((alias, aliasIdx) => (
                        <AliasRow
                          alias={alias}
                          aliasIdx={aliasIdx}
                          key={alias.alias}
                        />
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="text-xs text-gray-400 pl-2 pt-3">
              <b>Note:</b>
{' '}
The + separator is interchangeable with - or # in
              case a website doesn't accept certain characters
</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AliasManagement;
