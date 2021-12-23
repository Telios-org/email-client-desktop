import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

// EXTERNAL LIBRAIRIES
import { usePopper } from 'react-popper';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { Portal } from 'react-portal';
import { Logout, Setting, User } from 'react-iconly';

// INTERNAL COMPONENTS
import UserBubble from './CustomSVG/UserBubble';

// STATE SELECTORS
import { selectActiveMailbox } from '../../../selectors/mail';

const { ipcRenderer } = require('electron');
const pkg = require('../../../../package.json');

const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' }
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

type Props = {
  onSelect: (eventKey: string) => void;
};

const UserMenu = (props: Props) => {
  const { onSelect } = props;
  const mailbox = useSelector(selectActiveMailbox);
  const [displayAddress, setDisplayAddress] = useState('');
  const [hasAvatar, setHasAvatar] = useState(true);
  const popperElRef = React.useRef(null);
  const [targetElement, setTargetElement] = React.useState(null);
  const [popperElement, setPopperElement] = React.useState(null);
  const { styles, attributes } = usePopper(targetElement, popperElement, {
    placement: 'right-end',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 20]
        }
      }
    ]
  });

  useEffect(() => {
    if (mailbox?.address?.length > 0) {
      setDisplayAddress(mailbox.address);
    } else if (mailbox?.name?.length > 0) {
      setDisplayAddress(mailbox.name);
    }
  }, [mailbox]);

  const onSignout = async () => {
    ipcRenderer.send('logout');
  };

  return (
    <Menu as="div" className="relative">
      {({ open }) => (
        <>
          <div
            ref={setTargetElement}
            className="rounded-full shadow border border-gray-400/70"
          >
            <Menu.Button
              className={`max-w-xs flex items-center rounded-full text-sm focus:outline-none ${
                open ? 'ring-2 ring-offset-2 ring-blue-300' : ''
              } `}
            >
              <span className="sr-only">Open user menu</span>
              {hasAvatar && (
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
              )}
              {!hasAvatar && (
                <UserBubble className="hover:text-purple-500 text-gray-400" />
              )}
            </Menu.Button>
          </div>
          <Portal>
            <div ref={popperElRef} style={styles.popper} {...attributes.popper}>
              <Transition
                show={open}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
                beforeEnter={() => setPopperElement(popperElRef.current)}
                afterLeave={() => setPopperElement(null)}
              >
                <Menu.Items
                  static
                  className="w-56 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none"
                >
                  <div className="px-4 py-3">
                    <p className="text-sm leading-5 flex justify-between">
                      Signed in as
                    </p>
                    <p className="text-sm font-semibold leading-5 text-gray-900 truncate">
                      {displayAddress}
                    </p>
                  </div>

                  <div className="py-1">
                    <Menu.Item onClick={() => onSelect('settings')}>
                      {({ active }) => (
                        <div
                          style={{ cursor: 'pointer' }}
                          className={`${
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700'
                          } flex items-center w-full px-4 py-2 text-sm leading-5 text-left`}
                        >
                          {/* <Setting
                            set="broken"
                            size="small"
                            className="hover:text-purple-500 mr-2"
                          /> */}
                          Account Settings
                        </div>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <div
                          style={{ cursor: 'pointer' }}
                          className={`${
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700'
                          } flex items-center justify-between w-full px-4 py-2 text-sm leading-5 text-left`}
                        >
                          <span>Support</span>
                          <span className="text-xs rounded px-2 font-semibold bg-gray-200 text-gray-400">
                            {`V-${pkg.version}`}
                          </span>
                        </div>
                      )}
                    </Menu.Item>
                    {/* <Menu.Item
                      as="span"
                      disabled
                      className="flex justify-between w-full px-4 py-2 text-sm leading-5 text-left text-gray-700 cursor-not-allowed opacity-50"
                    >
                      New feature (soon)
                    </Menu.Item> */}
                    {/* <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#license"
                          className={`${
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700'
                          } flex justify-between w-full px-4 py-2 text-sm leading-5 text-left`}
                        >
                          License
                        </a>
                      )}
                    </Menu.Item> */}
                  </div>

                  <div className="py-1">
                    <Menu.Item onClick={onSignout}>
                      {({ active }) => (
                        <div
                          style={{ cursor: 'pointer' }}
                          className={`${
                            active ? 'text-red-500' : 'text-gray-700'
                          } flex w-full px-4 py-2 text-sm leading-5 text-left items-center`}
                        >
                          <Logout set="broken" size="small" className="mr-2" />
                          Sign out
                        </div>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </div>
          </Portal>
        </>
      )}
    </Menu>
  );
};

export default UserMenu;
