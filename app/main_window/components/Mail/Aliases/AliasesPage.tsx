import React, { useState, Fragment, forwardRef } from 'react';
import { useDispatch } from 'react-redux';

// EXTERNAL LIBRARIES
import { XIcon } from '@heroicons/react/outline';
import { Dialog, Transition } from '@headlessui/react';

// INTERNAL LIBRARIES
import Notification from '../../Global/Notification';
import NamespaceRegistration from './Routes/NamespaceRegistration';
import AliasManagement from './Routes/AliasManagement';
import AliasRegistration from './Routes/AliasRegistration';
import AliasEdit from './Routes/AliasEdit';

// ACTION CREATORS
import { setActivePage } from '../../../actions/global';

const envAPI = require('../../../../env_api.json');

const params = window.location.search.replace('?', '');
const env = params.split('=')[1];
const mailDomain = env === 'production' ? envAPI.prodMail : envAPI.devMail;

const AliasesPage = () => {
  const dispatch = useDispatch();
  const [modal, setModal] = useState('');
  const [selectedAlias, setAliasSelection] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [saveSucceeded, setSaveSucceeded] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = (isSuccess: boolean, message: string) => {
    setIsOpen(false);

    if (isSuccess) {
      setSaveSucceeded(true);
      setNotifMessage(message);
      setShowNotification(true);
    }
  };

  const openModal = (route: string) => {
    setModal(route);
    setIsOpen(true);
  };

  const handleClose = () => {
    dispatch(setActivePage('mail'));
  };

  return (
    <div className="relative h-full w-full flex bg-white">
      <div className="max-w-5xl mx-auto flex flex-1 flex-col pt-6 pb-4">
        <div className="flex flex-row justify-between w-full">
          <div className="">
            <h2 className="text-lg font-medium text-gray-900 leading-6">
              Alias Management
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Protect your privacy with your aliases
            </p>
          </div>
          <div
            className="relative flex flex-col text-center text-sm text-gray-300 hover:text-gray-400 font-medium group outline-none"
            style={{ cursor: 'pointer' }}
          >
            <span
              className="bg-gray-100 rounded-full p-2 mb-1 group-hover:bg-gray-200 outline-none"
              role="button"
              tabIndex={0}
              onClick={handleClose}
            >
              <XIcon className="w-6 h-6" aria-hidden="true" />
            </span>
            <span className="absolute -bottom-4 hidden group-hover:block">
              Close
            </span>
          </div>
        </div>
        <div className="py-2 flex flex-col grow relative">
          <AliasManagement openModalRoute={openModal} />
          <Transition appear show={isOpen} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-10"
              onClose={() => closeModal(false, '')}
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
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    {/* <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        Payment successful
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Your payment has been successfully submitted. We’ve
                          sent you an email with all of the details of your
                          order.
                        </p>
                      </div>

                      <div className="mt-4">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={closeModal}
                        >
                          Got it, thanks!
                        </button>
                      </div>
                    </Dialog.Panel> */}
                    <NamespaceRegistration
                      close={closeModal}
                      domain={mailDomain}
                    />
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
          {/* {route === 'nsRegistration' && <NamespaceRegistration />}
          {route === 'alsManagement' && <AliasManagement />}
          {route === 'alsRegistration' && <AliasRegistration />}
          {route === 'alsEdit' && <AliasEdit />} */}
        </div>
      </div>
      <Notification
        show={showNotification}
        setShow={setShowNotification}
        success={saveSucceeded}
        successMsg={notifMessage}
        errorMsg="Something went wrong!"
      />
    </div>
  );
};

export default AliasesPage;
