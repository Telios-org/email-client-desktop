import { ipcRenderer, remote } from 'electron';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DebounceInput } from 'react-debounce-input';
import { Notification, Divider } from 'rsuite';

import { topicReference } from '@babel/types';
import { useHandler } from '../utils/hooks/useHandler';
import { Editor, MessageInputs, TopBar, Attachments } from './components';

import { recipientTransform, emailTransform } from './utils/draft.utils';

import { ISOtimestamp } from '../main_window/utils/date.util';
// import editorHTMLexport from './utils/messageEditor/htmlExportOptions';

import ComposerService from '../services/composer.service';

// TYPESCRIPT TYPES
import {
  Email,
  AttachmentType,
  Recipients,
  FolderType,
  MailboxType,
  MailMessageType
} from '../main_window/reducers/types';

import { EditorIframeRef } from './components/editor/types';

const clone = require('rfdc')();
const htmlToText = require('html-to-text');

const emailTemplate = {
  emailId: null,
  headers: [],
  subject: '',
  date: '',
  to: [],
  cc: [],
  bcc: [],
  from: [],
  toJSON: JSON.stringify([]),
  fromJSON: JSON.stringify([]),
  ccJSON: JSON.stringify([]),
  bccJSON: JSON.stringify([]),
  bodyAsText: '',
  bodyAsHtml: '',
  attachments: []
};

const prefillRecipientsTemplate = {
  to: {
    arr: []
  },
  cc: {
    show: false,
    arr: []
  },
  bcc: {
    show: false,
    arr: []
  }
};

const mailboxTemplate = {
  address: '',
  folders: [],
  id: null,
  name: ''
};

type Props = {
  onClose: (options: { action: string }) => void;
  onMaximmize: () => void;
  isInline: boolean;
  folder: FolderType;
  mailbox: MailboxType;
  message: MailMessageType;
};

