/* This example requires Tailwind CSS v2.0+ */
import React, { Fragment, useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, ExclamationIcon } from '@heroicons/react/solid';
import { XIcon } from '@heroicons/react/solid';

type Props = {
  show: boolean;
  setShow: (val) => void;
  success: boolean;
  successMsg: string;
  errorMsg: string;
};

const Notification = (props: Props) => {
  const { show, setShow, success, successMsg, errorMsg } = props;

  useEffect(() => {
    let timeout = null;
    if (show) {
      timeout = setTimeout(() => {
        setShow(false);
      }, 5000);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [show]);

  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="fixed inset-0 flex items-end px-4 p-14 pointer-events-none sm:items-start"
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={show}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start">
                  {success && (
                    <>
                      <div className="flex-shrink-0">
                        <CheckCircleIcon
                          className="h-6 w-6 text-green-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-900">
                          {successMsg}
                        </p>
                      </div>
                    </>
                  )}
                  {!success && (
                    <>
                      <div className="flex-shrink-0">
                        <ExclamationIcon
                          className="h-6 w-6 text-red-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-900">
                          {errorMsg}
                        </p>
                      </div>
                    </>
                  )}
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      type="button"
                      className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      onClick={() => {
                        setShow(false);
                      }}
                    >
                      <span className="sr-only">Close</span>
                      <XIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
};

export default Notification;
