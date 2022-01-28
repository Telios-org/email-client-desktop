import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// EXTERNAL LIBRARIES
import { Badge, Avatar } from 'rsuite';
import { DragPreviewImage, useDrag, useDragLayer } from 'react-dnd';
// import {CustomDragLayer} from './CustomDragLayer';

// CSS/LESS STYLES
import styles from './MessagePreview.css';

// BASE64 IMAGE
import { envelope } from '../../envelope';

// REDUX STATE SELECTORS
import {
  selectActiveFolder,
  activeFolderId,
  selectMessageByIndex,
  activeMessageId as activeMsgId,
  activeMessageSelectedRange,
  selectActiveAliasName,
  activeAliasId,
  currentMessageList
} from '../../../../selectors/mail';

// REDUX ACTIONS
import { msgRangeSelection } from '../../../../actions/mail';

// TYPESCRIPT TYPES
import { MailMessageType } from '../../../../reducers/types';

// COMPONENTS
import PreviewIconBar from './PreviewIconBar';

// UTILS
import peopleHeaderParser from '../../../../../utils/contact.util';
import stringToHslColor from '../../../../../utils/avatar.util';

const { formatDateDisplay } = require('../../../../../utils/helpers/date');

type Props = {
  onMsgClick: (message: MailMessageType, id: number) => void;
  index: number;
  onDropResult: (item: any, dropResult: any) => void;
  previewStyle: any;
};

