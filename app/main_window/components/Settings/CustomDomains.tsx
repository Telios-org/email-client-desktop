import React, { useState, useEffect, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// External Librairies
import { Dialog, Transition } from '@headlessui/react';

// SELECTORS
import { selectActiveMailbox } from '../../selectors/mail';

// ACTION CREATORS

// HELPER HOOKS
import useForm from '../../../utils/hooks/useForm';

// INTERNAL COMPONENTS
import SettingsSection from './shared/SettingsSection';
import DomainManagement from './CustomDomains/DomainManagement';
import Notification from '../../../global_components/Notification';
import DomainRegistration from './CustomDomains/ModalRoutes/DomainRegistration';
import MailboxRegistration from './CustomDomains/ModalRoutes/MailboxRegistration';
import DomainDelete from './CustomDomains/ModalRoutes/DomainDelete';
import { Button } from '../../../global_components/button';
import { Input } from '../../../global_components/input-groups';

const CustomDomains = () => {
  const dispatch = useDispatch();
  const mailbox = useSelector(selectActiveMailbox);
  const account = useSelector(state => state.account);
  const [domainSelection, setDomainSelection] = useState('')
  const [mailboxSelection, setMailboxSelection] = useState('')
  const [modal, setModal] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [saveSucceeded, setSaveSucceeded] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const callToaster = (isSuccess: boolean, message: string) => {
    if (isSuccess) {
      setSaveSucceeded(true);
      setNotifMessage(message);
      setShowNotification(true);
    } else {
      setSaveSucceeded(false);
      setNotifMessage(message);
      setShowNotification(true);
    }
  };

  const closeModal = (isSuccess: boolean, message: string, show = true) => {
    setIsOpen(false);
    if (show) {
      callToaster(isSuccess, message);
    }
  };

  const openModal = (route: string) => {
    setModal(route);
    setIsOpen(true);
  };

  return (
    <>
      <div className="space-y-6 h-full">
        <SettingsSection
          header="Custom Domains"
          description="Using a custom domain with Telios allows you to have a more personalized experience. 
        A custom domain allows you to have multiple mailboxes under one account."
          border={false}
          className="h-full"
          gridClassName="h-full"
        >
          {/* <div className="bg-white py-6 px-7">
            
          </div> */}
          <div className="flex flex-col grow relative h-full p-1">
            <DomainManagement 
              openModalRoute={openModal}
              domainSelection={setDomainSelection}
              mailboxSelection={setMailboxSelection}
              callToaster={callToaster}
            />
            <Transition appear show={isOpen} as={Fragment}>
              <Dialog
                as="div"
                className="relative z-10"
                onClose={() => closeModal(false, '', false)}
              >
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
                    {modal === 'domainRegistration' && (
                      <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                      >
                        <DomainRegistration
                          close={closeModal}
                        />
                      </Transition.Child>
                    )}
                    {modal === 'mailboxRegistration' && (
                      <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                      >
                        <MailboxRegistration
                          close={closeModal}
                        />
                      </Transition.Child>
                    )}
                    {modal === 'domainDelete' && (
                      <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                      >
                        <DomainDelete
                          close={closeModal}
                          domain={domainSelection}
                        />
                      </Transition.Child>
                    )}
                  </div>
                </div>
              </Dialog>
            </Transition>
          </div>
        </SettingsSection>
      </div>
      <Notification
        show={showNotification}
        setShow={setShowNotification}
        success={saveSucceeded}
        successMsg={notifMessage}
        errorMsg="Something went wrong!"
      />
    </>
  );
};

export default CustomDomains;
