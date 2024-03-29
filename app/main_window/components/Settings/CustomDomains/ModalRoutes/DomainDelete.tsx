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
import { IFRAME_CLASS } from '../../../../../composer_window/components/editor/editor.config';

// INTERNAL COMPONENTS
import { Button } from '../../../../../global_components/button';

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
    const res = await dispatch(deleteDomain(domain));
    setLoader(false);

    if (!res.success) {
      close(false, res?.status);
    } else {
      close(true, 'Domain Deleted!');
    }
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
              <span className="text-purple-600 font-medium">{domain}</span> and
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
      <div className="mt-4 flex justify-end">
        <div className="flex flex-row space-x-4">
          <Button
            type="button"
            variant="outline"
            className="pt-2 pb-2"
            onClick={() => close(false, '', false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="dangerous"
            className="pt-2 pb-2 whitespace-nowrap"
            loading={loading}
            loadingText="Deleting..."
            onClick={handleDeleteDomain}
          >
            Delete
          </Button>
        </div>
      </div>
    </Dialog.Panel>
  );
});

DomainDelete.displayName = 'DomainDelete';

export default DomainDelete;
