import React, { useState, useEffect, Fragment } from 'react';
import { useSelector } from 'react-redux';

// EXTERNAL LIBRAIRIES
import { usePopper } from 'react-popper';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { Portal } from 'react-portal';
import { Logout, Setting, User } from 'react-iconly';
import { BigHead } from '@bigheads/core';

// INTERNAL COMPONENTS
import UserBubble from '../Navigation/CustomSVG/UserBubble';
import stringToHslColor from '../../../../utils/avatar.util';
import Loader from '../../../../global_components/Loader';

// STATE SELECTORS
import { selectActiveMailbox } from '../../../selectors/mail';
import mail from '../../../reducers/mail';

const { ipcRenderer } = require('electron');
const pkg = require('../../../../package.json');

const AccountService = require('../../../../services/account.service');
const LoginService = require('../../../../services/login.service');

type Props = {
  onSelect: (eventKey: string) => void;
};

const UserMenu = (props: Props) => {
  const { onSelect } = props;
  // Loading Modal State
  const [isOpen, setIsOpen] = useState(false);
  const closeModal = () => {
    setIsOpen(false);
  };
  const openModal = () => {
    setIsOpen(true);
  };

  // Current Account State
  const mailbox = useSelector(selectActiveMailbox);
  const account = useSelector(state => state.account);
  const [displayAddress, setDisplayAddress] = useState('');
  const [hasAvatar, setHasAvatar] = useState(false);

  // Popup States
  const popperElRef = React.useRef(null);
  const [targetElement, setTargetElement] = React.useState(null);
  const [popperElement, setPopperElement] = React.useState(null);
  const { styles, attributes } = usePopper(targetElement, popperElement, {
    placement: 'bottom-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 5]
        }
      }
    ]
  });

  // Account Switcher States
  const mailboxes = useSelector(state => state.mail.mailboxes);
  const [switcherData, setSwitcherData] = useState([]);

  useEffect(() => {
    if (mailbox?.displayName?.length > 0) {
      setDisplayAddress(mailbox.displayName);
    } else if (mailbox?.address?.length > 0) {
      setDisplayAddress(mailbox.address);
    }
  }, [mailbox?.displayName, mailbox?.address]);

  useEffect(() => {
    const acctType = account.type || 'PRIMARY';
    let switcher = [];
    if (acctType.toUpperCase() === 'PRIMARY' && mailboxes && mailbox?.address) {
      const onDrive = LoginService.getAccounts(mailbox.address);
      switcher = mailboxes.allIds
        .map(m => {
          const {
            address,
            mnemonic,
            password,
            displayName,
            avatar,
            type
          } = mailboxes.byId[m];
          let avtr = null;
          if (type === 'PRIMARY') {
            avtr = account?.avatar;
          }
          return {
            address,
            password,
            mnemonic,
            displayName,
            avatar: avtr,
            type
          };
        })
        .filter(
          m =>
            (onDrive.includes(m.address) && m.type === 'SUB') ||
            m.type === 'PRIMARY'
        );
      // END
      setSwitcherData(switcher);
      // console.log('SETTING DRIVE', switcher);
      sessionStorage.setItem('AccountSwitcherData', JSON.stringify(switcher));
    } else {
      const rawData = sessionStorage.getItem('AccountSwitcherData') || '[]';
      // console.log('Pulling Session data', rawData);
      setSwitcherData(JSON.parse(rawData));
    }
  }, [account, mailboxes, mailbox?.address]);

  useEffect(() => {
    if (account?.avatar?.length > 0) {
      setHasAvatar(true);
    } else {
      setHasAvatar(false);
    }
  }, [account]);

  const onSignout = async () => {
    AccountService.logout();
  };

  const onSwitch = async mbox => {
    openModal();
    await AccountService.logout(false, false);
    if (mbox.mnemonic) {
      await LoginService.initAccount(null, mbox.address, mbox.mnemonic);
    } else {
      await LoginService.initAccount(mbox.password, mbox.address);
    }

    ipcRenderer.send('RENDERER::accountSwitch');
    setTimeout(() => {
      closeModal();
    }, 3000);
  };

  return (
    <>
      <Menu as="div" className="relative">
        {({ open }) => (
          <>
            <div
              ref={setTargetElement}
              className="rounded-full shadow border border-gray-400/70 z-50 relative"
              style={{ cursor: 'pointer' }}
            >
              <Menu.Button
                className={`max-w-xs flex items-center rounded-full text-sm focus:outline-none relative${
                  open ? 'ring-2 ring-offset-2 ring-blue-300' : ''
                } `}
              >
                <span className="sr-only">Open user menu</span>
                {hasAvatar && (
                  <img
                    className="h-7 w-7 rounded-full"
                    src={account.avatar}
                    alt=""
                  />
                )}
                {!hasAvatar && (
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: stringToHslColor(displayAddress, 50, 50)
                    }}
                  >
                    <span className="text-sm font-medium leading-none text-white uppercase">
                      {displayAddress.substring(0, 1)}
                    </span>
                  </span>
                )}
              </Menu.Button>
            </div>
            <Portal>
              <div
                ref={popperElRef}
                style={styles.popper}
                className="z-50"
                {...attributes.popper}
              >
                <Transition
                  show={open && !isOpen}
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
                    className="w-72 bg-white border border-gray-200 divide-y divide-gray-200 rounded-md shadow-lg outline-none"
                  >
                    <div className="px-4 py-4 flex flex-col">
                      <div className="flex flex-row items-center">
                        <div className="border border-gray-300 rounded-full">
                          {hasAvatar && (
                            <img
                              className="h-9 w-9 rounded-full"
                              src={account.avatar}
                              alt=""
                            />
                          )}
                          {!hasAvatar && (
                            <div
                              className="inline-flex h-9 w-9 rounded-full items-center justify-center"
                              style={{
                                backgroundColor: stringToHslColor(
                                  displayAddress,
                                  50,
                                  50
                                )
                              }}
                            >
                              <span className="text-md font-medium leading-none text-white uppercase">
                                {displayAddress.substring(0, 1)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="pl-3 flex flex-col overflow-hidden max-w-[215px]">
                          <div className="text-sm leading-5 font-semibold overflow-ellipsis overflow-x-hidden">
                            {mailbox?.displayName?.length > 0
                              ? mailbox?.displayName
                              : mailbox?.address}
                          </div>
                          {mailbox?.displayName?.length > 0 && (
                            <div className="text-xs leading-5 font-normal text-gray-500 overflow-ellipsis overflow-x-hidden">
                              {mailbox?.address}
                            </div>
                          )}
                        </div>
                      </div>
                      <Menu.Item>
                        <div
                          className="w-full pt-3 text-center"
                          style={{ cursor: 'pointer' }}
                          onClick={() => onSelect('settings')}
                        >
                          <div className="text-xs rounded border border-gray-300 py-1 text-gray-500 hover:bg-gray-100">
                            Account Settings
                          </div>
                        </div>
                      </Menu.Item>
                    </div>
                    {switcherData.filter(m => m.address !== mailbox?.address)
                      .length > 0 && (
                      <div className="py-1 max-h-[300px] overflow-y-scroll">
                        {switcherData
                          .filter(m => m.address !== mailbox?.address)
                          .map(m => (
                            <Menu.Item
                              key={m.address}
                              onClick={() => onSwitch(m)}
                            >
                              {({ active }) => (
                                <div
                                  style={{ cursor: 'pointer' }}
                                  className={`${
                                    active
                                      ? 'bg-gray-100 text-gray-900'
                                      : 'text-gray-700'
                                  } flex flex-row items-center w-full px-4 py-2 text-sm leading-5 text-left`}
                                >
                                  <div className="border border-gray-300 rounded-full">
                                    {m.avatar && (
                                      <img
                                        className="h-7 w-7 rounded-full"
                                        src={m.avatar}
                                        alt=""
                                      />
                                    )}
                                    {!m.avatar && (
                                      <div
                                        className="inline-flex h-7 w-7 items-center justify-center rounded-full"
                                        style={{
                                          backgroundColor: stringToHslColor(
                                            m.address,
                                            50,
                                            50
                                          )
                                        }}
                                      >
                                        <span className="text-sm font-medium leading-none text-white uppercase">
                                          {m?.displayName.substring(0, 1)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="pl-3 flex flex-col overflow-hidden max-w-[200px]">
                                    <div className="text-xs leading-4 flex justify-between font-semibold overflow-ellipsis overflow-x-hidden whitespace-nowrap">
                                      {m?.displayName || m?.address}
                                    </div>
                                    <div className="text-xs leading-4 flex justify-between font-normal text-gray-500 overflow-ellipsis overflow-x-hidden whitespace-nowrap">
                                      {m?.address}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Menu.Item>
                          ))}
                      </div>
                    )}

                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="https://github.com/Telios-org/email-client-desktop/releases"
                            target="_blank"
                            rel="noreferrer"
                            style={{ cursor: 'pointer' }}
                            className={`${
                              active
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-700'
                            } flex items-center justify-between w-full px-4 py-2 text-sm leading-5 text-left hover:no-underline font-normal`}
                          >
                            <span>Release Notes</span>
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="https://teliostech.atlassian.net/servicedesk/customer/portal/1"
                            target="_blank"
                            rel="noreferrer"
                            style={{ cursor: 'pointer' }}
                            className={`${
                              active
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-700'
                            } flex items-center justify-between w-full px-4 py-2 text-sm leading-5 text-left hover:no-underline font-normal`}
                          >
                            <span>Support</span>
                          </a>
                        )}
                      </Menu.Item>
                    </div>

                    <div className="py-1">
                      <Menu.Item onClick={onSignout}>
                        {({ active }) => (
                          <div
                            style={{ cursor: 'pointer' }}
                            className={`${
                              active ? 'text-red-500' : 'text-gray-700'
                            } flex w-full px-4 py-2 text-sm leading-5 text-left items-center font-medium`}
                          >
                            <Logout
                              set="broken"
                              size="small"
                              className="mr-2"
                            />
                            Sign out
                          </div>
                        )}
                      </Menu.Item>
                      <div className="text-xs px-4 text-gray-400 pb-2 pt-1 w-full flex flex-row justify-center items-center font-medium">
                        {`v${pkg.version}`}
{' '}
                        <span className="h-1 w-1 rounded-full bg-gray-400 mx-2" />
                        <a
                          href="https://docs.google.com/document/u/1/d/e/2PACX-1vQXqRRpBkB-7HqwLd2XtsWVDLjCUnBUIeNQADb56FuKHdj_IF9wbmsl4G7RLxR2_yKYMhnSO1M-X39H/pub"
                          target="_blank"
                          rel="noreferrer"
                          style={{ cursor: 'pointer' }}
                          className="text-gray-400 hover:text-gray-500 no-underline"
                        >
                          Terms & Conditions
                        </a>
                      </div>
                    </div>
                  </Menu.Items>
                </Transition>
              </div>
            </Portal>
          </>
        )}
      </Menu>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-fit transform overflow-hidden rounded-2xl bg-white p-3 text-left align-middle shadow-xl transition-all">
                  <div className="flex flex-row items-center mx-2 my-1">
                    <Loader className="h-5 w-5 text-purple-500" />
                    <p className="text-xs text-gray-400 ml-3 animate-pulse uppercase font-medium">
                      Loading ACCOUNT
                    </p>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default UserMenu;
