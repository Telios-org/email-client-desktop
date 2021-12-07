import { ipcRenderer, remote } from 'electron';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { AutoSizer } from 'react-virtualized';

import { DebounceInput } from 'react-debounce-input';
import { Notification, Divider } from 'rsuite';
import { DateTime } from 'luxon';
import {
  Editor,
  MessageInputs,
  ComposerTopBar,
  Attachments
} from './components';

import { ISOtimestamp } from '../main_window/utils/date.util';
// import editorHTMLexport from './utils/messageEditor/htmlExportOptions';

import ComposerService from '../services/composer.service';

// TYPESCRIPT TYPES
import {
  FolderType,
  MailMessageType,
  Email,
  MailboxType,
  AttachmentType,
  Recipients
} from '../main_window/reducers/types';

const clone = require('rfdc')();

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
  folder: FolderType;
  mailbox: MailboxType;
  message: MailMessageType;
  isInline: boolean;
};

type State = {
  activeSendButton: boolean;
  email: Email;
  mailbox: MailboxType;
  prefillRecipients: Recipients;
  editorReady: boolean;
  editorState: string;
  windowID: string | null;
  loading: boolean;
};

const Composer = (props: Props) => {
  const { isInline, message, folder, mailbox: StateMailbox, onClose } = props;

  const editorRef = useRef(null);
  const [activeSendButton, setActiveSendButton] = useState(false);
  const [email, setEmail] = useState<Email>();
  const [mailbox, setMailbox] = useState<MailboxType>(mailboxTemplate);
  const [prefillRecipients, setPrefillRecipients] = useState(
    prefillRecipientsTemplate
  );
  const [editorReady, setEditorReady] = useState(false);
  const [composerReady, setComposerReady] = useState(false);
  const [editorState, setEditorState] = useState('');
  const [windowId, setWindowId] = useState(null);
  const [loading, setLoading] = useState(false);

  const onUpdateRecipients = (recipients: Recipients, updateState = true) => {
    let toArr: { address: string; name: string }[] = [];
    let ccArr: { address: string; name: string }[] = [];
    let bccArr: { address: string; name: string }[] = [];

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

    if (updateState) {
      const content = {
        ...email,
        to: toArr,
        cc: ccArr,
        bcc: bccArr
      };
      setEmail(content);
    }

    return {
      to: toArr,
      cc: ccArr,
      bcc: bccArr
    };
  };

  const setRecipients = (mb: MailboxType, msg: Email, action: string) => {
    const fromArr = msg?.fromJSON ? JSON.parse(msg.fromJSON) : [];
    let toArr = msg?.toJSON ? JSON.parse(msg.toJSON) : [];
    let toCC = msg?.ccJSON ? JSON.parse(msg.ccJSON) : [];
    let toBCC = msg?.bccJSON ? JSON.parse(msg.bccJSON) : [];

    switch (action) {
      case 'replyAll': {
        setActiveSendButton(true);
        toArr = fromArr;
        const toJSON = msg?.toJSON ? JSON.parse(msg.toJSON) : [];
        const arr = toJSON.filter((recip: any) => recip.address !== mb.address);
        toArr = [...toArr, ...arr];
        break;
      }

      case 'reply':
        setActiveSendButton(true);
        toArr = fromArr;
        toCC = [];
        toBCC = [];
        break;

      default:
        toArr = [];
        toCC = [];
        toBCC = [];
        break;
    }

    const recipients = {
      to: {
        arr: toArr.map((recip: any) => {
          return {
            label: recip.name || recip.address,
            value: recip.address,
            preFill: true
          };
        })
      },
      cc: {
        show: toCC.length > 0,
        arr: toCC.map((recip: any) => {
          return {
            label: recip.name || recip.address,
            value: recip.address,
            preFill: true
          };
        })
      },
      bcc: {
        show: toBCC.length > 0,
        arr: toBCC.map((recip: any) => {
          return {
            label: recip.name || recip.address,
            value: recip.address,
            preFill: true
          };
        })
      }
    };

    setPrefillRecipients(recipients);
    return onUpdateRecipients(recipients, false);
  };

  const updateComposer = (mb: MailboxType, msg: Email) => {
    setEmail(msg);
    setMailbox(mb);
    setRecipients(mailbox, msg, '');
    setEditorState(email?.bodyAsHtml ?? '');
  };

  const updateEmail = (action: string) => {
    // Now extracting the plaintext
    if (mailbox) {
      // Getting timestamp for email
      const time = ISOtimestamp();

      // Setting HTML Body
      const htmlBody = editorState;
      // Getting the plain text off the htmlBody
      /* ATTENTION NEEDED HERE */
      const plaintext = ''; // NEED TO FIX THIS

      const eml = {
        ...email,
        date: time,
        from: [
          {
            address: mailbox.address,
            name: mailbox.name ? mailbox.name : mailbox.address
          }
        ],
        bodyAsText: plaintext,
        bodyAsHtml: htmlBody
      };

      setEmail(eml);

      if (plaintext.trim().length > 0 && action === 'editor') {
        ipcRenderer.send('updateComposerDraft', eml);
      }
    }
  };

  useEffect(() => {
    updateEmail('editor');
  }, [editorState]);

  const attr = (msg: Email) => {
    const from = JSON.parse(msg?.fromJSON)[0];
    const dt = DateTime.fromISO(msg?.date, {
      zone: 'utc'
    }).toLocal();
    const date = dt.toLocaleString(DateTime.DATETIME_FULL);

    return `
        On ${date} <a
          href="mailto:${from.address}"
          target="_blank"
          rel="noreferrer nofollow noopener"
        > ${from.address}</a> wrote:
      <br />
    `;
  };

  useEffect(() => {
    setMailbox(StateMailbox);

    if (isInline && message && message.ccJSON && folder.name === 'Drafts') {
      updateComposer(mailbox, message);
    }

    // The below is triggerred on Reply, ReplyAll, Forward and when Email is popped out.
    ipcRenderer.on('contentReady', (event, content, windowID) => {
      // NEED TO REFACTOR TO STRIP the JSON before saving to State
      // JSON is needed for setRecipients
      const emailDraft = content.message ?? emailTemplate;
      emailDraft.from = [
        {
          address: content.mailbox.address,
          name: content.mailbox.name ?? content.mailbox.address
        }
      ];

      setMailbox(content.mailbox);
      setWindowId(windowID);

      const { editorAction } = content;
      // Setting the to, cc and from
      const recp = setRecipients(
        content.mailbox,
        emailDraft,
        content.editorAction
      );
      emailDraft.to = recp.to;
      emailDraft.cc = recp.cc;
      emailDraft.bcc = recp.bcc;

      // Setting the Subjet line with Fwd: and Re:
      if (editorAction === 'reply' || editorAction === 'replyAll') {
        emailDraft.subject = `Re: ${emailDraft.subject}`;
      }

      if (editorAction === 'forward') {
        emailDraft.subject = `Fwd: ${emailDraft.subject}`;
      }

      if (!editorAction && !emailDraft.subject) {
        emailDraft.subject = '';
      }

      // Setting the body of the Email, when email is being popped out we don't want
      // to repeat the ---Original Email--- preface
      if (content.editorAction && content.editorAction === 'maximize') {
        setEditorState(emailDraft?.bodyAsHtml ?? '');
      } else {
        const reply = `
        <br />
        <div>‐‐‐‐‐‐‐ Original Message ‐‐‐‐‐‐‐</div>
        <br />
        ${attr(emailDraft)}
        <div>
            ${emailDraft?.bodyAsHtml ?? ''}
        </div>`;
        setEditorState(reply);
      }

      console.log('INIT DATA', editorAction, emailDraft);
      setEmail(emailDraft);
    });

    // When popped out we want to add listener for when window is closed
    if (!isInline) {
      remote.getCurrentWindow().on('close', () => {
        updateEmail('close');
      });
    }

    return () => {
      ipcRenderer.removeAllListeners('contentReady');
      remote.getCurrentWindow().removeAllListeners('close');
    };
  }, [isInline, message, folder, mailbox]);

  const onSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    const newEmail = clone(email);
    newEmail.subject = value;

    setEmail(newEmail);
  };

  useEffect(() => {
    ipcRenderer.send('updateComposerDraft', email);
  }, [email]);

  const handleEditorReady = useCallback(() => setEditorReady(true), []);

  const onAttachmentChange = (newArray: AttachmentType[]) => {
    const newEmail = {
      ...email,
      attachments: [...newArray]
    };

    setEmail(newEmail);
  };

  const openDialog = async () => {
    let attachments = [];

    try {
      const newAttachments = await ComposerService.uploadAttachments();
      if (email && email.attachments) {
        attachments = [...email.attachments, ...newAttachments];
      } else {
        attachments = [...newAttachments];
      }

      const newEmail = {
        ...email,
        attachments
      };
      setEmail(newEmail);
    } catch (err) {
      console.log(err);
    }
  };

  const sendEmail = async () => {
    updateEmail('send');

    setTimeout(async () => {
      setLoading(true);
      const finalDraft = clone(email);

      if (folder.name !== 'Sent') {
        finalDraft.emailId = null;
      }

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
        console.error(err);

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
            <ComposerTopBar />
          </div>
          <div className="w-full bg-gradient-to-r from-blue-400 to-purple-700 h-1" />
        </div>
      )}
      <MessageInputs
        onUpdateRecipients={onUpdateRecipients}
        defaultRecipients={prefillRecipients}
      />
      <div className="px-3">
        <div className="flex">
          <div className="w-16 text-gray-600 p-2 self-center">Subject</div>
          <div className="flex w-full">
            <DebounceInput
              className="pl-1 focus:outline-none w-full py-2 text-gray-800 bg-transparent"
              minLength={1}
              value={email?.subject ?? ''}
              debounceTimeout={500}
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
            defaultEmailData={editorState}
            isSendActive={activeSendButton}
            onInput={setEditorState}
            onReady={handleEditorReady}
          />
        </div>
        {/* <div className="flex bg-red-800 h-12"></div> */}
      </div>
    </div>
  );
};

export default Composer;
