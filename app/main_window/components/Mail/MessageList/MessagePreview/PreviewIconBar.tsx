import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

// EXTERNAL LIBRAIRIES
import { Tooltip, Whisper, Alert } from 'rsuite';

// INCONSET ICONS
import { AiOutlinePaperClip } from 'react-icons/ai';
import { Lock, Delete, Danger } from 'react-iconly';

// REDUX ACTIONS
import { clearActiveMessage, moveMessagesToFolder } from '../../../../actions/mailbox/messages';
import { loadMailboxes } from '../../../../actions/mail';

// REDUX STATE SELECTORS
import { selectActiveFolder } from '../../../../selectors/mail';

// SERVICE FUNCTIONS
import Mail from '../../../../../services/mail.service';

type Props = {
  isHover: boolean;
  isInNetwork: boolean;
  attachment: boolean;
  messageId: number;
  activeFolderId: number;
};

function PreviewIconBar(props: Props) {
  const currentFolder = useSelector(selectActiveFolder);
  const dispatch = useDispatch();
  const { attachment, isInNetwork, isHover, messageId, activeFolderId } = props;

  // Permanently delete messages from trash folder
  const deleteMessage = async () => {
    const messageTodelete = [messageId];
    // NEED TO REWRITE THIS USING REDUX PATTERNS
    await Mail.removeMessages(messageTodelete);
    await dispatch(clearActiveMessage(activeFolderId));
    dispatch(loadMailboxes());
  };

  // Handles Selection Movements including routing deletes
  const moveToFolder = async (toId: number, name: string) => {
    try {
      if ((currentFolder.name === 'Trash') || currentFolder.name === 'Drafts') {
        await deleteMessage();
        Alert.success(`Deleted 1 message.`);
      } else {
        const messagesToMove = [
          {
            id: messageId,
            unread: 0,
            folder: {
              fromId: activeFolderId,
              toId,
              name
            }
          }
        ];

        await dispatch(moveMessagesToFolder(messagesToMove));

        Alert.success(`Moved 1 message to ${name}.`);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-row leading-tight">
      {attachment && !isHover && (
        <AiOutlinePaperClip
          className="text-trueGray-500 text-sm"
          style={{ width: '1.25em', height: '1.25em' }}
        />
      )}
      {isInNetwork && !isHover && (
        <Lock
          set="broken"
          style={{ width: '1.25em', height: '1.25em' }}
          className="ml-0.5 text-trueGray-500"
        />
      )}
      {isHover && (
        <>
          <Whisper
            trigger="hover"
            placement="bottom"
            delay={1000}
            speaker={<Tooltip>Delete</Tooltip>}
          >
            <Delete
              set="broken"
              style={{ width: '1.25em', height: '1.25em', cursor: 'pointer' }}
              className="ml-0.5 text-trueGray-500 hover:text-trueGray-700"
              onClick={() => moveToFolder(4, 'Trash')}
            />
          </Whisper>
        </>
      )}
    </div>
  );
}

export default PreviewIconBar;
