import React, { useState, useRef, useEffect, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// EXTERNAL LIBRARY
import clsx from 'clsx';
import {
  AtSymbolIcon,
  PlusIcon,
  LightningBoltIcon,
  GlobeIcon
} from '@heroicons/react/outline';
import { Edit, Delete, Paper, InfoCircle } from 'react-iconly';
// ICONSET ICONS
import { BsArrowRepeat } from 'react-icons/bs';

// SELECTORS
import { useTheme } from '@bigheads/core/dist/themeContext';
import { selectAllDomains } from '../../../selectors/domains';

// ACTION CREATORS
import { fetchAllDomains } from '../../../actions/domains/domains';

// INTERNAL COMPONENTS
import { Button } from '../../../../global_components/button';
import { VerificationStatus } from '../../../../global_components/status';

// INTERNAL HELPER FUNCTIONS
import sortingHat from '../../../../utils/helpers/sort';
import { formatDateDisplay } from '../../../../utils/helpers/date';

const { clipboard } = require('electron');

// const mailboxes = [
//   {
//     address: 'rollitup@lightitup.com',
//     domain: 'lightitup.com',
//     description: 'When you know you know',
//     displayName: '',
//     createdDate: '2022-01-27T01:57:27.605Z'
//   },
//   {
//     address: 'rocket@tothemoon.io',
//     domain: 'tothemoon.io',
//     description: 'For the loon shots',
//     displayName: 'Rocket Man',
//     createdDate: '2022-01-27T01:57:27.605Z'
//   },
//   {
//     address: 'tesla@tothemoon.io',
//     domain: 'tothemoon.io',
//     description: 'Tesla Fan Boy Account',
//     displayName: 'Elon Musk',
//     createdDate: '2022-01-27T01:57:27.605Z'
//   }
// ];

// const domains = [
//   {
//     name: 'lightitup.com',
//     cNameRecord: 'cnamerecord.39873823098329083298.lightitup.com',
//     description: '',
//     status: 'verified',
//     active: true,
//     createdDate: '2022-01-27T01:57:27.605Z',
//     lastUpdated: '2022-01-27T01:57:27.605Z'
//   },
//   {
//     name: 'tothemoon.io',
//     cNameRecord: 'cnamerecord.hjwe2u32832uoi3u32oiu32.tothemoon.io',
//     description: 'To infinity and beyond',
//     status: 'verified',
//     active: true,
//     createdDate: '2022-01-27T01:57:27.605Z',
//     lastUpdated: '2022-01-27T01:57:27.605Z'
//   },
//   {
//     name: 'madeup.com',
//     cNameRecord: 'cnamerecord.39873823098329083298.lightitup.com',
//     description: '',
//     status: 'error',
//     active: false,
//     createdDate: '2022-01-27T01:57:27.605Z',
//     lastUpdated: '2022-01-27T01:57:27.605Z'
//   },
//   {
//     name: 'example.com',
//     cNameRecord: 'cnamerecord.39873823098329083298.lightitup.com',
//     description: '',
//     status: 'pending',
//     active: false,
//     createdDate: '2022-01-27T01:57:27.605Z',
//     lastUpdated: '2022-01-27T01:57:27.605Z'
//   }
// ];

type Props = {
  openModalRoute: (route: string) => void;
  domainSelection: (domainId: string) => void;
  mailboxSelection: (mailboxId: string) => void;
  callToaster: (isSuccess: boolean, message: string) => void;
};

type MailboxProps = {
  mailbox: {
    id: number;
    address: string;
    domain: string;
    createdDate: Date;
    description: string;
  };
  mailboxIdx: number;
};

const DomainManagement = (props: Props) => {
  const {
    openModalRoute,
    domainSelection,
    mailboxSelection,
    callToaster
  } = props;
  const dispatch = useDispatch();
  const domains = useSelector(selectAllDomains);
  const mailboxes = useSelector(state => state.mail.mailboxes);
  const [loading, setLoader] = useState(false);

  const deleteDomain = (domain: string) => {
    domainSelection(domain);
    openModalRoute('domainDelete');
  };

  const deleteMailbox = (mailbox: any) => {
    mailboxSelection(mailbox);
    openModalRoute('mailboxDelete');
  };

  const editDomain = (domain: string) => {
    domainSelection(domain);
    openModalRoute('editDomainRegistration');
  };

  const infoMailbox = (mailbox: any) => {
    mailboxSelection(mailbox);
    openModalRoute('infoMailbox');
  };

  const getDomainLabel = (active, status) => {
    if (active && status) {
      return 'verified';
    }

    if (!active && status) {
      return 'pending';
    }

    if (!active && !status) {
      return 'unverified';
    }
  };

  const getAllDomains = async () => {
    setLoader(true);
    await dispatch(fetchAllDomains());
    setTimeout(() => {
      setLoader(false);
    }, 3000);
  };

  useEffect(() => {
    dispatch(fetchAllDomains());
  }, []);

  const MailboxRow = (innerProps: MailboxProps) => {
    const { mailbox, mailboxIdx } = innerProps;
    return (
      <tr
        key={mailbox.address}
        className={clsx(
          mailboxIdx === 0 ? 'border-gray-300' : 'border-gray-200',
          'border-t'
        )}
      >
        <td className="border-b border-gray-200 whitespace-nowrap pl-10 py-4 text-xs text-gray-500 ">
          {formatDateDisplay(mailbox.createdAt)}
        </td>
        <td className="border-b border-gray-200 whitespace-nowrap px-3 py-4 text-sm text-gray-400">
          <div className="text-xs font-semibold">
            <div className="text-xs text-coolGray-700">
              {mailbox.displayName.length > 0 &&
                mailbox.displayName !== mailbox.address &&
                mailbox.displayName}
            </div>
            <div className="text-xs font-semibold">
              <span className="text-purple-600">
                {mailbox.address.split('@')[0]}
              </span>
              {`@${mailbox.domainKey}`}
            </div>
          </div>
        </td>
        <td className="border-b border-gray-200 whitespace-nowrap px-3 py-4 text-center w-[70px] text-xs">
          {mailbox.type === 'SUB' ? 'Sub-Account' : 'Business'}
        </td>
        <td className="border-b border-gray-200 whitespace-nowrap px-3 py-4 text-center w-[70px]" />
        <td className="border-b border-gray-200 whitespace-nowrap px-3 py-4 text-center w-[70px]" />
        <td className="border-b border-gray-200 relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium w-[70px]">
          <div className="flex flex-row justify-end">
            <button type="button" className="group outline-none relative">
              <Paper
                set="broken"
                size="small"
                role="button"
                className="hover:text-blue-500"
                style={{ cursor: 'pointer' }}
                onClick={() => clipboard.writeText(mailbox.address)}
              />
              <span className="bg-gray-900 opacity-70 text-white absolute right-5 -top-1 px-2 py-1 text-xs rounded hidden group-focus:block">
                Copied!
              </span>
            </button>

            <span className="mx-1" />
            <InfoCircle
              set="broken"
              size="small"
              className="hover:text-blue-500"
              style={{ cursor: 'pointer' }}
              onClick={() => infoMailbox(mailbox)}
            />
            <span className="mx-1" />
            <Delete
              set="broken"
              size="small"
              className="hover:text-red-500"
              style={{ cursor: 'pointer' }}
              onClick={() => deleteMailbox(mailbox)}
            />
          </div>
        </td>
      </tr>
    );
  };

  return (
    <>
      <div className="flex justify-between w-full min-w-fit">
        <div className="flex flex-row">
          <Button
            type="button"
            onClick={getAllDomains}
            loading={loading}
            loadingText="Checking Status"
            variant="outline"
            className="pt-2 pb-2 text-sm font-medium bg-white"
          >
            <div className="flex flex-row">
              <div className="self-center text-base pr-1">
                <BsArrowRepeat />
              </div>
              <div>Refresh Status</div>
            </div>
          </Button>
        </div>

        <div className="flex flex-row space-x-2">
          <Button
            type="button"
            onClick={() => openModalRoute('domainRegistration')}
            variant="primary"
            className="pt-2 pb-2 text-sm font-medium bg-white"
          >
            {/* <Delete set="broken" className="-ml-1 mr-2 h-5 w-5 text-gray-400" /> */}
            <span className="whitespace-nowrap">Add Custom Domain</span>
          </Button>
          <Button
            type="button"
            onClick={() => openModalRoute('mailboxRegistration')}
            variant="secondary"
            className="pt-2 pb-2 text-sm font-medium"
            // disabled={domains.allIds.some(dm => !domains.byId[dm].active)}
          >
            Add Mailbox
          </Button>
        </div>
      </div>
      <div className="mt-6 flex flex-col grow">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8 h-full">
          <div className="min-w-full py-2 align-middle md:px-6 lg:px-8 h-full flex flex-col">
            <div className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg h-full">
              <div className="bg-white absolute w-full h-full overflow-scroll rounded-b-lg shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="w-full border-separate ">
                  <thead className="bg-white">
                    <tr>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 bg-white bg-opacity-80 border-b border-gray-200 py-3.5 px-3 pl-6 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 backdrop-blur backdrop-filter"
                      >
                        Domain
                      </th>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 bg-white bg-opacity-80 border-b border-gray-200 px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 backdrop-blur backdrop-filter"
                      />
                      <th
                        scope="col"
                        className="sticky top-0 z-10 bg-white bg-opacity-80 border-b border-gray-200 px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 backdrop-blur backdrop-filter"
                      />
                      <th
                        scope="col"
                        className="sticky top-0 z-10 bg-white bg-opacity-80 border-b border-gray-200 px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 backdrop-blur backdrop-filter"
                      >
                        Status
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
                  <tbody className="">
                    {domains.allIds.length === 0 && (
                      <tr className="">
                        <th colSpan={4} scope="colgroup ">
                          <div className="text-center absolute flex flex-col w-full pt-10">
                            <div className="flex self-center text-gray-400">
                              <GlobeIcon
                                className="h-10 w-10"
                                aria-hidden="true"
                              />
                            </div>
                            <h3 className="mt-1 text-sm font-medium text-gray-800">
                              No Custom Domain
                            </h3>
                            <p className="-mt-1 text-sm text-gray-400 font-medium">
                              Get started by creating a new domain.
                            </p>
                            <div className="mt-6 w-fit self-center">
                              <Button
                                type="button"
                                onClick={() =>
                                  openModalRoute('domainRegistration')}
                                variant="primary"
                                className="pt-2 pb-2 text-sm font-medium bg-white inline-flex items-center"
                              >
                                <PlusIcon
                                  className="-ml-1 mr-2 h-5 w-5"
                                  aria-hidden="true"
                                />
                                <span className="whitespace-nowrap">
                                  Add First Custom Domain
                                </span>
                              </Button>
                              {/* <button
                                type="button"
                                onClick={() => {}}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                              >
                                <PlusIcon
                                  className="-ml-1 mr-2 h-5 w-5"
                                  aria-hidden="true"
                                />
                                Add First Custom Domain
                              </button> */}
                            </div>
                          </div>
                        </th>
                      </tr>
                    )}
                    {domains.allIds.length > 0 &&
                      domains.allIds
                        .map(id => domains.byId[id])
                        .map(dom => {
                          return {
                            ...dom,
                            label: getDomainLabel(
                              dom.active,
                              dom.dns?.vcode?.verified ?? false
                            )
                          };
                        })
                        .map(dm => (
                          <>
                            <tr
                              key={dm.name}
                              className="border-t  border-gray-200"
                            >
                              <th
                                colSpan={3}
                                scope="colgroup"
                                className="border-b border-gray-200 bg-gray-50 px-6 py-2 text-left text-sm font-semibold text-gray-500"
                              >
                                {/* <span className="text-sm text-gray-400">
                                Domain:
                              </span> */}

                                {` ${dm.name}`}
                              </th>
                              <th
                                colSpan={1}
                                className="border-b border-gray-200 bg-gray-50 py-2 px-3 text-xs font-medium text-gray-400 text-left"
                              >
                                <VerificationStatus
                                  status={dm.label}
                                  className="text-xs"
                                />
                              </th>
                              <th
                                colSpan={1}
                                className="border-b border-gray-200 bg-gray-50 py-2 px-3 text-xs font-medium text-gray-400 text-left"
                              >
                                <div className="flex flex-row items-center">
                                  <span className="flex h-2 w-2 relative">
                                    <span
                                      className={clsx(
                                        dm.active && 'bg-green-400',
                                        'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75'
                                      )}
                                    />
                                    <span
                                      className={clsx(
                                        dm.active && 'bg-green-500',
                                        dm.active === false && 'bg-gray-300',
                                        'relative inline-flex rounded-full h-2 w-2 border'
                                      )}
                                    />
                                  </span>
                                  <span
                                    className={clsx(
                                      'ml-2 capitalize',
                                      dm.active === false && 'text-gray-300'
                                    )}
                                  >
                                    {dm.active && 'Yes'}
                                    {dm.active === false && 'No'}
                                  </span>
                                </div>
                              </th>
                              <th
                                colSpan={1}
                                className="border-b border-gray-200 bg-gray-50 relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium w-[70px]"
                              >
                                <div className="flex flex-row justify-end">
                                  <Edit
                                    set="broken"
                                    size="small"
                                    className="hover:text-blue-500"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => editDomain(dm.name)}
                                  />
                                  <span className="mx-1" />
                                  <Delete
                                    set="broken"
                                    size="small"
                                    className="hover:text-red-500"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => deleteDomain(dm.name)}
                                  />
                                </div>
                              </th>
                            </tr>
                            {mailboxes.allIds
                              .map(m => mailboxes.byId[m])
                              .filter(f => f.domainKey === dm.name)
                              .sort(sortingHat('en', 'alias'))
                              .map((mailbox, mailboxIdx) => (
                                <MailboxRow
                                  mailbox={mailbox}
                                  mailboxIdx={mailboxIdx}
                                  key={mailbox.address}
                                />
                              ))}
                          </>
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

export default DomainManagement;
