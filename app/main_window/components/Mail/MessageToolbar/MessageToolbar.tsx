import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

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

// REDUX ACTIONS
import { moveMessagesToFolder } from '../../../actions/mailbox/messages';
import { loadMailboxes, msgRangeSelection } from '../../../actions/mail';

import {
  clearActiveMessage,
  markAsUnread
} from '../../../actions/mailbox/messages';

// SELECTORS
import {
  activeMessageSelectedRange,
  selectAllFolders,
  activeMessageObject,
  activeFolderId
} from '../../../selectors/mail';

// SERVICE FUNCTIONS
import Mail from '../../../../services/mail.service';

// INTERNATIONALIZATION
import i18n from '../../../../i18n/i18n';

type Props = {
  loading: boolean;
  panelSize: number;
  onRefreshMail: (full: any) => Promise<void>;
  // onSelectAction: (action: string, allMsgIds: [String]) => void;
  onComposerClose: (opts: any) => void;
  onComposerMaximize: () => void;
};

export default function MessageToolbar(props: Props) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const {
    onRefreshMail,
    panelSize,
    loading,
    onComposerClose,
    onComposerMaximize
  } = props;

  const editorIsOpen = useSelector(state => state.globalState.editorIsOpen);
  const activeSelectedRange = useSelector(activeMessageSelectedRange);
  const selected = useSelector(activeMessageSelectedRange);
  const messages = useSelector(state => state.mail.messages);
  const folders = useSelector(selectAllFolders);
  const activeMessage = useSelector(activeMessageObject);
  const currentFolderId = useSelector(activeFolderId);

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
    editorIsOpen || (currentFolderId === 2 && selected.items.length === 1);
  // Buttons positioning
  const [displacement, setDisplacement] = useState(
    showComposerControls ? `${panelSize}px` : '0px'
  );

  useEffect(() => {
    setDisplacement(showComposerControls ? `${panelSize}px` : '0px')
  }, [panelSize, showComposerControls]);

  // msgId for drafts
  const msgId = activeMessage ? activeMessage.id : null;
  // Permanently delete messages from trash folder
  const deleteMessages = async () => {
    const messagesToDelete = [];

    selected.items.forEach(msgId => {
      messagesToDelete.push(msgId);
    });

    // NEED TO REWRITE THIS USING REDUX PATTERNS - THIS IS AN ANTI PATTERN
    // Right now we are reloading all of the messages and folders instead.
    await Mail.removeMessages(messagesToDelete);
    dispatch(clearActiveMessage(currentFolderId));
    dispatch(loadMailboxes());
  };

  const deleteDraftMessage = async (id: string) => {
    // NEED TO REWRITE THIS USING REDUX PATTERNS
    await Mail.removeMessages([id]);
    dispatch(clearActiveMessage(currentFolderId));
    dispatch(loadMailboxes());
    onComposerClose({ action: 'delete', reloadDb: true });
  };

  const selectMessageRange = async (
    selected: SelectionRange,
    folderId: number
  ) => {
    dispatch(msgRangeSelection(selected, folderId));
  };

  const handleSelectAction = (action: string, messages: any) => {
    const selected = activeSelectedRange;

    if (action === 'all') {
      messages.forEach((id, index) => {
        selected.items.push(index);
      });
    }

    if (action === 'none') {
      selected.items = [];
      selected.endIdx = null;
      selected.exclude = [];
    }

    selectMessageRange(selected, currentFolderId);
  };

  // Handles Selection Movements including routing deletes
  const moveToFolder = async (toId: number, name: string) => {
    setIsLoading(true);
    try {
      if (currentFolderId === 4 || currentFolderId === 2) {
        await deleteMessages();
        Alert.success(`Deleted ${selected.items.length} message(s).`);
      } else {
        const messagesToMove = [];

        selected.items.forEach(msgId => {
          messagesToMove.push({
            id: msgId,
            emailId: msgId,
            unread: 0,
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
      handleSelectAction('none', messages.allIds);
    } catch (err) {
      console.log(err);
    }

    setIsLoading(false);
  };

  const unread = async () => {
    selected.items.forEach(id => {
      const message = messages.byId[id];
      // Trigger if not already unread.
      if (!message.unread) {
        dispatch(markAsUnread(id, currentFolderId));
      }
    });
  };

  // MOVE ACTION DROPDOWN
  const MoveDropdown = ({ ...props }) => (
    <Dropdown {...props} className="flex">
      {folders.allIds.map((fId: number) => {
        const folder = folders.byId[fId];

        if (
          !unmoveableToFolder.includes(folder.name) &&
          folder.id !== currentFolderId
        ) {
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
          className={`disabled:opacity-50 ${
            disabled ? 'cursor-not-allowed' : 'hover:bg-gray-200 cursor-pointer'
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
              moveToFolder(4, 'Trash');
            }}
            icon="trash"
            disabled={isActionDisabled}
            className="mr-1"
            tpPlacement="bottom"
            tpTrigger="hover"
            tpText="Delete Selection"
            set="iconly"
          >
            {i18n.t('messageToolbar.delete')}
          </CustomButton>

          {/* {currentFolderId !== 3 && currentFolderId !== 4 && (
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
                    {i18n.t('messageToolbar.move')}
                  </CustomButton>
                );
              }}
            />
          )} */}

          {currentFolderId !== 2 && currentFolderId !== 3 && (
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
              {i18n.t('messageToolbar.unreadToggle')}
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
            {i18n.t('messageToolbar.refresh')}
          </CustomButton>
        </>
      )}
      {showComposerControls && (
        <>
          <CustomButton
            onClick={() => onComposerClose({ action: 'save', reloadDb: true })}
            icon="closeout"
            className="mr-1"
            tpPlacement="bottom"
            tpTrigger="hover"
            tpText="Save & Close Draft"
            set="iconly"
          >
            {i18n.t('messageToolbar.saveDraft')}
          </CustomButton>

          <CustomButton
            onClick={onComposerMaximize}
            icon="window"
            className="mr-1"
            tpPlacement="bottom"
            tpTrigger="hover"
            tpText="Open Separate Window"
            set="iconly"
          >
            {i18n.t('messageToolbar.openWindow')}
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
            {i18n.t('messageToolbar.discardDraft')}
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
