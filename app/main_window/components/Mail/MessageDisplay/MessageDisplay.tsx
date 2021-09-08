import { ipcRenderer } from 'electron';
import React, { useState } from 'react';
import { createPortal } from 'react-dom'
import { useDispatch } from 'react-redux';

// EXTERNAL LIBRAIRIES
import Highlighter from 'react-highlight-words';
import { Whisper, Tooltip, Avatar, Loader } from 'rsuite';
import ReactHtmlParser, {
  processNodes,
  convertNodeToElement,
  htmlparser2
} from 'react-html-parser';
import { Scrollbars } from 'react-custom-scrollbars';

// ICONS
import { Forward, Reply, ReplyAll } from './customSVGs';

// DATE UTILITIES
import {
  formatFullDate,
  formatTimeOnly,
  formatDateDisplay
} from '../../../utils/date.util';

import stringToHslColor from '../../../utils/avatar.util';

// COMPONENTS
import Attachments from '../../../../composer_window/components/Attachments/Attachments';

// STYLES
// import styles from './MessageDisplay.less';

// REDUX ACTIONS
import {
  replyMessage,
  forwardMessage
} from '../../../actions/mailbox/messages';

// TYPESCRIPT TYPES
import {
  MailMessageType,
  MailboxType,
  FolderType
} from '../../../reducers/types';

type Props = {
  message: MailMessageType;
  folders: FolderType;
  mailbox: MailboxType;
  loading: boolean;
  highlight: string;
};

