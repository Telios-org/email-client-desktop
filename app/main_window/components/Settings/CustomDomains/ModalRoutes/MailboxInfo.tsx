import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  Fragment
} from 'react';
import { useDispatch } from 'react-redux';

// ACTION

// EXTERNAL LIBRARIES
import { Dialog } from '@headlessui/react';
import { InformationCircleIcon } from '@heroicons/react/outline';
import { Show, Hide, Paper } from 'react-iconly';
import { resendMailboxInvite } from '../../../../actions/domains/domains';

// HELPER
import {
  formatDateDisplay,
  formatFullDateTime
} from '../../../../../utils/helpers/date';

// INTERNAL COMPONENTS
import { Button } from '../../../../../global_components/button';

const { ipcRenderer, remote } = require('electron');

const { dialog } = remote;
const fs = require('fs');

type Props = {
  close: (isSuccess: boolean, message: string) => void;
  mailbox: any;
};

const MailboxDelete = forwardRef((props: Props, ref) => {
  const dispatch = useDispatch();
  const { close, mailbox } = props;
  const [hideSecretKey, setHideSecretKey] = useState(true);

  const redactString = (str: string) => {
    const lgth = str?.length ?? 0;
    return 'x'.repeat(lgth + 6);
  };

  const saveKey = async () => {
    // Specify the name of the file to be saved
    const { filePath } = await dialog.showSaveDialog({
      title: `Save ${mailbox.address} Passphrase`,
      defaultPath: `${mailbox.address}-passphrase.txt`,
      filters: [{ name: 'Text file', extensions: ['txt'] }]
    });
    if (mailbox) {
      fs.writeFileSync(filePath, mailbox?.mnemonic, 'utf-8'); // eslint-disable-line
    }
  };

  const resendClaimableInvite = async () => {
    const result = await dispatch(
      resendMailboxInvite({
        addr: mailbox.address,
        password: mailbox.password,
        inviteEmail: mailbox.recoveryEmail
      })
    );

    if (result.success) {
      close(true, 'Invitation Sent!');
    } else {
      close(false, 'Something went wrong!');
    }
  };

  return (
    <Dialog.Panel
      ref={ref}
      className="relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6"
    >
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
          <InformationCircleIcon
            className="h-6 w-6 text-purple-500"
            aria-hidden="true"
          />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <Dialog.Title
            as="h3"
            className="text-lg leading-6 font-medium text-gray-900"
          >
            Mailbox Information
          </Dialog.Title>
          <div className="mt-2 text-gray-500">
            <div
              className="inline-grid grid-cols-[repeat(2,auto)] auto-cols-auto gap-2 pl-2 text-sm"
              style={{ gridTemplateColumns: 'auto 2px!important' }}
            >
              <div className="odd:font-bold odd:text-gray-500 odd:text-right odd:whitespace-nowrap even:max-w-[275px]">
                Creation Date:
              </div>
              <div className="odd:font-bold odd:text-gray-500 odd:text-right odd:whitespace-nowrap even:max-w-[275px]">
                {formatFullDateTime(mailbox.createdAt)}
              </div>
              <div className="odd:font-bold odd:text-gray-500 odd:text-right odd:whitespace-nowra even:max-w-[275px]">
                Address:
              </div>
              <div className="odd:font-bold odd:text-gray-500 odd:text-right odd:whitespace-nowrap even:max-w-[275px]">
                {mailbox.address}
              </div>
              <div className="odd:font-bold odd:text-gray-500 odd:text-right odd:whitespace-nowrap even:max-w-[275px]">
                Domain:
              </div>
              <div className="odd:font-bold odd:text-gray-500 odd:text-right odd:whitespace-nowrap even:max-w-[275px]">
                {mailbox.domainKey}
              </div>
              <div className="odd:font-bold odd:text-gray-500 odd:text-right odd:whitespace-nowrap even:max-w-[275px]">
                Type:
              </div>
              <div className="odd:font-bold odd:text-gray-500 odd:text-right odd:whitespace-nowrap even:max-w-[275px]">
                {mailbox.type === 'SUB' ? 'Sub-Account' : 'Business'}
              </div>
              {mailbox.type === 'CLAIMABLE' && (
                <>
                  <div className="odd:font-bold odd:text-gray-500 odd:text-right odd:whitespace-nowrap even:max-w-[275px]">
                    Invitation Email:
                  </div>
                  <div className="odd:font-bold odd:text-gray-500 odd:text-right odd:whitespace-nowrap even:max-w-[275px]">
                    {mailbox.recoveryEmail}
{' '}
                    <span className="text-xs">
                      {' '}
                      -
{' '}
                      <a
                        onClick={resendClaimableInvite}
                        style={{ cursor: 'pointer' }}
                        className="text-xs"
                      >
                        resend
                      </a>
                    </span>
                  </div>
                </>
              )}
              <div className="odd:font-bold odd:text-gray-500 odd:text-right odd:whitespace-nowrap even:max-w-[275px]">
                Public Key:
              </div>
              <div className="odd:font-bold odd:text-gray-500 odd:text-right odd:whitespace-nowrap even:max-w-[275px] break-words">
                {mailbox.driveSyncingPublicKey}
              </div>
              <div className="odd:font-bold odd:text-gray-500 odd:text-right odd:whitespace-nowrap even:max-w-[275px] flex flex-col">
                <span className="mb-1">Private Key:</span>
                {hideSecretKey && (
                  <Hide
                    size="small"
                    set="broken"
                    onClick={() => setHideSecretKey(false)}
                    className="ml-2 text-gray-400 hover:text-purple-600 self-end"
                    style={{ cursor: 'pointer' }}
                  />
                )}
                {!hideSecretKey && (
                  <Show
                    size="small"
                    set="broken"
                    onClick={() => setHideSecretKey(true)}
                    className="ml-2 text-gray-400 hover:text-purple-600 self-end"
                    style={{ cursor: 'pointer' }}
                  />
                )}
              </div>
              <div className="odd:font-bold odd:text-gray-500 odd:text-right odd:whitespace-nowrap even:max-w-[275px] break-words">
                {hideSecretKey
                  ? redactString(mailbox.driveEncryptionKey)
                  : mailbox.driveEncryptionKey}
              </div>
              {mailbox.type === 'CLAIMABLE' && (
                <>
                  <div className="odd:font-bold odd:text-gray-500 odd:text-right odd:whitespace-nowrap even:max-w-[275px]">
                    Passphrase:
                  </div>
                  <div className="odd:font-bold odd:text-gray-500 odd:text-right odd:whitespace-nowrap even:max-w-[275px]">
                    <a
                      onClick={saveKey}
                      style={{ cursor: 'pointer' }}
                      className="text-xs"
                    >
                      Click to Download
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <div className="flex flex-row space-x-4">
          <Button
            type="button"
            variant="outline"
            className="pt-2 pb-2"
            onClick={() => close(false, '', false)}
          >
            Close
          </Button>
        </div>
      </div>
    </Dialog.Panel>
  );
});

MailboxDelete.displayName = 'MailboxDelete';

export default MailboxDelete;
