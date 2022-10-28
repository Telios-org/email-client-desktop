import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  Fragment
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

// EXTERNAL LIBRARIES
import { Dialog } from '@headlessui/react';
import { ExclamationIcon, LightningBoltIcon } from '@heroicons/react/outline';

// REDUX ACTION
import { deleteDomain } from '../../../../actions/domains/domains';

type Props = {
  close: (isSuccess: boolean, message: string) => void;
  domain: string;
};

const DomainDelete = forwardRef((props: Props, ref) => {
  const { close, domain } = props;
  const dispatch = useDispatch();
  const [loading, setLoader] = useState(false);
  const [deleteObj, setDeleteObj] = useState({});

  const handleDeleteDomain = async () => {
    setLoader(true);
    await dispatch(deleteDomain(domain));
    setLoader(false);
    close(true, 'Domain Deleted!');
  };

  return (
    <Dialog.Panel
      ref={ref}
      className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6"
    >
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <ExclamationIcon
            className="h-6 w-6 text-red-600"
            aria-hidden="true"
          />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <Dialog.Title
            as="h3"
            className="text-lg leading-6 font-medium text-gray-900"
          >
            Bye Bye Bye - Domain
          </Dialog.Title>
          <div className="mt-2 text-sm text-gray-500">
            <p className="leading-relaxed">
              Your domain
{' '}
              <span className="text-purple-600 font-medium">{domain}</span>
{' '}
and
              all depending mailboxes will be removed from your account. All
              data will be erased and cannot be recovered.
</p>
            {/* <p className="text-xs">
                You can recreate this alias only through the app (as opposed to
                "on the fly creation").
              </p> */}
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          onClick={handleDeleteDomain}
          className="relative bg-red-600 disabled:from-gray-300 disabled:to-gray-300 border border-transparent rounded-md shadow-sm py-2 px-4 sm:ml-3 sm:w-auto sm:text-sm inline-flex justify-center text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700"
        >
          <span className={`${loading ? 'opacity-0' : 'opacity-100'}`}>
            Delete
          </span>
          <span className={`${loading ? 'visible' : 'invisible'} absolute`}>
            <svg
              className="animate-spin h-5 w-5 text-white"
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
          </span>
        </button>
        <button
          type="button"
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          onClick={() => close(false, '', false)}
        >
          Cancel
        </button>
      </div>
    </Dialog.Panel>
  );
});

DomainDelete.displayName = 'DomainDelete';

export default DomainDelete;
