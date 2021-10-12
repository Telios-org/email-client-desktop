import { ipcRenderer, remote } from 'electron';
import React, { Component } from 'react';
import Editor from 'draft-js-plugins-editor';
import { Scrollbars } from 'react-custom-scrollbars';
import { AutoSizer } from 'react-virtualized';
import createLinkifyPlugin from 'draft-js-linkify-plugin';
import {
  EditorState,
  convertToRaw,
  convertFromHTML,
  ContentState
} from 'draft-js';

import { DebounceInput } from 'react-debounce-input';
import { Notification, Divider } from 'rsuite';
import { DateTime } from 'luxon';
import createImagePlugin from 'draft-js-image-plugin';
import { editorStateFromHTML } from '../utils/messageEditor/editor.util';
import createToolbarPlugin from './editorPlugins/draft-js-toolbar';
import MessageInputs from './MessageInputs';
import Attachments from './Attachments/Attachments';
import ComposerTopBar from './TopBar/ComposerTopBar';

import { ISOtimestamp } from '../../main_window/utils/date.util';
import editorHTMLexport from '../utils/messageEditor/htmlExportOptions';

import ComposerService from '../../services/composer.service';

// TYPESCRIPT TYPES
import {
  FolderType,
  MailMessageType,
  Email,
  MailboxType,
  AttachmentType,
  Recipients
} from '../../main_window/reducers/types';

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

const linkifyPlugin = createLinkifyPlugin();
const toolbarPlugin = createToolbarPlugin();
const ImagesPlugin = createImagePlugin();
const { Toolbar, decorators: tbDecorators } = toolbarPlugin;
// const { decorators: imgDecorators } = ImagesPlugin;
// const { decorators: linkDecorators } = linkifyPlugin;

