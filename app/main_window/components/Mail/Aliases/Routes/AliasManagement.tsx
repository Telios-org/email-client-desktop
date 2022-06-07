import React, { useState, useRef, useEffect, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// EXTERNAL LIBRARY
import { AtSymbolIcon, PlusIcon } from '@heroicons/react/outline';
import { Switch } from '@headlessui/react';

// SELECTORS
import { Edit, Delete, Danger, Paper } from 'react-iconly';
import { selectAllNamespaces } from '../../../../selectors/mail';

// ACTION CREATORS
import { updateAlias, removeAlias } from '../../../../actions/mailbox/aliases';

// UTILS
import { formatDateDisplay } from '../../../../../utils/helpers/date';

const { clipboard } = require('electron');
const envAPI = require('../../../../../env_api.json');

const params = window.location.search.replace('?', '');
const env = params.split('=')[1];
const mailDomain = env === 'production' ? envAPI.prodMail : envAPI.devMail;

const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

type Props = {
  openModalRoute: (route: string) => void;
  aliasSelection: (aliasId: string) => void;
};

const AliasManagement = (props: Props) => {
  const dispatch = useDispatch();
  const aliases = useSelector(state => state.mail.aliases);
  const namespaces = useSelector(selectAllNamespaces);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteObj, setDeleteObj] = useState({});
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { openModalRoute, aliasSelection } = props;

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

  const handleDeleteAlias = async () => {
    const payload = {
      namespaceName: deleteObj.ns,
      domain,
      address: deleteObj.alias
    };
    setDeleteLoading(true);
    await dispatch(removeAlias(payload));
    setDeleteLoading(false);
    setShowDelete(false);
  };

  const handleDeleteAction = rowData => {
    setDeleteObj(rowData);
    setShowDelete(true);
  };

  return (
    <>
      <div className="mt-6 flex justify-end">
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
                      namespaces.allIds.map(ns => (
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
                          {AliasData.filter(f => f.ns === ns).map(
                            (alias, aliasIdx) => (
                              <tr
                                key={alias.alias}
                                className={classNames(
                                  aliasIdx === 0
                                    ? 'border-gray-300'
                                    : 'border-gray-200',
                                  'border-t'
                                )}
                              >
                                <td className="border-b border-gray-200 whitespace-nowrap px-3 py-4 pl-6 text-sm text-gray-500">
                                  {formatDateDisplay(alias.createdDate)}
                                </td>
                                <td className="border-b border-gray-200 whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                  <div className="text-xs font-semibold">
                                    {`${alias.ns}+`}
                                    <span className="text-purple-600">
                                      {alias.alias}
                                    </span>
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
                                      <div
                                        key={`fwd_${fwd}`}
                                        className="inline-flex truncate"
                                      >
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
                                    className={`${
                                      !alias.disabled
                                        ? 'bg-sky-500'
                                        : 'bg-red-500'
                                    }
                                    relative inline-flex h-[19px] w-[39px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
                                  >
                                    <span className="sr-only">
                                      Disable Alias
                                    </span>
                                    <span
                                      aria-hidden="true"
                                      className={`${
                                        !alias.disabled
                                          ? 'translate-x-5'
                                          : 'translate-x-0'
                                      }
                                      pointer-events-none inline-block h-[15px] w-[15px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                                    />
                                  </Switch>
                                </td>
                                <td className="border-b border-gray-200 relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium w-[70px]">
                                  <div className="flex flex-row justify-end">
                                    <button
                                      type="button"
                                      className="group outline-none relative"
                                    >
                                      <Paper
                                        set="broken"
                                        size="small"
                                        role="button"
                                        className="hover:text-blue-500"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() =>
                                          clipboard.writeText(
                                            `${alias.ns}+${alias.alias}@${alias.domain}`
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
                                          `${alias.ns}#${alias.alias}`
                                        )
                                      }
                                    />
                                    <span className="mx-1" />
                                    <Delete
                                      set="broken"
                                      size="small"
                                      className="hover:text-red-500"
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => handleDeleteAction(alias)}
                                    />
                                  </div>
                                </td>
                              </tr>
                            )
                          )}
                        </Fragment>
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
