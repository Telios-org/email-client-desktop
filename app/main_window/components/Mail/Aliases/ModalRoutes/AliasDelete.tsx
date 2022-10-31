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

// INTERNAL LIBRAIRIES
import useForm from '../../../../../utils/hooks/useForm';
import { validateString } from '../../../../../utils/helpers/regex';

// SELECTORS
import { selectAllNamespaces } from '../../../../selectors/mail';

// REDUX ACTION
import { removeAlias } from '../../../../actions/mailbox/aliases';

// INTERNAL COMPONENTS
import { Button } from '../../../../../global_components/button';

type Props = {
  close: (isSuccess: boolean, message: string) => void;
  domain: string;
  aliasId: string;
};

const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

const AliasDelete = forwardRef((props: Props, ref) => {
  const { close, domain, aliasId } = props;
  const dispatch = useDispatch();
  const namespaces = useSelector(selectAllNamespaces);
  const [loading, setLoader] = useState(false);
  const aliasData = useSelector(state => state.mail.aliases.byId);
  const [deleteObj, setDeleteObj] = useState({});

  const handleDeleteAlias = async () => {
    const payload = {
      namespaceName: deleteObj.namespaceKey,
      domain,
      address: deleteObj.name
    };
    setLoader(true);
    await dispatch(removeAlias(payload));
    setLoader(false);
    close(true, 'Alias Deleted!');
  };

  useEffect(() => {
    const a = aliasData[aliasId];
    setDeleteObj(a);
  }, [aliasId]);

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
            Bye Bye Bye - Alias
          </Dialog.Title>
          <div className="mt-2 text-sm text-gray-500">
            <p className="leading-relaxed">
              <b>
                {` ${
                  deleteObj?.namespaceKey === null
                    ? ''
                    : `${deleteObj?.namespaceKey}+`
                }`}
                <span className="text-purple-600">{deleteObj?.name}</span>
                {`@${domain} `}
              </b>
              will be removed from your list of aliases and its incoming traffic
              blocked.
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
            onClick={handleDeleteAlias}
          >
            Delete
          </Button>
        </div>
      </div>
    </Dialog.Panel>
  );
});

AliasDelete.displayName = 'AliasDelete';

export default AliasDelete;
