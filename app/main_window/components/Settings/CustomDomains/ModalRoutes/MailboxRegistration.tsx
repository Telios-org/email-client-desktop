import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// EXTERNAL LIBRARIES
import { Dialog } from '@headlessui/react';
import { AtSymbolIcon, InboxIcon } from '@heroicons/react/outline';
import { generateSlug } from 'random-word-slugs';

// INTERNAL COMPONENT
import { Button } from '../../../../../global_components/button';

// SELECTORS

// REDUX ACTION
import { registerNamespace } from '../../../../actions/mailbox/aliases';

import i18n from '../../../../../i18n/i18n';

import { validateString } from '../../../../../utils/helpers/regex';

type Props = {
  close: (isSuccess: boolean, message: string, show?: boolean) => void;
};

const MailboxRegistration = forwardRef((props: Props, ref) => {
  const { close } = props;
  const dispatch = useDispatch();
  const [mailbox, setMailbox] = useState('');
  const [loading, setLoader] = useState(false);
  const [error, setError] = useState({
    showError: false,
    msg: ''
  });

  return (
    <Dialog.Panel
      ref={ref}
      className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all"
    >
      <Dialog.Title
        as="h3"
        className="text-base font-medium leading-6 text-gray-900 flex flex-row mb-4 pt-6 px-6 items-center"
      >
        <InboxIcon
          className="w-5 h-5 text-purple-500 mr-2"
          aria-hidden="true"
        />
        Add New Mailbox
      </Dialog.Title>
      <div className="px-6">
       
      </div>
      <div className="flex justify-end py-3 bg-gray-50 text-right px-6 border-t border-gray-300 mt-14">
        <div className="flex flex-row space-x-2">
          <Button type="button" variant="outline" className="pt-2 pb-2">
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="pt-2 pb-2 whitespace-nowrap"
          >
            Add Mailbox
          </Button>
        </div>
      </div>
    </Dialog.Panel>
  );
});

MailboxRegistration.displayName = 'MailboxRegistration';

export default MailboxRegistration;
