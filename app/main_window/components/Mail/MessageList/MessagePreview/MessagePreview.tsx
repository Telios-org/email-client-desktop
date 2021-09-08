import React, { useState } from 'react';
import { useSelector } from 'react-redux';

// EXTERNAL LIBRARIES
import { Button, Badge, Icon, Divider, Avatar } from 'rsuite';
import { DragPreviewImage, useDrag, useDragLayer } from 'react-dnd';
// import {CustomDragLayer} from './CustomDragLayer';

// INCONSET ICONS
import { AiOutlinePaperClip } from 'react-icons/ai';

// CSS/LESS STYLES
import styles from './MessagePreview.less';

// BASE64 IMAGE
import { envelope } from '../../envelope';

// REDUX STATE SELECTORS
import { selectActiveFolder } from '../../../../selectors/mail';

// TYPESCRIPT TYPES
import { MailMessageType } from '../../../../reducers/types';

// COMPONENTS
import PreviewIconBar from './PreviewIconBar';

// IMPORT UTILITY FUNCTIONS
const { formatDateDisplay } = require('../../../../utils/date.util');
const stringToHslColor = require('../../../../utils/avatar.util');

type Props = {
  message: MailMessageType;
  isActive: boolean;
  onMsgClick: () => void;
  selected: {};
  index: number;
  onUpdateSelectedRange: () => void;
  onDropResult: () => void;
  previewStyle: any;
};

export default function MessagePreview(props: Props) {
  const currentFolder = useSelector(selectActiveFolder);
  const {
    message,
    message: {
      id,
      folderId,
      subject,
      fromJSON,
      toJSON,
      date,
      bodyAsText,
      attachments,
      unread
    },
    onMsgClick,
    selected,
    onUpdateSelectedRange,
    onDropResult,
    index,
    isActive,
    previewStyle
  } = props;

  const [isHover, setIsHover] = useState(false);

  const [{ opacity }, drag, preview] = useDrag({
    item: { id, unread, folderId, type: 'message' },
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

  let senderInNetwork = false;
  let senderArr = [];

  const senderEmail = JSON.parse(fromJSON)[0].address;

  if (senderEmail) {
    senderInNetwork = senderEmail.indexOf('@telios.io') > -1;
  }

  const parsedSender = JSON.parse(fromJSON)[0].name || senderEmail;

  if (parsedSender) {
    senderArr = parsedSender.split(' ');
  }

  let senderInitials = null;

  if (senderArr.length > 1) {
    senderInitials = `${senderArr[0][0]}${senderArr[1][0]}`.toUpperCase();
  } else {
    // eslint-disable-next-line prefer-destructuring
    senderInitials = senderArr[0][0].toUpperCase();
  }

  const parsedRecipient = JSON.parse(toJSON).reduce(function (
    previous: string,
    current: { name: string; address: string }
  ) {
    const val = current.name || current.address;
    return `${previous + val} `;
  },
    'To: ');
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

  const handleClick = event => {
    event.preventDefault();
    setIsHover(true);

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
        return onUpdateSelectedRange(selection);
      }

      if (itemIdx === -1 && selection.items.indexOf(index) === -1) {
        selection.items.push(index);
        return onUpdateSelectedRange(selection);
      }

      if (selection.exclude[itemIdx] === index) {
        if (selection.startIdx !== null && selection.endIdx !== null) {
          selection.exclude = selection.exclude.filter(item => item !== index);
        }
        selection.items.push(index);
        return onUpdateSelectedRange(selection);
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

      onUpdateSelectedRange(selection);
    } else {
      // Regular click without holding shift or ctrl/cmd
      // will reset selection and select a single item.
      onMsgClick(message, index);
    }
  };

  return (
    <div>
      {currentFolder && currentFolder.name && (
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
            <div className="flex justify-center w-6 flex-shrink-0 items-center pt-0.5">
              {unread === 1 &&
                currentFolder.name !== 'Sent' &&
                currentFolder.name !== 'Drafts' && (
                  <Badge className="bg-purple-600" />
                )}
            </div>
            <div className="pt-3 mr-3">
              <Avatar
                size="sm"
                className="font-bold"
                style={{
                  backgroundColor: stringToHslColor(parsedSender, 45, 65)
                }}
                circle
              >
                {senderInitials}
              </Avatar>
            </div>

            <div className="flex-auto flex-col py-2 pr-3 leading-tight">
              <div className="flex-row flex pb-1 font-medium">
                <div
                  id="sender"
                  className="flex-auto leading-tight line-clamp-1 break-all font-bold"
                >
                  {currentFolder.name === 'Sent'
                    ? parsedRecipient
                    : parsedSender}
                </div>

                <div className="ml-2 text-xs font-bold flex self-end text-trueGray-500">{parsedDate}</div>
              </div>

              <div
                id="subject"
                className={`flex flex-1 flex-row justify-between ${unread === 1 ? 'text-purple-600 font-bold' : ''
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
                    messageId={id}
                    activeFolderId={currentFolder.id}
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