const Composer = (props: Props) => {
  const {
    isInline,
    onClose,
    onMaximmize,
    folder,
    message,
    mailbox: mb
  } = props;

  const editorRef = useRef<EditorIframeRef>(null);
  const skipNextInputRef = useRef(false);
  // When a draft is already open we need a way to tell the Editor the content has change
  // Therefore we're checking to see if the id has changed and if it has it will trigger
  // the useEffect that sets the editorRef content.
  const prevMsgIdRef = useRef(message?.emailId ?? null);
  const [activeSendButton, setActiveSendButton] = useState(false);
  const [email, setEmail] = useState<Email | null>(null);
  const [mailbox, setMailbox] = useState<MailboxType>(mb ?? mailboxTemplate);
  const [prefillRecipients, setPrefillRecipients] = useState(
    prefillRecipientsTemplate
  );
  const [editorReady, setEditorReady] = useState(false);
  const [composerReady, setComposerReady] = useState(false);
  const [editorState, setEditorState] = useState<string | undefined>();
  const [windowId, setWindowId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Using a callback Ref to get to the To field to be able to control focus.
  const [toRef, setToRef] = useState();

  const handleEmailUpdate = (
    msg?: Email,
    content?: string,
    mbox?: MailboxType
  ) => {
    const draft = msg ?? email;
    const htmlBody = content ?? editorState;
    const owner = mbox ?? mailbox;

    // Getting timestamp for email
    const time = ISOtimestamp();
    // Getting the plain text off the htmlBody
    const plaintext = htmlToText.fromString(htmlBody);

    const eml = {
      ...clone(draft),
      date: time,
      from: [
        {
          address: owner.address,
          name: owner.name ? owner.name : owner.address
        }
      ],
      fromJSON: JSON.stringify(draft?.from),
      toJSON: JSON.stringify(draft?.to),
      ccJSON: JSON.stringify(draft?.cc),
      bccJSON: JSON.stringify(draft?.bcc),
      bodyAsText: plaintext,
      bodyAsHtml: htmlBody
    };

    if (htmlBody !== editorState) {
      setEditorState(htmlBody);
    }
    setEmail(eml);
    ipcRenderer.send('RENDERER::updateComposerDraft', eml);
  };

  // When in the Draft folder and Inline, message is set through the Selector
  useEffect(() => {
    if (isInline && message?.bodyAsHtml && folder?.name === 'Drafts') {
      const draft = emailTransform(message, 'draftEdit', false);
      const rcp = recipientTransform(mb, draft, 'draftEdit');
      draft.to = rcp.data.to;
      draft.cc = rcp.data.cc;
      draft.bcc = rcp.data.bcc;
      draft.from = rcp.data.from;
      handleEmailUpdate(draft, draft.bodyAsHtml || '', mb);
      setMailbox(mb);
      setPrefillRecipients(rcp.ui);
      if (draft.to.length > 0) {
        setActiveSendButton(true);
      }

      if (prevMsgIdRef.current !== draft.emailId) {
        // console.log('PREV EMAIL GUARD', message);
        prevMsgIdRef.current = draft.emailId;
      }
    }
  }, [isInline, folder, message?.bodyAsHtml, message?.emailId]);

  // When not in the draft folder, and replying, forwarding or popping out the message
  // We get the draft email from the IPC Draft storage that was initialized by 'RENDERER::ingestDraftForInlineComposer' or 'RENDERER::showComposerWindow'
  // In another electron window, the redux store is unavailable
  useEffect(() => {
    if (folder?.name !== 'Drafts') {
      ipcRenderer.on('WINDOW_IPC::contentReady', (event, content, windowID) => {
        // console.log('IPC event handler', content, windowID);
        // The email has already been formatted according to the editorAction
        // it happened in the Window IPC.
        const draft = clone(content.message);
        const rcp = recipientTransform(
          content.mailbox,
          draft,
          content.editorAction
        );
        draft.to = rcp.data.to;
        draft.cc = rcp.data.cc;
        draft.bcc = rcp.data.bcc;
        draft.from = rcp.data.from;

        handleEmailUpdate(draft, draft.bodyAsHtml, content.mailbox);
        setMailbox(content.mailbox);
        setPrefillRecipients(rcp.ui);
        setWindowId(windowID);

        if (draft.to.length > 0) {
          setActiveSendButton(true);
        }
      });
    }

    return () => {
      ipcRenderer.removeAllListeners('WINDOW_IPC::contentReady');
    };
  }, [folder]);

  // The below is to handle when the popOut window is closing.
  useEffect(() => {
    if (!isInline) {
      remote.getCurrentWindow().on('close', () => {
        // console.log('CLOSING WINDOWS');
        //   this.updateEmail('close');
      });
    }
    return () => {
      remote.getCurrentWindow().removeAllListeners('close');
    };
  }, [isInline]);

  useEffect(() => {
    if (editorState !== undefined && !composerReady && email !== null) {
      console.log(editorState);
      setComposerReady(true);
    }
    // console.log('EditorState?', editorState);
  }, [editorState, email]);

  useEffect(() => {
    // console.log('ALL READY?', composerReady, editorReady, prevMsgIdRef.current);
    if (
      editorReady &&
      composerReady &&
      editorRef.current &&
      editorState !== undefined
    ) {
      skipNextInputRef.current = true;
      editorRef.current.value = ` </br> ${editorState}`;

      if (email.to.length === 0 && toRef) {
        toRef.focus();
      } else {
        editorRef.current.focus();
      }
    }
  }, [editorReady, composerReady, prevMsgIdRef.current]);

  const onUpdateRecipients = useHandler(
    (recipients: Recipients, updateState = true) => {
      let toArr = [];
      let ccArr = [];
      let bccArr = [];

      if (recipients.to.arr.length > 0) {
        setActiveSendButton(true);
        toArr = recipients.to.arr
          .filter(eml => eml.isValid || eml.preFill)
          .map(eml => {
            return { address: eml.value, name: eml.label };
          });
      } else {
        setActiveSendButton(false);
      }

      if (recipients.cc.arr.length > 0) {
        ccArr = recipients.cc.arr
          .filter(eml => eml.isValid || eml.preFill)
          .map(eml => {
            return { address: eml.value, name: eml.label };
          });
      }

      if (recipients.bcc.arr.length > 0) {
        bccArr = recipients.bcc.arr
          .filter(eml => eml.isValid || eml.preFill)
          .map(eml => {
            return { address: eml.value, name: eml.label };
          });
      }

      const draft = {
        ...email,
        to: toArr,
        cc: ccArr,
        bcc: bccArr,
        from: [
          {
            address: mailbox.address,
            name: mailbox.name ? mailbox.name : mailbox.address
          }
        ]
      };

      handleEmailUpdate(draft, undefined, undefined);
    },
    { debounce: 250 }
  );

  const onSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    const newEmail = clone(email);
    newEmail.subject = value;

    handleEmailUpdate(newEmail);
  };

  const handleEditorReady = useCallback(() => setEditorReady(true), []);

  const onAttachmentChange = (newArray: AttachmentType[]) => {
    const newEmail = {
      ...email,
      attachments: [...newArray]
    };

    handleEmailUpdate(newEmail);
  };

  const handleInputChange = useHandler(
    (content: string) => {
      if (skipNextInputRef.current) {
        skipNextInputRef.current = false;
        return;
      }
      handleEmailUpdate(undefined, content, undefined);
    },
    { debounce: 250 }
  );

  const openDialog = async () => {
    let attachments = [];

    try {
      const newAttachments = await ComposerService.uploadAttachments();
      if (email && email.attachments) {
        attachments = [...email.attachments, ...newAttachments];
      } else {
        attachments = [...newAttachments];
      }

      const draft = clone(email);
      draft.attachments = attachments;

      handleEmailUpdate(draft);
    } catch (err) {
      console.log(err);
    }
  };

  const sendEmail = async () => {
    setLoading(true);
    handleEmailUpdate();
    setTimeout(async () => {
      try {
        await ComposerService.send(email, isInline);

        setLoading(false);

        Notification.success({
          title: 'Email Sent',
          placement: 'bottomEnd'
        });

        if (isInline) {
          onClose({ action: 'send' });
        } else {
          remote.getCurrentWindow().close();
        }
      } catch (err) {
        setLoading(false);
        console.error('FAILED TO SEND', err);

        Notification.error({
          title: 'Failed to Send',
          placement: 'bottomEnd'
        });
      }
    });
  };

  return (
    <div className="h-full w-full flex flex-col text-sm">
      {!isInline && (
        <div>
          <div className="w-full h-10 bg-darkPurple flex">
            <TopBar />
          </div>
          <div className="w-full bg-gradient-to-r from-blue-400 to-purple-700 h-1" />
        </div>
      )}
      <MessageInputs
        onUpdateRecipients={onUpdateRecipients}
        defaultRecipients={prefillRecipients}
        setToRef={node => {
          setToRef(node);
        }}
      />
      <div className="px-3">
        <div className="flex">
          <div className="w-16 text-gray-600 p-2 self-center">Subject</div>
          <div className="flex w-full">
            <DebounceInput
              className="pl-1 focus:outline-none w-full py-2 text-gray-800 bg-transparent"
              minLength={1}
              value={email?.subject ?? ''}
              debounceTimeout={250}
              type="text"
              data-name="subject"
              onChange={onSubjectChange}
            />
          </div>
        </div>
      </div>
      <Divider style={{ margin: '0px' }} />
      <Attachments
        attachments={email && email.attachments ? email.attachments : []}
        displayStatus="editor"
        onAttachmentChange={onAttachmentChange}
      />
      <div className="flex flex-1 w-full flex-col">
        <div className="flex-grow bg-white flex justify-between">
          <Editor
            ref={editorRef}
            className="border-gray-500 w-full h-full"
            toolbarClassName=""
            editorClassName=""
            isSendActive={activeSendButton}
            onInput={handleInputChange}
            onReady={handleEditorReady}
            onSend={sendEmail}
            loading={loading}
            onAttachment={openDialog}
          />
        </div>
        {/* <div className="flex bg-red-800 h-12"></div> */}
      </div>
    </div>
  );
};

export default Composer;
