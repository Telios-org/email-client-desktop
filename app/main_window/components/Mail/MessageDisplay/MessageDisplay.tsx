import { ipcRenderer } from 'electron';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createPortal } from 'react-dom';
import { debounce } from 'lodash';

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
import { Attachments } from '../../../../composer_window/components';

// STYLES
// import styles from './MessageDisplay.css';

// REDUX ACTIONS
import {
  replyMessage,
  forwardMessage
} from '../../../actions/mailbox/messages';

// REDUX STATE SELECTORS
import { selectActiveMailbox } from '../../../selectors/mail';

// TYPESCRIPT TYPES
import { MailMessageType, MailboxType } from '../../../reducers/types';

type DomElement = htmlparser2.DomElement;

type Props = {
  message: MailMessageType;
  highlight: string;
};

function MessageDisplay(props: Props) {
  const {
    message: {
      subject,
      fromJSON,
      toJSON,
      ccJSON,
      date,
      bodyAsHtml,
      attachments
    },
    highlight,
    message
  } = props;

  const mailbox = useSelector(selectActiveMailbox);
  const [loaded, setLoaded] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (iframeReady && bodyAsHtml) {
      setLoaded(true);
    }
  }, [bodyAsHtml, iframeReady]);

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

  const parsedRecipientTo = JSON.parse(toJSON).reduce(function(
    previous: string,
    current: { name: string; address: string }
  ) {
    if (current.name) {
      return `${previous} ${current.name} <${current.address}>;`;
    }
    return `${previous} ${current.address}; `;
  },
  'To: ');

  const parsedRecipientCC = JSON.parse(ccJSON).reduce(function(
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

  // Prevent white spaces from being included between table tags causing a React warning
  const isDescendantTableTag = (
    parent: Pick<DomElement, 'name'>,
    node: Pick<DomElement, 'name'>
  ): boolean => {
    const descendants: Record<string, string[]> = {
      table: ['colgroup', 'thead', 'tbody'],
      colgroup: ['col'],
      thead: ['tr'],
      tbody: ['tr'],
      tr: ['th', 'td']
    };

    if (!parent.name || !node.name) {
      return false;
    }

    return (descendants[parent.name] || []).indexOf(node.name) >= 0;
  };

  const transform = (node, index) => {
    if (node.type === 'text' && node.parent) {
      let isDescTag;

      if (node.next) {
        isDescTag = isDescendantTableTag(node.parent, node.next);
      }
      if (node.prev) {
        isDescTag = isDescendantTableTag(node.parent, node.prev);
      }

      if (isDescTag) {
        return null;
      }
    }

    if (node.data === ' ') {
      return null;
    }

    if (node.type === 'tag' && node.name === 'a') {
      node.attribs.target = '_blank';
      return convertNodeToElement(node, index, transform);
    }

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
  };

  const renderHTML = html => {
    const output = ReactHtmlParser(html, {
      decodeEntities: true,
      transform
    });

    return output;
  };

  const reply = async () => {
    dispatch(replyMessage(false));
    await ipcRenderer.invoke('RENDERER::ingestDraftForInlineComposer', {
      mailbox,
      message,
      editorAction: 'reply'
    });
  };

  const replyAll = async () => {
    dispatch(replyMessage(true));
    await ipcRenderer.invoke('RENDERER::ingestDraftForInlineComposer', {
      mailbox,
      message,
      editorAction: 'replyAll'
    });
  };

  const forward = async () => {
    dispatch(forwardMessage());
    await ipcRenderer.invoke('RENDERER::ingestDraftForInlineComposer', {
      mailbox,
      message,
      editorAction: 'forward'
    });
  };

  const IFrame = ({ children, ...props }) => {
    const [contentRef, setContentRef] = useState();
    const mountNode = contentRef?.contentWindow?.document?.body;

    const onLoad = () => {
      setIframeReady(true);
    };

    return (
      <iframe
        {...props}
        ref={setContentRef}
        onLoad={onLoad}
        className={props.className}
        id="email-body"
        frameBorder="0"
      >
        {mountNode && createPortal(children, mountNode)}
      </iframe>
    );
  };

  const divStyle = {
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
      {bodyAsHtml && attachments && attachments.length > 0 && (
        <div className="px-6">
          <Attachments attachments={attachments} displayStatus="recipient" />
        </div>
      )}
      <div className="flex flex-1 w-full h-full relative">
        <div className="h-full flex-grow">
          <div className="h-full">
            <div className="mb-2 h-full px-4 pt-4">
              {!loaded && <Loader size="lg" backdrop vertical />}

              <IFrame className="w-full h-full">
                {bodyAsHtml && (
                  <div style={divStyle}>
                    {renderHTML(bodyAsHtml)}
                    <img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" />
                  </div>
                )}
              </IFrame>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageDisplay;
