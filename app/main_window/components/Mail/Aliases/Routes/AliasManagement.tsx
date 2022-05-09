import React, { useState, useRef, useEffect, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// EXTERNAL LIBRARY
import { AtSymbolIcon } from '@heroicons/react/outline';

// SELECTORS
import { selectAllNamespaces } from '../../../../selectors/mail';

// UTILS
import { formatDateDisplay } from '../../../../../utils/helpers/date';

const envAPI = require('../../../../../env_api.json');

const params = window.location.search.replace('?', '');
const env = params.split('=')[1];
const mailDomain = env === 'production' ? envAPI.prodMail : envAPI.devMail;

const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

const AliasManagement = () => {
  const aliases = useSelector(state => state.mail.aliases);
  const namespaces = useSelector(selectAllNamespaces);

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

  return (
    <>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => {}}
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
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-gradient-to-bl from-purple-600 to-purple-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:w-auto"
        >
          Add Alias
        </button>
      </div>
      <div className="mt-6 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <div className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full">
                  <thead className="bg-white">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 px-3 pl-6 text-left text-sm font-medium text-gray-900"
                      >
                        Created
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-medium text-gray-900"
                      >
                        Alias
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-medium text-gray-900"
                      >
                        Forward Addresses
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-medium text-gray-900"
                      >
                        Active
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {namespaces.allIds.map(ns => (
                      <Fragment key={ns}>
                        <tr className="border-t border-gray-200">
                          <th
                            colSpan={5}
                            scope="colgroup"
                            className="bg-gray-50 px-6 py-2 text-left text-sm font-semibold text-gray-900"
                          >
                            {ns}
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
                            <td className="whitespace-nowrap px-3 py-4 pl-6 text-sm text-gray-500">
                                {formatDateDisplay(alias.createdDate)}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                <div className="text-xs font-semibold">
                                  {`${alias.ns}#`}
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
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {alias.fwdAddresses}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 flex-col flex">
                                {alias.fwdAddresses?.map((fwd: string) => (
                                  <div
                                    key={`fwd_${fwd}`}
                                    className="inline-flex truncate"
                                  >
                                    <div
                                      className={`${
                                        fwd.length > 0
                                          ? 'bg-coolGray-100 py-1 px-3 text-xs rounded mb-1 truncate'
                                          : ''
                                      }`}
                                    >
                                      {fwd}
                                    </div>
                                  </div>
                                ))}
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <a
                                  href="#"
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Edit
                                  <span className="sr-only">,</span>
                                </a>
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
          </div>
        </div>
      </div>
    </>
  );
};

export default AliasManagement;