const pluginLib = [linkifyPlugin, ImagesPlugin, toolbarPlugin];
// const decorators = [...tbDecorators, ...linkDecorators];

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
  editorState: EditorState;
  windowID: string | null;
  loading: boolean;
};
class Composer extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.editor = null;

    this.setEditorRef = element => {
      this.editor = element;
    };

    this.focusEditor = () => {
      // Focus the text input using the raw DOM API
      if (this.editor) this.editor.focus();
    };

    this.state = {
      activeSendButton: false,
      mailbox: mailboxTemplate,
      prefillRecipients: prefillRecipientsTemplate,
      email: emailTemplate,
      editorState: EditorState.createEmpty(),
      windowID: null,
      loading: false
    };

    this.onUpdateRecipients = this.onUpdateRecipients.bind(this);
    this.setPrefillRecipients = this.setPrefillRecipients.bind(this);
    this.onUpdateRecipients = this.onUpdateRecipients.bind(this);
    this.onSubjectChange = this.onSubjectChange.bind(this);
    this.onAttachmentChange = this.onAttachmentChange.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
    this.setRecipients = this.setRecipients.bind(this);
    this.setReplyContent = this.setReplyContent.bind(this);
    this.setSubjectContent = this.setSubjectContent.bind(this);
    this.setBodyContent = this.setBodyContent.bind(this);
    this.updateEmail = this.updateEmail.bind(this);
    this.handleOnMaximize = this.handleOnMaximize.bind(this);
    this.updateComposer = this.updateComposer.bind(this);
  }

  componentDidMount() {
    const { isInline, message, folder, mailbox } = this.props;

    this.setState({ mailbox });

    // When in the Draft folder do the below
    if (isInline && message && message.ccJSON && folder.id === 2) {
      this.updateComposer(mailbox, message);
    }

    // The below is triggerred on Reply, ReplyAll, Forward and when Email is popped out.
    ipcRenderer.on('contentReady', (event, content, windowID) => {
      // console.log('MESSAGE RECEIVED from IPC', content, windowID);
      // NEED TO REFACTOR TO STRIP the JSON before saving to State
      // JSON is needed for setRecipients
      this.setState({
        email: content.message ? content.message : emailTemplate,
        mailbox: content.mailbox,
        windowID
      });

      // Focusing the editor somehow causes all the decorators to be lost
      // unless I do a timeout.
      setTimeout(() => this.focusEditor());

      // Setting the to, cc and from
      this.setRecipients(content.mailbox, content.editorAction);
      // Setting the Subjet line with Fwd: and Re:
      this.setSubjectContent(content.editorAction);

      // Setting the body of the Email, when email is being popped out we don't want
      // to repeat the ---Original Email--- preface
      if (content.editorAction && content.editorAction === 'maximize') {
        this.setBodyContent();
      } else {
        this.setReplyContent();
      }
    });

    // When popped out we want to add listener for when window is closed
    if (!isInline) {
      remote.getCurrentWindow().on('close', () => {
        this.updateEmail('close');
      });
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { isInline, message, folder, mailbox } = this.props;

    if (
      isInline &&
      message &&
      folder.name === 'Drafts' &&
      message.ccJSON &&
      JSON.stringify(prevProps.message) !== JSON.stringify(message)
    ) {
      this.updateComposer(mailbox, message);
    }
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('contentReady');
    remote.getCurrentWindow().removeAllListeners('close');
  }

  updateComposer(mailbox: MailboxType, message: Email) {
    this.setState(
      {
        email: message,
        mailbox
      },
      () => {
        this.setRecipients(mailbox, 'maximize');
        this.setBodyContent();
      }
    );
  }

  // eslint-disable-next-line react/sort-comp
  setPrefillRecipients = (rcp: Recipients) => {
    this.setState({
      prefillRecipients: rcp
    });
  };

  setEditorState = (editorState: EditorState) => {
    this.setState({ editorState });

    setTimeout(() => {
      this.updateEmail('editor');
    });
  };

  onUpdateRecipients = (recipients: Recipients) => {
    let toArr = [];
    let ccArr = [];
    let bccArr = [];

    if (recipients.to.arr.length > 0) {
      this.setState({ activeSendButton: true });
      toArr = recipients.to.arr
        .filter(eml => eml.isValid || eml.preFill)
        .map(eml => {
          return { address: eml.value, name: eml.label };
        });
    } else {
      this.setState({ activeSendButton: false });
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

    const { mailbox, email } = this.state;
    const content = {
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

    this.setState({ email: content });

    setTimeout(() => {
      const eml = content;
      ipcRenderer.send('updateComposerDraft', eml);
    });
  };

  onSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const { email, mailbox } = this.state;

    const newEmail = {
      email: {
        ...email,
        subject: value,
        from: [
          {
            address: mailbox.address,
            name: mailbox.name ? mailbox.name : mailbox.address
          }
        ]
      }
    };

    this.setState(newEmail);

    setTimeout(() => {
      ipcRenderer.send('updateComposerDraft', newEmail);
    });
  };

  onAttachmentChange = (newArray: AttachmentType[]) => {
    const { email } = this.state;

    const newEmail = {
      email: {
        ...email,
        attachments: [...newArray]
      }
    };

    this.setState(newEmail);

    setTimeout(() => {
      ipcRenderer.send('updateComposerDraft', newEmail);
    });
  };

  openDialog = async () => {
    const { email } = this.state;
    const { isInline } = this.props;

    let attachments = [];

    try {
      const newAttachments = await ComposerService.uploadAttachments();
      if (email && email.attachments) {
        attachments = [...email.attachments, ...newAttachments];
      } else {
        attachments = [...newAttachments];
      }

      this.setState({
        email: {
          ...email,
          attachments
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  updateEmail = (action: string) => {
    // Now extracting the plaintext
    const { editorState, mailbox, email } = this.state;

    if (mailbox) {
      // Getting timestamp for email
      const time = ISOtimestamp();

      const contentState = editorState.getCurrentContent();
      const { blocks } = convertToRaw(contentState);
      const plaintext = blocks
        .map((block: { text: string }) => {
          return (!block.text.trim() && '\n') || block.text;
        })
        .join('\n');

      // Getting HTML Body
      const htmlBody = editorHTMLexport(editorState);
      // creating the final object

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

      this.setState({ email: eml });

      if (plaintext.trim().length > 0 && action === 'editor') {
        ipcRenderer.send('updateComposerDraft', eml);
      }
    }
  };

  sendEmail = async () => {
    this.updateEmail('send');

    setTimeout(async () => {
      const { email, windowID, loading } = this.state;
      const { isInline, onClose, folder } = this.props;

      this.setState({ loading: true });

      if (folder !== 3) {
        email.emailId = null;
      }

      try {
        await ComposerService.send(email, isInline);

        this.setState({ loading: false });

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
        this.setState({ loading: false });

        console.error(err);

        Notification.error({
          title: 'Failed to Send',
          placement: 'bottomEnd'
        });
      }
    });
  };

  attr = () => {
    const { email } = this.state;
    const from = JSON.parse(email.fromJSON)[0];
    const dt = DateTime.fromISO(email.date, {
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

  setRecipients = (mailbox: MailboxType, action: string) => {
    const { email } = this.state;

    const fromArr = email.fromJSON ? JSON.parse(email.fromJSON) : [];
    let toArr = email.toJSON ? JSON.parse(email.toJSON) : [];
    const toCC = email.ccJSON ? JSON.parse(email.ccJSON) : [];
    const toBCC = email.bccJSON ? JSON.parse(email.bccJSON) : [];

    switch (action) {
      case 'replyAll': {
        toArr = fromArr;
        const toJSON = email.toJSON ? JSON.parse(email.toJSON) : [];
        const arr = toJSON.filter(recip => recip.address !== mailbox.address);
        toArr = [...toArr, ...arr];
        break;
      }

      case 'reply':
        toArr = fromArr;
        break;

      default:
        break;
    }

    const recipients = {
      to: {
        arr: toArr.map(recip => {
          return {
            label: recip.name || recip.address,
            value: recip.address,
            preFill: true
          };
        })
      },
      cc: {
        show: toCC.length > 0,
        arr: toCC.map(recip => {
          return {
            label: recip.name || recip.address,
            value: recip.address,
            preFill: true
          };
        })
      },
      bcc: {
        show: toBCC.length > 0,
        arr: toBCC.map(recip => {
          return {
            label: recip.name || recip.address,
            value: recip.address,
            preFill: true
          };
        })
      }
    };

    this.onUpdateRecipients(recipients);
    this.setPrefillRecipients(recipients);
  };

  setSubjectContent = (editorAction: string) => {
    const { email } = this.state;

    const newEmail = clone(email);

    if (editorAction === 'reply' || editorAction === 'replyAll') {
      newEmail.subject = `Re: ${newEmail.subject}`;
    }

    if (editorAction === 'forward') {
      newEmail.subject = `Fwd: ${newEmail.subject}`;
    }

    if (!editorAction && !newEmail.subject) {
      newEmail.subject = '';
    }

    this.setState({ email: newEmail });
  };

  setReplyContent = () => {
    const { email } = this.state;
    const reply = `
      <br />
      <div>‐‐‐‐‐‐‐ Original Message ‐‐‐‐‐‐‐</div>
      <br />
      ${this.attr()}
      <br />
      <p>
        ${email.bodyAsHtml ? email.bodyAsHtml : ''}
      </p>`;

    // const blocksFromHTML = convertFromHTML(reply);
    // console.log(blocksFromHTML);
    // const state = ContentState.createFromBlockArray(
    //   blocksFromHTML.contentBlocks,
    //   blocksFromHTML.entityMap
    // );
    // console.log(JSON.stringify(convertToRaw(state)));
    // const newEditor = EditorState.createWithContent(state);
    const newEditor = editorStateFromHTML(reply);
    this.setEditorState(newEditor);
  };

  setBodyContent() {
    const { email } = this.state;
    // const blocksFromHTML = convertFromHTML(email.bodyAsHtml);
    // console.log(blocksFromHTML);
    // const state = ContentState.createFromBlockArray(
    //   blocksFromHTML.contentBlocks,
    //   blocksFromHTML.entityMap
    // );
    // console.log(JSON.stringify(convertToRaw(state)));
    // const newEditor = EditorState.createWithContent(state);

    if (email.bodyAsHtml) {
      const newEditor = editorStateFromHTML(email.bodyAsHtml);
      this.setEditorState(newEditor);
    }
  }

  handleOnMaximize() {
    const { onMaximize } = this.props;
    this.updateEmail('maximize');

    setTimeout(() => {
      const { email } = this.state;
      onMaximize(email);
    });
  }

  render() {
    const {
      activeSendButton,
      email,
      prefillRecipients,
      editorState,
      loading
    } = this.state;

    const { onClose, isInline } = this.props;

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
          onUpdateRecipients={this.onUpdateRecipients}
          defaultRecipients={prefillRecipients}
        />
        <div className="px-3">
          <div className="flex">
            <div className="w-16 text-gray-600 p-2 self-center">Subject</div>
            <div className="flex w-full">
              <DebounceInput
                className="pl-1 focus:outline-none w-full py-2 text-gray-800 bg-transparent"
                minLength={1}
                value={email && email.subject ? email.subject : ''}
                debounceTimeout={500}
                type="text"
                data-name="subject"
                onChange={this.onSubjectChange}
              />
            </div>
          </div>
        </div>
        <Divider style={{ margin: '0px' }} />
        <Attachments
          attachments={email && email.attachments ? email.attachments : []}
          displayStatus="editor"
          onAttachmentChange={this.onAttachmentChange}
        />
        <div className="flex flex-1 w-full flex-col">
          <div className="flex-grow bg-white flex flex-col justify-between">
            <Scrollbars hideTracksWhenNotNeeded autoHide>
              <div className="w-full h-full px-8">
                <Editor
                  editorState={editorState}
                  ref={this.setEditorRef}
                  onChange={this.setEditorState}
                  plugins={pluginLib}
                />
              </div>
            </Scrollbars>
            {this.setEditorRef && editorState && (
              <Toolbar
                onAttachment={this.openDialog}
                onSend={this.sendEmail}
                isSendActive={activeSendButton}
                isLoading={loading}
              />
            )}
          </div>
          {/* <div className="flex bg-red-800 h-12"></div> */}
        </div>
      </div>
    );
  }
}

export default Composer;