export default function MessagePreview(props: Props) {
  const currentFolder = useSelector(selectActiveFolder);
  const currentAliasName = useSelector(selectActiveAliasName);
  const { onMsgClick, onDropResult, index, previewStyle } = props;

  const dispatch = useDispatch();

  const [isHover, setIsHover] = useState(false);
  const [isRead, setIsRead] = useState(false);

  const messages = useSelector(currentMessageList);
  const currentFolderId = useSelector(activeFolderId);
  const currentAliasId = useSelector(activeAliasId);
  const selected = useSelector(activeMessageSelectedRange);
  const message = useSelector(state => selectMessageByIndex(state, index));

  const {
    emailId,
    aliasId,
    folderId,
    subject,
    fromJSON,
    toJSON,
    date,
    bodyAsText,
    attachments,
    unread
  } = message;
  const activeMessageId = useSelector(activeMsgId);
  const isActive =
  emailId === activeMessageId || selected.items.indexOf(message.emailId) > -1;

  const [{ opacity }, drag, preview] = useDrag({
    item: { emailId, unread, folderId, type: 'message', aliasId },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        onDropResult(item, dropResult);
      }
    },
    collect: monitor => ({
      opacity: monitor.isDragging() ? 0.8 : 1
    })
  });

  let files = [];

  if (typeof attachments === 'string') {
    files = JSON.parse(attachments);
  } else {
    files = attachments;
  }

  // We don't want to display the same people whether its incoming or outgoing;
  const direction =
    currentFolder.name === 'Sent' || currentFolder.name === 'Drafts'
      ? 'outgoing'
      : 'incoming';

  const { previewHead, sender } = peopleHeaderParser(
    toJSON,
    fromJSON,
    undefined,
    undefined,
    direction
  );

  const parsedSender = sender.name;
  // Checking if Sender is in the Telios Network
  const senderInNetwork = sender.inNetwork;

  const parsedDate = formatDateDisplay(date);

  // Determines if the platform specific toggle selection in group key was used
  const wasToggleInSelectionGroupKeyUsed = (
    event: MouseEvent | KeyboardEvent
  ) => {
    const isUsingWindows = navigator.platform.indexOf('Win') >= 0;
    return isUsingWindows ? event.ctrlKey : event.metaKey;
  };

  const handleMouseEnter = () => {
    setIsHover(true);
  };

  const handleMouseLeave = () => {
    setIsHover(false);
  };

  const handleUpdateSelectedRange = userSelected => {
    const newSelection = { ...userSelected };
    const newLoaders: any[] = [];

    if (
      !newSelection.startIdx &&
      !newSelection.endIdx &&
      !newSelection.items.length
    ) {
      newSelection.items = [];
    }

    if (newSelection.endIdx !== null) {
      messages.allIds.forEach((msg, index) => {
        if (index === newSelection.startIdx && index === newSelection.endIdx) {
          newSelection.items.push(msg);
          newLoaders.push(msg.emailId);
        }

        if (
          index >= newSelection.startIdx &&
          newSelection.startIdx < newSelection.endIdx &&
          index <= newSelection.endIdx &&
          newSelection.startIdx < newSelection.endIdx &&
          newSelection.exclude.indexOf(index) === -1
        ) {
          newSelection.items.push(msg);
          newLoaders.push(msg.emailId);
        }

        if (
          index <= newSelection.startIdx &&
          newSelection.startIdx > newSelection.endIdx &&
          index >= newSelection.endIdx &&
          newSelection.startIdx > newSelection.endIdx &&
          newSelection.exclude.indexOf(index) === -1
        ) {
          newSelection.items.push(msg);
          newLoaders.push(msg);
        }
      });
    }

    // remove duplicated entry
    newSelection.items = [...new Set(newSelection.items)];

    dispatch(msgRangeSelection(newSelection, currentFolderId));
  };

  const handleClick = event => {
    event.preventDefault();
    setIsHover(true);
    setIsRead(true);

    const selection = { ...selected };

    // Exclude items from range that were selected while holding down
    // the ctrl/cmd key. Re-selecting an unchecked item while holding
    // down these keys will re-select it.
    if (wasToggleInSelectionGroupKeyUsed(event)) {
      const itemIdx = selection.exclude.indexOf(index);

      if (itemIdx === -1 && selection.items.indexOf(index) > -1) {
        if (selection.startIdx !== null && selection.endIdx !== null) {
          selection.exclude.push(index);
        }
        selection.items = selection.items.filter(item => item !== index);
        return handleUpdateSelectedRange(selection);
      }

      if (itemIdx === -1 && selection.items.indexOf(index) === -1) {
        selection.items.push(index);
        return handleUpdateSelectedRange(selection);
      }

      if (selection.exclude[itemIdx] === index) {
        if (selection.startIdx !== null && selection.endIdx !== null) {
          selection.exclude = selection.exclude.filter(item => item !== index);
        }
        selection.items.push(index);
        return handleUpdateSelectedRange(selection);
      }

      return true;
    }

    // Selecting an item in range will deselect from group. Selecting a deselected
    // item in range will add remove it from exclusion
    if (event.shiftKey) {
      if (
        selection.exclude.length > 0 &&
        selection.exclude.indexOf(index) > -1
      ) {
        selection.exclude.filter(item => item !== index);
      }

      if (
        selection.exclude.length > 0 &&
        selection.exclude.indexOf(index) > -1
      ) {
        selection.exclude.filter(item => item !== index);
      }

      // If a start index has already been set, then add
      // the end index
      if (
        selection.startIdx !== null &&
        selection.startIdx !== index &&
        selection.endIdx !== index
      ) {
        selection.endIdx = index;
      }

      handleUpdateSelectedRange(selection);
    } else {
      // Regular click without holding shift or ctrl/cmd
      // will reset selection and select a single item.
      onMsgClick(message, index);
    }
  };

  return (
    <div>
      {currentFolder?.name && (
        <div className="overflow-hidden" style={previewStyle}>
          <DragPreviewImage connect={preview} src={envelope} />
          <div
            ref={currentFolder.name !== 'Drafts' ? drag : null}
            role="option"
            onClick={handleClick}
            tabIndex="0"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`text-sm cursor-pointer text-trueGray-900
          ${styles.row} flex items-stretch outline-none
          border-b
          h-full
          mr-0.5
          overflow-hidden
          ${isActive ? 'bg-blue-50' : 'hover:bg-coolGray-50'}`}
          >
            <div className="flex justify-center w-6 shrink-0 items-center pt-0.5">
              {unread === 1 && !isRead && direction === 'incoming' && (
                <Badge className="bg-purple-600" />
              )}
            </div>
            <div className="pt-3 mr-3">
              <Avatar
                size="md"
                className="font-bold"
                style={{
                  backgroundColor: stringToHslColor(parsedSender, 45, 65)
                }}
                circle
              >
                {sender.avatarInitials}
              </Avatar>
            </div>

            <div className="flex-auto flex-col py-2 pr-3 leading-tight">
              <div className="flex-row flex pb-1 font-medium">
                <div
                  id="sender"
                  className="flex-auto leading-tight line-clamp-1 break-all font-bold overflow-hidden"
                >
                  {previewHead}
                </div>

                <div className="ml-2 text-xs font-bold flex self-end text-trueGray-500">
                  {parsedDate}
                </div>
              </div>

              <div
                id="subject"
                className={`flex flex-1 flex-row justify-between ${
                  unread === 1 && !isRead ? 'text-purple-600 font-bold' : ''
                }`}
              >
                <div className="flex flex-1 leading-tight overflow-hidden text-sm break-all line-clamp-1">
                  {subject}
                </div>
                <div id="actions" className="flex flex-row">
                  {/* creating a little space between subject and icons on hover */}
                  {isHover && <div className="w-4" />}
                  <PreviewIconBar
                    attachment={files && files.length > 0}
                    isInNetwork={senderInNetwork}
                    isHover={isHover}
                    messageId={emailId}
                    activeFolderId={currentFolder.folderId}
                  />
                </div>
              </div>

              <div
                id="preview"
                className="leading-normal overflow-hidden text-xs text-gray-600 break-all line-clamp-1"
              >
                {bodyAsText}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
