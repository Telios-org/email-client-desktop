import React from 'react';
import { useSelector } from 'react-redux';

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

// REDUX STATE SELECTORS
import {
  selectActiveFolder,
  activeFolderId,
  activeMessageObject,
  activeMessageSelectedRange,
  selectActiveMailbox,
  selectAllFolders
} from '../../../selectors/mail';

type Props = {
  loading: boolean;
  highlight: string;
  onComposerClose: (opts: any) => void;
  onComposerMaximize: () => void;
};

function MessageDisplayRouter(props: Props) {
  const currentFolder = useSelector(selectActiveFolder);

  const { loading, onComposerClose, onComposerMaximize, highlight } = props;

  const showComposerInline = useSelector(
    state => state.globalState.editorIsOpen
  );

  const mailbox = useSelector(selectActiveMailbox);
  const folderId = useSelector(activeFolderId);
  const folders = useSelector(selectAllFolders);
  const message = useSelector(activeMessageObject);
  const selectedItems = useSelector(activeMessageSelectedRange).items;

  const showMessage =
    message.id !== null &&
    currentFolder.name !== 'Drafts' &&
    !showComposerInline &&
    selectedItems.length === 1;

  const showComposer =
    ((message.id && currentFolder.name === 'Drafts') || showComposerInline) &&
    selectedItems.length <= 1;

  const activeFolder = folders.byId[folderId];

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
