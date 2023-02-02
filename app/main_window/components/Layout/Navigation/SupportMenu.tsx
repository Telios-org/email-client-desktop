import React, { useState, useEffect, Fragment } from 'react';
import { useSelector } from 'react-redux';

// EXTERNAL LIBRAIRIES
import { usePopper } from 'react-popper';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { Portal } from 'react-portal';
import { QuestionMarkCircleIcon } from '@heroicons/react/outline';

// import { BigHead } from '@bigheads/core';


// STATE SELECTORS
import { selectActiveMailbox } from '../../../selectors/mail';

const SupportMenu = (props: Props) => {
  // Loading Modal State
  const [isOpen, setIsOpen] = useState(false);
  const closeModal = () => {
    setIsOpen(false);
  };
  const openModal = () => {
    setIsOpen(true);
  };

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

  return (
    <>
      <Menu as="div" className="relative  select-none">
        {({ open }) => (
          <>
            <div
              ref={setTargetElement}
              className="rounded-full shadow z-50 relative select-none"
              style={{ cursor: 'pointer' }}
            >
              <Menu.Button
                className={`max-w-xs flex items-center rounded-full text-sm focus:outline-none select-none relative${
                  open ? 'ring-2 ring-offset-2 ring-white' : ''
                } `}
              >
                <QuestionMarkCircleIcon className="h-5 w-5 text-white" />
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
                    className="w-36 bg-white border border-gray-200 divide-y divide-gray-200 rounded-md shadow-lg outline-none"
                  >
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
                            } flex select-none items-center justify-between w-full px-4 py-2 text-sm leading-5 text-left hover:no-underline font-normal`}
                          >
                            <span>Release Notes</span>
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="https://teliostech.atlassian.net/servicedesk/customer/portal/1/group/10/create/36"
                            target="_blank"
                            rel="noreferrer"
                            style={{ cursor: 'pointer' }}
                            className={`${
                              active
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-700'
                            } flex items-center select-none justify-between w-full px-4 py-2 text-sm leading-5 text-left hover:no-underline font-normal`}
                          >
                            <span>Support</span>
                          </a>
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
    </>
  );
};

export default SupportMenu;
