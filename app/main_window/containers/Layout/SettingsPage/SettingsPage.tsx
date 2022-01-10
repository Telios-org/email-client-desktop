import React, { Fragment, memo, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tab } from '@headlessui/react';
import { Filter, Wallet, Password, Setting, ShieldDone } from 'react-iconly';
import {
  BellIcon,
  CogIcon,
  CreditCardIcon,
  KeyIcon,
  MenuIcon,
  UserCircleIcon,
  ViewGridAddIcon,
  XIcon,
} from '@heroicons/react/outline'
import StatsList from '../../../components/Settings/Stats/StatsList';

import { GeneralPanel, SecurityPanel } from '../../../components/Settings';

const tabs = [
  { name: 'General', panel: GeneralPanel, icon: Setting }, // { name: 'Notifications', panel: GeneralPanel },
  { name: 'Plan / Billing', panel: GeneralPanel, icon: Wallet },
  { name: 'Security', panel: SecurityPanel, icon: ShieldDone }
  // { name: 'Billing', panel: GeneralPanel }
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// const SettingsPage = () => {
//   return (
//     <div className="max-w-5xl mx-auto flex flex-col md:px-8 xl:px-0">
//       <main className="flex-1">
//         <div className="relative max-w-5xl mx-auto md:px-8 xl:px-0">
//           <div className="pt-10 pb-16">
//             <StatsList />
//             <div className="">
//               <h1 className="text-xl font-extrabold text-gray-900">
//                 Account Settings
//               </h1>
//             </div>
//             {/* <div className="block">
//               <div className="border-b border-gray-200">
//                 <nav className="-mb-px flex space-x-8">
//                   {tabs.map(tab => (
//                     <a
//                       key={tab.name}
//                     //   href='#'
//                       className={classNames(
//                         tab.current
//                           ? 'border-purple-500 text-purple-600'
//                           : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
//                         'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:no-underline'
//                       )}
//                     >
//                       {tab.name}
//                     </a>
//                   ))}
//                 </nav>
//               </div>
//             </div> */}
//             <Tab.Group>
//               <Tab.List className="border-b border-gray-200 flex space-x-8">
//                 {tabs.map(tab => (
//                   <Tab
//                     className={({ selected }) =>
//                       classNames(
//                         selected
//                           ? 'border-purple-500 text-purple-600'
//                           : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
//                         'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:no-underline outline-none'
//                       )}
//                     key={`list_${tab.name}`}
//                   >
//                     {tab.name}
//                   </Tab>
//                 ))}
//               </Tab.List>
//               <Tab.Panels>
//                 {tabs.map(tab => {
//                   const DesignatedPanel = tab.panel;
//                   return (
//                     <Tab.Panel
//                       key={`panel_${tab.name}`}
//                       className="outline-none"
//                     >
//                       <DesignatedPanel />
//                     </Tab.Panel>
//                   );
//                 })}
//               </Tab.Panels>
//             </Tab.Group>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

const SettingsPage = () => {
  return (
    <div className="py-8">
      <div className="px-8 w-full flex flex-row">
        <Tab.Group vertical>
          <div className="w-56">
            <nav aria-label="Sidebar" className="sticky top-6">
              <h2 className="font-bold text-base">Account Settings</h2>
              <Tab.List className="flex flex-col space-y-1">
                {tabs.map(tab => (
                  <Tab as={Fragment} key={`list_${tab.name}`}>
                    {({ selected }) => (
                      <button
                        type="button"
                        className={classNames(
                          selected
                            ? 'bg-sky-50 text-sky-500 font-medium border border-sky-200 border-l-0'
                            : 'text-gray-600 hover:text-gray-700 hover:font-medium',
                          'group px-3 py-2.5 flex items-center text-sm outline-none relative rounded'
                        )}
                      >
                        <span
                          className={classNames(
                            selected ? 'bg-sky-500' : 'bg-transparent',
                            'absolute w-0.5 h-full rounded-l-lg left-0'
                          )}
                        />
                        <tab.icon
                          set='broken'
                          size='medium'
                          className={classNames(
                            selected ? 'text-inherit' : 'text-gray-400 group-hover:text-gray-600',
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
          <main className="ml-8 flex-grow">
            <div className="px-4 sm:px-0">
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
