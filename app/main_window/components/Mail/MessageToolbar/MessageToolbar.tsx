import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

// EXTERNAL COMPONENT LIBRARIES
import { Whisper, Tooltip, Dropdown, Alert } from 'rsuite';

// ICONSET ICONS
import {
  BsTrash,
  BsFolderSymlink,
  BsArrowRepeat,
  BsFolder
} from 'react-icons/bs';

import {
  Delete,
  Folder,
  Danger,
  Message,
  CloseSquare,
  ArrowUpSquare
} from 'react-iconly';

// Typescript Types
import { MailType, Email } from '../../../reducers/types';

// REDUX ACTIONS
import { moveMessagesToFolder } from '../../../actions/mailbox/folders';
import { loadMailboxes } from '../../../actions/mail';

import {
  clearActiveMessage,
  markAsUnread
} from '../../../actions/mailbox/messages';

// SERVICE FUNCTIONS
import Mail from '../../../../services/mail.service';

// INTERNATIONALIZATION
import i18n from '../../../../i18n/i18n';

type Props = {
  loading: boolean;
  selected: {
    startIdx: number | null;
    endIdx: number | null;
    exclude: Array<number>;
    items: Array<number>;
  };
  panelSize: number;
  composerControls: boolean;
  messages: MailType;
  folders: MailType;
  currentFolderId: number;
  activeMessage: Email;
  onRefreshMail: (full: any) => Promise<void>;
  onSelectAction: (action: string) => void;
  onComposerClose: (opts: any) => void;
  onComposerMaximize: () => void;
  // onClearSelected: () => void;
};

