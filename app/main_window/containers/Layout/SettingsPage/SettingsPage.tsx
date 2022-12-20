/* eslint-disable react/jsx-props-no-spreading */
import React, { Fragment, memo, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tab } from '@headlessui/react';
import {
  Filter,
  Wallet,
  Password,
  Setting,
  ShieldDone,
  Scan,
  Work
} from 'react-iconly';
import { DeviceMobileIcon } from '@heroicons/react/outline';
import BrowserView, { removeViews } from 'react-electron-browser-view';
import { setTimeout } from 'timers';
import { retrieveStats } from '../../../actions/account/account';

import {
  GeneralPanel,
  SecurityPanel,
  BillingPayments,
  DevicesPanel,
  CustomDomains
} from '../../../components/Settings';
import useCollectionListeners from '../../../../utils/hooks/useCollectionListeners';

const electron = require('electron');

const tabs = [
  {
    name: 'General',
    component: GeneralPanel,
    icon: Setting,
    typeRestriction: null
  }, // { name: 'Notifications', panel: GeneralPanel },
  {
    name: 'Plan & Billing',
    component: BillingPayments,
    icon: Wallet,
    typeRestriction: 'PRIMARY'
  },
  {
    name: 'Security',
    component: SecurityPanel,
    icon: ShieldDone,
    typeRestriction: null
  },
  {
    name: 'Devices',
    component: DevicesPanel,
    icon: Scan,
    typeRestriction: null
  },
  {
    name: 'Custom Domains',
    component: CustomDomains,
    icon: Work,
    typeRestriction: 'PRIMARY'
  }
  // { name: 'Billing', panel: GeneralPanel }
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const SettingsPage = () => {
  useCollectionListeners(['Account']);
  const dispatch = useDispatch();
  const [showOverlay, setShowOverlay] = useState(false);
  const [browserURL, setBrowserURL] = useState('');
  const account = useSelector(state => state.account);

  useEffect(() => {
    // Retrieving the Updated Account Stats from Telios Server
    dispatch(retrieveStats());
  }, []);

  useEffect(() => {
    if (!browserURL.includes('http')) {
      setShowOverlay(false);
    }
  }, [browserURL]);

  const handleOverlay = (url: string) => {
    setBrowserURL(url);
    setShowOverlay(true);
  };

  return (
    <div className="relative h-full w-full">
      {showOverlay && browserURL.includes('http') && (
        <div className="bg-white absolute h-full w-full top-0 left-0 z-20">
          <div className="absolute left-1/2 top-1/2 transform -translate-x-2/4 -translate-y-2/4">
            <svg
              className="animate-spin -ml-1 mr-3 h-12 w-12 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
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
          </div>
          <div className="relative z-30 h-full w-full">
            <BrowserView
              src={browserURL}
              // devtools
              className="min-w-[1000px]"
              onDomReady={e => {
                console.log('DOMREADY', e);

                e.sender.insertCSS(
                  '.App.App--multiItem, .App.App--singleItem{ position: absolute !important; top: 50% !important; transform: translate(0%, -50%) !important;}'
                );
              }}
              onWillNavigate={(e, t) => {
                e.preventDefault();
                if (t.includes('canceled')) {
                  setShowOverlay(false);
                  dispatch(retrieveStats());
                }

                if (t.includes('success')) {
                  setShowOverlay(false);
                  dispatch(retrieveStats());

                  setTimeout(() => {
                    // Adding this extra timeout because of a lag for Limited Offer purchase.
                    // Where our DB hasn't yet been updated before it tries to pull the info again.
                    dispatch(retrieveStats());
                  }, 3000);
                }
              }}
              onNewWindow={(e, t) => {
                e.preventDefault();
                electron.shell.openExternal(t);
              }}
            />
          </div>
        </div>
      )}
      <div className="w-full h-full flex flex-row max-w-screen-2xl">
        <Tab.Group vertical>
          <div className="w-72 min-w-72 bg-white border-r border-gray-200">
            <nav aria-label="Sidebar" className="sticky">
              <div className="px-6 pt-6 pb-4">
                <h2 className="text-lg font-medium text-gray-900 leading-6">
                  Account Settings
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Customize your account to your needs
                </p>
              </div>
              <Tab.List className="flex flex-col space-y-1 mt-1 mx-6">
                {tabs
                  .filter(
                    f =>
                      f.typeRestriction === account.type ||
                      f.typeRestriction === null
                  )
                  .map(tab => (
                    <Tab as={Fragment} key={`list_${tab.name}`}>
                      {({ selected }) => (
                        <button
                          type="button"
                          className={classNames(
                            selected
                              ? 'bg-purple-50 text-purple-500 font-medium border border-purple-200 border-l-0'
                              : 'text-gray-600 hover:text-gray-700 hover:font-medium',
                            'group px-3 py-1.5 flex items-center text-sm outline-none relative rounded'
                          )}
                        >
                          <span
                            className={classNames(
                              selected ? 'bg-purple-500' : 'bg-transparent',
                              'absolute w-0.5 h-full rounded-l-lg left-0'
                            )}
                          />
                          <tab.icon
                            set="broken"
                            size="medium"
                            className={classNames(
                              selected
                                ? 'text-inherit'
                                : 'text-gray-400 group-hover:text-gray-600',
                              'flex-shrink-0 ml-1 mb-0.5 mr-2 h-5 w-5'
                            )}
                          />
                          {tab.name}
                        </button>
                      )}
                    </Tab>
                  ))}
              </Tab.List>
            </nav>
          </div>
          <main className="ml-8 pr-8 py-8 flex-1 relative overflow-y-scroll h-full">
            <div className="px-4 sm:px-0 h-full">
              <Tab.Panels className="h-full">
                {tabs
                  .filter(
                    f =>
                      f.typeRestriction === account.type ||
                      f.typeRestriction === null
                  )
                  .map(tab => {
                    const tabProps = {};

                    if (tab.name === 'Plan & Billing') {
                      tabProps.handleOverlay = handleOverlay;
                    }
                    return (
                      <Tab.Panel
                        key={`panel_${tab.name}`}
                        className="outline-none h-full"
                      >
                        <tab.component {...tabProps} />
                      </Tab.Panel>
                    );
                  })}
                {/* <div
                style={{ height: '64rem' }}
                className="border-2 border-dashed border-gray-300 rounded-lg"
              /> */}
              </Tab.Panels>
            </div>
          </main>
        </Tab.Group>
      </div>
    </div>
  );
};

export default SettingsPage;
