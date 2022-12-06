import { ipcRenderer, remote } from 'electron';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DebounceInput } from 'react-debounce-input';
import { Notification, Divider } from 'rsuite';
import { useDispatch } from 'react-redux';

import { topicReference } from '@babel/types';
import { useHandler } from '../utils/hooks/useHandler';
import { Editor, MessageInputs, TopBar, Attachments } from './components';

import {
  recipientTransform,
  emailTransform,
  assembleFromDataSet
} from '../utils/draft.utils';

import { UTCtimestamp } from '../utils/helpers/date';
// import editorHTMLexport from './utils/messageEditor/htmlExportOptions';

import ComposerService from '../services/composer.service';

import { fetchMsg } from '../main_window/actions/mail';

// TYPESCRIPT TYPES
import {
  Email,
  AttachmentType,
  Recipients,
  FolderType,
  MailboxType,
  MailMessageType,
  MailType
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
  namespaces: MailType;
  aliases: MailType;
  message: MailMessageType;
};

const Composer = (props: Props) => {
  const {
    isInline,
    onClose,
    onMaximmize,
    folder,
    message,
    mailbox: mb,
    namespaces,
    aliases
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
  const [fromAddress, setFromAddress] = useState<
    | {
        address: string;
        name: string;
      }[]
    | null
  >(null);
  const [fromDataSet, setFromDataSet] = useState<
    { address: string; name: string }[]
  >([]);

  const [editorReady, setEditorReady] = useState(false);
  const [composerReady, setComposerReady] = useState(false);
  const [editorState, setEditorState] = useState<string | undefined>();
  const [windowId, setWindowId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Using a callback Ref to get to the To field to be able to control focus.
  const [toRef, setToRef] = useState();

  let dispatch = null;
  if (isInline) {
    dispatch = useDispatch();
  }

  const handleEmailUpdate = (
    msg?: Email,
    content?: string,
    mbox?: MailboxType
  ) => {
    const draft = msg ?? email;
    const htmlBody = content ?? editorState;
    const owner = mbox ?? mailbox;


    // Getting timestamp for email
    const time = UTCtimestamp().toString();
    // Getting the plain text off the htmlBody
    const plaintext = htmlToText.fromString(htmlBody);


    const from = draft?.from ?? [
      {
        address: owner.address,
        name: owner.name ? owner.name : owner.address
      }
    ];

    const eml = {
      ...clone(draft),
      date: time,
      from,
      fromJSON: JSON.stringify(draft?.from),
      toJSON: JSON.stringify(draft?.to),
      ccJSON: JSON.stringify(draft?.cc),
      bccJSON: JSON.stringify(draft?.bcc),
      bodyAsText: plaintext,
      bodyAsHtml: htmlBody
    };

    console.log(eml);

    if (htmlBody !== editorState) {
      setEditorState(htmlBody);
    }
    setEmail(eml);
    ipcRenderer.send('RENDERER::updateComposerDraft', eml);
  };

  // When in the Draft folder and Inline, message is set through the Selector
  useEffect(() => {
    if (
      isInline &&
      folder?.name === 'Drafts' &&
      dispatch !== null &&
      message.emailId !== null
    ) {
      dispatch(fetchMsg(message.emailId))
        .then(email => {
          const draft = emailTransform(email, 'draftEdit', false);
          const rcp = recipientTransform(mb, draft, 'draftEdit');
          draft.to = rcp.data.to;
          draft.cc = rcp.data.cc;
          draft.bcc = rcp.data.bcc;
          draft.from = JSON.parse(email.fromJSON);
          handleEmailUpdate(draft, draft.bodyAsHtml || '', mb);
          setMailbox(mb);

          const data = assembleFromDataSet(mb, namespaces, aliases);

          console.log(data);

          if (draft.from.length === 1) {
            setFromAddress(draft.from);
            const isInSet =
              data.filter(d => d.address === draft.from[0]?.address).length > 0;

            if (!isInSet) {
              data.push(draft.from[0]);
            }
          } else {
            setFromAddress([data[0]]);
          }

          setFromDataSet(data);

          setPrefillRecipients(rcp.ui);
          if (draft.to.length > 0) {
            setActiveSendButton(true);
          }

          if (prevMsgIdRef.current !== draft.emailId) {
            prevMsgIdRef.current = draft.emailId;
          }
        })
        .catch(err => {
          console.error(err);
          Notification.error({
            title: 'Failed to load',
            placement: 'bottomEnd'
          });
        });
    } else if (
      isInline &&
      folder?.name === 'Drafts' &&
      message.emailId === null
    ) {
      const data = assembleFromDataSet(mb, namespaces, aliases);
      setFromAddress([data[0]]);
      setFromDataSet(data);
    }
  }, [isInline, folder, message?.bodyAsHtml, message?.emailId]);

  // When not in the draft folder, and replying, forwarding or popping out the message
  // We get the draft email from the IPC Draft storage that was initialized by 'RENDERER::ingestDraftForInlineComposer' or 'RENDERER::showComposerWindow'
  // In another electron window, the redux store is unavailable
  useEffect(() => {
    if (folder?.name !== 'Drafts' || (folder?.name === 'Drafts' && !isInline)) {
      ipcRenderer.on('WINDOW_IPC::contentReady', (event, content, windowID) => {
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
        draft.from =
          windowID === 'mainWindow'
            ? rcp.data.from
            : JSON.parse(draft.fromJSON);

        const data = assembleFromDataSet(
          content.mailbox,
          content.namespaces,
          content.aliases
        );

        if (draft.from.length === 1) {
          setFromAddress(draft.from);
          const isInSet =
            data.filter(d => d.address === draft.from[0].address).length > 0;

          if (!isInSet) {
            data.push(draft.from[0]);
          }
        } else {
          setFromAddress([data[0]]);
        }

        console.log(draft);

        setFromDataSet(data);
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
      setComposerReady(true);
    }
  }, [editorState, email]);

  useEffect(() => {
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
          .filter(recip => recip.isValid || recip.preFill)
          .map(recip => {
            return {
              address: recip.value,
              account_key: recip.account_key,
              name: recip.name,
              contactId: recip.contactId || null,
              _id: recip.contactId || null
            };
          });
      } else {
        setActiveSendButton(false);
      }

      if (recipients.cc.arr.length > 0) {
        ccArr = recipients.cc.arr
          .filter(recip => recip.isValid || recip.preFill)
          .map(recip => {
            return {
              address: recip.value,
              account_key: recip.account_key,
              name: recip.name,
              contactId: recip.contactId || null,
              _id: recip.contactId || null
            };
          });
      }

      if (recipients.bcc.arr.length > 0) {
        bccArr = recipients.bcc.arr
          .filter(recip => recip.isValid || recip.preFill)
          .map(recip => {
            return {
              address: recip.value,
              account_key: recip.account_key,
              name: recip.name,
              contactId: recip.contactId || null,
              _id: recip.contactId || null
            };
          });
      }

      const draft = {
        ...email,
        to: toArr,
        cc: ccArr,
        bcc: bccArr,
        from: Array.isArray(fromAddress) ? fromAddress : [fromAddress]
      };

      handleEmailUpdate(draft, undefined, undefined);
    },
    { debounce: 250 }
  );

  const onSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    const newEmail = clone(email);
    newEmail.subject = value || '';

    handleEmailUpdate(newEmail);
  };

  const onFromChange = (obj: { address: string; name: string }) => {
    const newEmail = clone(email);
    newEmail.from = [obj];
    setFromAddress(obj);

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
        console.log(email);
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
        fromDataSet={fromDataSet}
        fromAddress={Array.isArray(fromAddress) ? fromAddress[0] : fromAddress}
        onFromChange={onFromChange}
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
              className="pl-1 focus:outline-none w-full py-2 text-gray-800 bg-transparent border-0 focus:ring-0"
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