export default function MessageToolbar(props: Props) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const {
    onRefreshMail,
    panelSize,
    composerControls,
    loading,
    selected,
    messages,
    folders,
    currentFolderId,
    activeMessage,
    onSelectAction,
    onComposerClose,
    onComposerMaximize
  } = props;

  // List of folders to which selection cannot be moved
  const unmoveableToFolder = [
    'Screened',
    'Reply Later',
    'Drafts',
    'Sent',
    'Trash'
  ];

  // Determines is buttons are actionnable
  const isActionDisabled = !(
    selected.items.length >= 0 && messages.allIds.length > 0
  );

  const isMoveDisabled =
    isActionDisabled ||
    (currentFolderId === 1 &&
      folders.allIds.length === unmoveableToFolder.length + 1);

  // Dictionary of Icon Components used in this function
  const Icon = {
    trash: Delete,
    move: Folder,
    spam: Danger,
    unread: Message,
    sync: BsArrowRepeat,
    folder: BsFolder,
    window: ArrowUpSquare,
    closeout: CloseSquare
  };

  const showComposerControls =
    (composerControls || currentFolderId === 3) && selected.items.length <= 1;
  // Buttons positioning
  const displacement = showComposerControls ? `${panelSize}px` : '0px';

  // msgId for drafts
  const msgId = activeMessage ? activeMessage.id : null;
  // Permanently delete messages from trash folder
  const deleteMessages = async () => {
    const messagesToDelete = [];

    selected.items.forEach(msgIdx => {
      const messageId = messages.allIds[msgIdx];

      messagesToDelete.push(messageId);
    });

    // NEED TO REWRITE THIS USING REDUX PATTERNS - THIS IS AN ANTI PATTERN
    // Right now we are reloading all of the messages and folders instead.
    await Mail.removeMessages(messagesToDelete);
    dispatch(clearActiveMessage(currentFolderId));
    dispatch(loadMailboxes({ fullSync: false }));
  };

  const deleteDraftMessage = async (id: string) => {
    // NEED TO REWRITE THIS USING REDUX PATTERNS
    await Mail.removeMessages([id]);
    dispatch(clearActiveMessage(currentFolderId));
    dispatch(loadMailboxes({ fullSync: false }));
    onComposerClose({ action: 'delete' });
  };

  // Handles Selection Movements including routing deletes
  const moveToFolder = async (toId: number, name: string) => {
    setIsLoading(true);
    try {
      if ((currentFolderId === 5 && toId === 5) || currentFolderId === 3) {
        await deleteMessages();
        Alert.success(`Deleted ${selected.items.length} message(s).`);
      } else {
        const messagesToMove = [];

        selected.items.forEach(msgIdx => {
          const messageId = messages.allIds[msgIdx];
          const message = messages.byId[messageId];

          messagesToMove.push({
            id: message.id,
            unread: message.unread,
            folder: {
              fromId: currentFolderId,
              toId,
              name
            }
          });
        });
        await dispatch(moveMessagesToFolder(messagesToMove));

        Alert.success(`Moved ${selected.items.length} message(s) to ${name}.`);
      }
      onSelectAction('none');
    } catch (err) {
      console.log(err);
    }

    setIsLoading(false);
  };

  const unread = async () => {
    selected.items.forEach(msgIdx => {
      const messageId = messages.allIds[msgIdx];
      const message = messages.byId[messageId];
      // Trigger if not already unread.
      if (!message.unread) {
        dispatch(markAsUnread(messageId, currentFolderId));
      }
    });
  };

  // MOVE ACTION DROPDOWN
  const MoveDropdown = ({ ...props }) => (
    <Dropdown {...props} className="flex">
      {folders.allIds.map((fId: number) => {
        const folder = folders.byId[fId];

        if (!unmoveableToFolder.includes(folder.name) && folder.id !== currentFolderId) {
          const IconTag = Icon.folder;
          return (
            <Dropdown.Item
              key={folder.id}
              onClick={() => {
                moveToFolder(folder.id, folder.name);
              }}
            >
              {/* <IconTag className="text-base" /> */}
              <div className="text-sm">{folder.name}</div>
            </Dropdown.Item>
          );
        }
      })}
    </Dropdown>
  );

  const CustomButton = (bprops: React.PropsWithChildren<ButtonProps>) => {
    const {
      children,
      onClick,
      className,
      icon,
      disabled,
      spinIcon,
      tpPlacement,
      tpTrigger,
      tpText,
      set
    } = bprops;

    const IconTag = Icon[icon];

    return (
      <Whisper
        placement={tpPlacement}
        trigger={tpTrigger}
        delay={1000}
        speaker={<Tooltip>{tpText}</Tooltip>}
      >
        <button
          className={`disabled:opacity-50 ${disabled ? 'cursor-not-allowed' : 'hover:bg-gray-200 cursor-pointer'
            }  text-gray-500 rounded p-2 focus:outline-none  ${className} justify-center items-center tracking-wide flex flex-row h-full`}
          type="button"
          onClick={onClick}
          disabled={disabled}
        >
          <span className="text-base">
            {/* The use of set isn't ideal here but untilall icons are from the same set... */}
            {set === 'iconly' && (
              <IconTag
                className={`${spinIcon ? 'animate-spin' : ''}`}
                set="broken" // this prop only applies on iconly icons
                size="small" // this prop only applies on iconly icons
              />
            )}
            {set === 'bs' && (
              <IconTag className={`${spinIcon ? 'animate-spin' : ''}`} />
            )}
          </span>
          {/* <BsTrash className="text-lg" /> */}
          <span className="ml-2 text-sm">{children}</span>
        </button>
      </Whisper>
    );
  };

  return (
    <div
      className="h-14 flex flex-row p-2 select-none"
      style={{ marginLeft: displacement }}
    >
      {!showComposerControls && (
        <>
          <CustomButton
            onClick={() => {
              moveToFolder(5, 'Trash');
            }}
            icon="trash"
            disabled={isActionDisabled}
            className="mr-1"
            tpPlacement="bottom"
            tpTrigger="hover"
            tpText="Delete Selection"
            set="iconly"
          >
            Delete
          </CustomButton>

          {currentFolderId !== 3 && currentFolderId !== 4 && (
            <MoveDropdown
              disabled={isMoveDisabled}
              renderTitle={() => {
                return (
                  <CustomButton
                    icon="move"
                    disabled={isMoveDisabled}
                    className="mr-1"
                    tpPlacement="bottom"
                    tpTrigger="hover"
                    tpText="Move Selection"
                    set="iconly"
                  >
                    Move
                  </CustomButton>
                );
              }}
            />
          )}

          {currentFolderId !== 3 && currentFolderId !== 4 && (
            <CustomButton
              onClick={() => {
                unread();
              }}
              icon="unread"
              disabled={isActionDisabled}
              className="mr-1"
              tpPlacement="bottom"
              tpTrigger="hover"
              tpText="Change Status to Unread"
              set="iconly"
            >
              Mark Unread
            </CustomButton>
          )}

          <CustomButton
            onClick={onRefreshMail}
            icon="sync"
            spinIcon={loading || isLoading}
            className=""
            tpPlacement="bottom"
            tpTrigger="hover"
            tpText="Manually Check for Updates"
            set="bs"
          >
            Sync
          </CustomButton>
        </>
      )}
      {showComposerControls && (
        <>
          <CustomButton
            onClick={() => onComposerClose({ action: 'save' })}
            icon="closeout"
            className="mr-1"
            tpPlacement="bottom"
            tpTrigger="hover"
            tpText="Save & Close Draft"
            set="iconly"
          >
            Save & Close
          </CustomButton>

          <CustomButton
            onClick={onComposerMaximize}
            icon="window"
            className="mr-1"
            tpPlacement="bottom"
            tpTrigger="hover"
            tpText="Pop Window Out"
            set="iconly"
          >
            Pop Out
          </CustomButton>

          <CustomButton
            onClick={() => {
              deleteDraftMessage(msgId);
            }}
            icon="trash"
            className=""
            tpPlacement="bottom"
            tpTrigger="hover"
            tpText="Discard Draft"
            set="iconly"
          >
            Discard
          </CustomButton>
        </>
      )}
    </div>
  );
}

type ButtonProps = {
  onClick?: (full?: any) => void | Promise<void>;
  className?: string;
  icon: 'trash' | 'move' | 'sync' | 'spam' | 'unread' | 'closeout' | 'window';
  spinIcon?: boolean;
  disabled?: boolean;
  tpPlacement:
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'topStart'
  | 'topEnd'
  | 'bottomStart'
  | 'bottomEnd'
  | 'leftStart'
  | 'leftEnd'
  | 'rightEnd'
  | 'rightStart';
  tpTrigger: 'click' | 'hover' | 'focus' | 'active' | 'none';
  tpText: string;
  set: 'iconly' | 'bs';
};
