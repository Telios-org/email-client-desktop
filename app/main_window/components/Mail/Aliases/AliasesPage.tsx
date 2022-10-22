import React, { useState, Fragment, forwardRef } from 'react';
import { useDispatch } from 'react-redux';

// EXTERNAL LIBRARIES
import { XIcon } from '@heroicons/react/outline';
import { Dialog, Transition } from '@headlessui/react';

// INTERNAL LIBRARIES
import Notification from '../../../../global_components/Notification';
import NamespaceRegistration from './ModalRoutes/NamespaceRegistration';
import AliasManagement from './ModalRoutes/AliasManagement';
import AliasRegistration from './ModalRoutes/AliasRegistration';
import AliasEdit from './ModalRoutes/AliasEdit';
import AliasDelete from './ModalRoutes/AliasDelete';

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
          <AliasManagement
            openModalRoute={openModal}
            aliasSelection={setAliasSelection}
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
                  {modal === 'nsRegistration' && (
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <NamespaceRegistration
                        close={closeModal}
                        domain={mailDomain}
                      />
                    </Transition.Child>
                  )}
                  {modal === 'aliasRegistration' && (
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <AliasRegistration
                        close={closeModal}
                        domain={mailDomain}
                      />
                    </Transition.Child>
                  )}
                  {modal === 'aliasEdit' && (
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <AliasEdit
                        close={closeModal}
                        domain={mailDomain}
                        aliasId={selectedAlias}
                      />
                    </Transition.Child>
                  )}
                  {modal === 'aliasDelete' && (
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <AliasDelete
                        close={closeModal}
                        domain={mailDomain}
                        aliasId={selectedAlias}
                      />
                    </Transition.Child>
                  )}
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