function MessageDisplay(props: Props) {
  const {
    message: {
      id,
      folderId,
      subject,
      fromJSON,
      toJSON,
      ccJSON,
      bccJSON,
      date,
      bodyAsHtml,
      bodyAsText,
      attachments
    },
    highlight,
    mailbox,
    message
  } = props;

  const [loaded, setLoaded] = useState(false);
  const dispatch = useDispatch();

  let files = [];

  if (typeof attachments === 'string') {
    files = JSON.parse(attachments);
  } else {
    files = attachments;
  }

  const senderEmail = JSON.parse(fromJSON)[0].address;

  const senderInNetwork = senderEmail.endsWith('@telios.io');

  const parsedSender = JSON.parse(fromJSON)[0].name || senderEmail;

  const senderArr = parsedSender.split(' ');

  let senderInitials = null;

  if (senderArr.length > 1) {
    senderInitials = `${senderArr[0][0]}${senderArr[1][0]}`.toUpperCase();
  } else {
    // eslint-disable-next-line prefer-destructuring
    senderInitials = senderArr[0][0].toUpperCase();
  }

  const parsedRecipientTo = JSON.parse(toJSON).reduce(function (
    previous: string,
    current: { name: string; address: string }
  ) {
    if (current.name) {
      return `${previous} ${current.name} <${current.address}>;`;
    }
    return `${previous} ${current.address}; `;
  },
    'To: ');

  const parsedRecipientCC = JSON.parse(ccJSON).reduce(function (
    previous: string,
    current: { name: string; address: string }
  ) {
    if (current.name) {
      return `${previous} ${current.name} <${current.address}>;`;
    }
    return `${previous} ${current.address}; `;
  },
    'Cc: ');

  const formattedDate = formatFullDate(date);
  const time = formatTimeOnly(date);

  const renderHTML = html => {
    const output = ReactHtmlParser(html, {
      transform: (node, index) => {
        if (highlight && node.data) {
          return (
            <Highlighter
              highlightClassName="bg-yellow-300"
              searchWords={highlight.split(' ')}
              autoEscape
              textToHighlight={node.data}
            />
          );
        }
      }
    });

    return output;
  };

  const reply = async () => {
    dispatch(replyMessage(false));
    await ipcRenderer.invoke('ingestDraftForInlineComposer', {
      mailbox,
      message,
      editorAction: 'reply'
    });
  };

  const replyAll = async () => {
    dispatch(replyMessage(true));
    await ipcRenderer.invoke('ingestDraftForInlineComposer', {
      mailbox,
      message,
      editorAction: 'replyAll'
    });
  };

  const forward = async () => {
    dispatch(forwardMessage());
    await ipcRenderer.invoke('ingestDraftForInlineComposer', {
      mailbox,
      message,
      editorAction: 'forward'
    });
  };

  const IFrame = ({ children, ...props }) => {
    const [contentRef, setContentRef] = useState(null);
    const [height, setHeight] = useState('');
    const mountNode = contentRef?.contentWindow?.document?.body;

    const onLoad = () => {
      setHeight(contentRef?.contentWindow?.document?.body?.scrollHeight + 20 + "px");
      setLoaded(true);
    };

    setTimeout(() => {
      onLoad();
    })

    return (
      <iframe
        {...props}
        ref={setContentRef}
        onLoad={onLoad}
        height={height}
        id="email-body"
        scrolling="no"
        frameBorder="0"
      >
        {mountNode && createPortal(children, mountNode)}
        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" />
      </iframe>
    );
  }

  var divStyle = {
    fontFamily: 'Arial, sans-serif',
    WebkitFontSmoothing: 'antialiased',
    fontSize: '16px',
    color: '#575757',
    lineHeight: '1.42857143'
  };

  return (
    <div className="w-full flex flex-col h-full pt-2">
      <div className="flex flex-row justify-between items-center px-6">
        <div className="font-bold text-gray-700 text-base select-none">
          <span>{subject}</span>
        </div>
        <div
          style={{ cursor: 'pointer' }}
          className="flex flex-row text-2xl ml-6 text-gray-500 justify-center items-center"
        >
          <Whisper
            placement="bottom"
            trigger="hover"
            delay={1000}
            speaker={<Tooltip>Reply</Tooltip>}
          >
            <Reply
              onClick={reply}
              className="h-9 w-9 p-2 rounded hover:bg-gray-100 text-gray-500"
            />
          </Whisper>

          <Whisper
            placement="bottom"
            trigger="hover"
            delay={1000}
            speaker={<Tooltip>Reply All</Tooltip>}
          >
            <ReplyAll
              onClick={replyAll}
              className="h-9 w-9  p-2 rounded hover:bg-gray-100 text-gray-500"
            />
          </Whisper>

          <Whisper
            placement="bottom"
            trigger="hover"
            delay={1000}
            speaker={<Tooltip>Forward</Tooltip>}
          >
            <Forward
              onClick={forward}
              className="h-9 w-9 p-2 rounded hover:bg-gray-100 text-gray-500"
            />
          </Whisper>
        </div>
      </div>
      <div className="border-b pt-3 pb-6 flex flex-row items-center px-6">
        <Avatar
          size="md"
          className="font-bold"
          style={{
            backgroundColor: stringToHslColor(parsedSender, 45, 65)
          }}
          circle
        >
          {senderInitials}
        </Avatar>
        <div className="flex-auto pl-4 select-none">
          <div className="flex flex-row justify-between">
            <div className="text-md font-bold">{parsedSender}</div>
            <div className="text-sm text-gray-500 align-baseline items-baseline">{`${formattedDate} at ${time}`}</div>
          </div>
          <div className="text-md text-gray-400">{parsedRecipientTo}</div>
          {ccJSON !== '[]' && (
            <div className="text-md text-gray-400">{parsedRecipientCC}</div>
          )}
        </div>
      </div>
      {attachments && attachments.length > 0 && (
        <div className="px-6">
          <Attachments attachments={attachments} displayStatus="recipient" />
        </div>
      )}
      <div className="flex flex-1 w-full h-full relative">
        <div className="h-full flex-grow">
          <Scrollbars hideTracksWhenNotNeeded autoHide>
            <div className="h-full">
              <div className="px-6 mb-6 mt-4 h-full">
                <IFrame className="w-full">
                  <div style={divStyle}>
                    {renderHTML(bodyAsHtml)}
                  </div>
                </IFrame>
              </div>
            </div>
          </Scrollbars>
        </div>
      </div>
    </div>
  );
}

export default MessageDisplay;
