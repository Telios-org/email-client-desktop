import React from 'react';

// SVG LOGO
import teliosLogoSVG from '../../../../../resources/img/telios_logo.svg';

// TYPESCRIPT TYPES
import {
  MailMessageType,
  Email,
  MailboxType,
  MailType
} from '../../../reducers/types';

// COMPONENTS
import MessageDisplay from './MessageDisplay';
import Composer from '../../../../composer_window/components/Composer';
import { Mailbox } from '../../../../models/mailbox.model';

type Props = {
  showComposerInline: boolean;
  message: Email | { id: null };
  loading: boolean;
  activeFolderId: number;
  highlight: string;
  mailbox: MailboxType;
  folders: MailType;
  selectedItems: number[];
  onComposerClose: (opts: any) => void;
  onComposerMaximize: () => void;
};

function MessageDisplayRouter(props: Props) {
  const {
    showComposerInline,
    message,
    loading,
    activeFolderId,
    mailbox,
    folders,
    selectedItems,
    onComposerClose,
    onComposerMaximize,
    highlight
  } = props;

  const showMessage =
    message.id !== null &&
    activeFolderId !== 4 &&
    !showComposerInline &&
    selectedItems.length === 1;

  const showComposer =
    ((message.id && activeFolderId === 4) || showComposerInline) &&
    selectedItems.length <= 1;

  const activeFolder = folders.byId[activeFolderId];

  console.log(selectedItems, showComposer, message, activeFolderId, showComposerInline, 'DISPLAY ROUTER');

  return (
    <>
      {(message.id === null || selectedItems.length > 1) && !showComposer && (
        <div className="flex flex-1 items-center flex-col justify-center pb-16">
          <img
            className="opacity-5 w-40 h-40"
            src={teliosLogoSVG}
            alt="Telios Logo"
          />
          {selectedItems.length > 1 && (
            <div className="text-lg mt-2">
              You have
{' '}
              <span className="text-purple-600 text-bold">
                {selectedItems.length}
              </span>
{' '}
              emails selected.
            </div>
          )}
        </div>
      )}
      {showMessage && (
        <MessageDisplay
          mailbox={mailbox}
          highlight={highlight}
          folders={folders}
          message={message}
          loading={loading}
        />
      )}
      {showComposer && (
        <Composer
          onClose={onComposerClose}
          onMaximize={onComposerMaximize}
          folder={activeFolder}
          mailbox={mailbox}
          message={message}
          isInline
        />
      )}
    </>
  );
}

export default MessageDisplayRouter;
