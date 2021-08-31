import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  ButtonToolbar,
  IconButton,
  Whisper,
  Tooltip,
  Dropdown,
  Icon,
  Alert
} from 'rsuite';
import {
  FaRegSquare,
  FaMinusSquare,
  FaCheckSquare,
  FaTrash
} from 'react-icons/fa';
import { AiOutlineSync, AiOutlineCaretDown } from 'react-icons/ai';

import { RiFolderReceivedFill } from 'react-icons/ri';
import {
  MessageType,
  MailMessageType,
  FolderType
} from '../../../reducers/types';

import { moveMessagesToFolder, loadMailboxes } from '../../../actions/mail';
import Mail from '../../../../services/mail.service';

import i18n from '../../../../i18n/i18n';

type Props = {
  loading: boolean;
  selected: {
    items: [];
  };
  messages: MessageType;
  folders: FolderType;
  currentFolderId: number;
  onRefreshMail: () => void;
  onSelectAction: (action: string) => void;
  onClearSelected: () => void;
};

export default function MessageListToolbar(props: Props) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const {
    onRefreshMail,
    loading,
    selected,
    messages,
    folders,
    currentFolderId,
    onSelectAction
  } = props;

  // Permanently delete messages from trash folder
  const deleteMessages = async () => {
    const messagesToDelete = [];

    selected.items.forEach(msgIdx => {
      const messageId = messages.allIds[msgIdx];

      messagesToDelete.push(messageId);
    });

    await Mail.removeMessages(messagesToDelete);
    dispatch(loadMailboxes({ fullSync: false }));
  };

  const moveToFolder = async (toId: number, name: string) => {
    setIsLoading(true);
    try {
      if ((currentFolderId === 7 && toId === 7) || currentFolderId === 4) {
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

  const SelectDropdown = ({ ...props }) => (
    <Dropdown {...props}>
      <Dropdown.Item key="all" onClick={() => onSelectAction('all')}>
        <span>All</span>
      </Dropdown.Item>
      <Dropdown.Item key="none" onClick={() => onSelectAction('none')}>
        <span>None</span>
      </Dropdown.Item>
    </Dropdown>
  );

  const MoveDropdown = ({ ...props }) => (
    <Dropdown {...props}>
      {folders.allIds.map((fId: number) => {
        const folder = folders.byId[fId];
        if (
          folder.name !== 'Screened' &&
          folder.name !== 'Reply Later' &&
          folder.name !== 'Drafts' &&
          folder.name !== 'Sent' &&
          folder.name !== 'Spam' &&
          folder.name !== 'Trash' &&
          folder.id !== currentFolderId
        ) {
          return (
            <Dropdown.Item
              key={folder.id}
              onClick={() => {
                moveToFolder(folder.id, folder.name);
              }}
            >
              <Icon icon="folder-o" />
              <span>{folder.name}</span>
            </Dropdown.Item>
          );
        }
      })}
    </Dropdown>
  );

  return (
    <div style={{ height: '64px' }} className="flex items-center pl-2 justify-between">
      <div className="flex justify-between ml-4 font-medium tracking-wider">
        <div className="flex mt-2 mr-2 cursor-pointer">
          <Whisper
            placement="top"
            trigger="hover"
            speaker={<Tooltip>Select</Tooltip>}
          >
            <div>
              {selected.items.length === 0 && messages.allIds.length > 0 && (
                <FaRegSquare
                  onClick={() => onSelectAction('all')}
                  className="mr-1 text-xl text-blue-500"
                />
              )}

              {selected.items.length > 0 &&
                selected.items.length < messages.allIds.length && (
                  <FaMinusSquare
                    onClick={() => onSelectAction('none')}
                    className="mr-1 text-xl text-blue-500"
                  />
                )}

              {selected.items.length > 0 &&
                selected.items.length === messages.allIds.length && (
                  <FaCheckSquare
                    onClick={() => onSelectAction('none')}
                    className="mr-1 text-xl text-blue-500"
                  />
                )}
            </div>
          </Whisper>

          {selected.items.length >= 0 && messages.allIds.length > 0 && (
            <Whisper
              placement="top"
              trigger="hover"
              speaker={<Tooltip>Select actions</Tooltip>}
            >
              <SelectDropdown
                renderTitle={() => {
                  return (
                    <AiOutlineCaretDown className="mt-1 text-sm text-blue-500" />
                  );
                }}
              />
            </Whisper>
          )}
        </div>
        {selected.items.length > 0 && messages.allIds.length > 0 && (
          <ButtonToolbar>
            {currentFolderId !== 4 && (
              <Whisper
                placement="top"
                trigger="hover"
                speaker={<Tooltip>Move</Tooltip>}
              >
                <MoveDropdown
                  renderTitle={() => {
                    return (
                      <IconButton
                        circle
                        appearance="subtle"
                        icon={
                          <RiFolderReceivedFill className="text-xl text-blue-500" />
                        }
                      />
                    );
                  }}
                />
              </Whisper>
            )}
            <Whisper
              placement="top"
              trigger="hover"
              speaker={<Tooltip>Delete</Tooltip>}
            >
              <IconButton
                circle
                appearance="subtle"
                onClick={() => {
                  moveToFolder(6, 'Trash');
                }}
                icon={<FaTrash className="text-lg text-blue-500" />}
              />
            </Whisper>
          </ButtonToolbar>
        )}
      </div>
      <div style={{ cursor: 'pointer' }}>
        <AiOutlineSync
          onClick={onRefreshMail}
          className={`text-2xl cursor-pointer mr-4 ${
            loading || isLoading ? 'animate-spin' : ''
          }`}
        />
      </div>
    </div>
  );
}
