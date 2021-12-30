import React, { memo, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tab } from '@headlessui/react';

import { GeneralPanel, SecurityPanel } from '../../../components/Settings';

const tabs = [
  { name: 'General', panel: GeneralPanel },
  { name: 'Security', panel: SecurityPanel },
  { name: 'Notifications', panel: GeneralPanel },
  { name: 'Plan', panel: GeneralPanel },
  { name: 'Billing', panel: GeneralPanel }
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const SettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto flex flex-col md:px-8 xl:px-0">
      <main className="flex-1">
        <div className="relative max-w-4xl mx-auto md:px-8 xl:px-0">
          <div className="pt-10 pb-16">
            <div className="px-4 sm:px-6 md:px-0">
              <h1 className="text-xl font-extrabold text-gray-900">
                Account Settings
              </h1>
            </div>
            {/* <div className="block">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map(tab => (
                    <a
                      key={tab.name}
                    //   href='#'
                      className={classNames(
                        tab.current
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:no-underline'
                      )}
                    >
                      {tab.name}
                    </a>
                  ))}
                </nav>
              </div>
            </div> */}
            <Tab.Group>
              <Tab.List className="border-b border-gray-200 flex space-x-8">
                {tabs.map(tab => (
                  <Tab
                    className={({ selected }) =>
                      classNames(
                        selected
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:no-underline outline-none'
                      )}
                    key={`list_${tab.name}`}
                  >
                    {tab.name}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels>
                {tabs.map(tab => {
                  const DesignatedPanel = tab.panel;
                  return (
                    <Tab.Panel
                      key={`panel_${tab.name}`}
                      className="outline-none"
                    >
                      <DesignatedPanel />
                    </Tab.Panel>
                  );
                })}
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
