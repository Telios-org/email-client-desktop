/* eslint-disable promise/no-nesting */
import { updateFolderCount } from './mailbox/folders';
import {
  Dispatch,
  GetState,
  MailboxType,
  FolderType,
  MailMessageType,
  ExternalMailMessageType,
  Email,
  SelectionRange
} from '../reducers/types';

import { activeMessageId, selectAllFoldersById } from '../selectors/mail';

import Mail from '../../services/mail.service';
import MessageIngress from '../../services/messageIngress.service';

// ASYNC REGISTER EMAIL ADDRESS WITH AWS SERVICES
export const MAILBOX_REGISTRATION = 'MAILPAGE::MAILBOX_REGISTRATION';
export const mailboxRegistration = () => {
  return {
    type: MAILBOX_REGISTRATION
  };
};

export const MAILBOX_REGISTRATION_SUCCESS =
  'MAILPAGE::MAILBOX_REGISTRATION_SUCCESS';
export const mailboxRegistrationSuccess = () => {
  return {
    type: MAILBOX_REGISTRATION_SUCCESS
  };
};

export const MAILBOX_REGISTRATION_FAILURE =
  'MAILPAGE::MAILBOX_REGISTRATION_FAILURE';
export const mailboxRegistrationFailure = (error: string) => {
  return {
    type: MAILBOX_REGISTRATION_FAILURE,
    error
  };
};

// ASYNC CREATE MAILBOXES IN LOCAL ENCRYPTED DB
export const CREATE_LOCAL_MAILBOX = 'MAILPAGE::CREATE_LOCAL_MAILBOX';
export const createLocalMailbox = () => {
  return {
    type: CREATE_LOCAL_MAILBOX
  };
};

export const CREATE_LOCAL_MAILBOX_SUCCESS =
  'MAILPAGE::CREATE_LOCAL_MAILBOX_SUCCESS';
export const createLocalMailboxSuccess = (
  mailbox: MailboxType,
  folders: FolderType[]
) => {
  return {
    type: CREATE_LOCAL_MAILBOX_SUCCESS,
    mailbox,
    folders
  };
};

export const CREATE_LOCAL_MAILBOX_FAILURE =
  'MAILPAGE::CREATE_LOCAL_MAILBOX_FAILURE';
export const createLocalMailboxFailure = (error: Error) => {
  return {
    type: CREATE_LOCAL_MAILBOX_FAILURE,
    error: error.message
  };
};

export const registerMailbox = (address: string) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    const { client } = getState();
    dispatch(mailboxRegistration());
    try {
      // insert action here
    } catch (error) {
      dispatch(mailboxRegistrationFailure(error));
      return error;
    }

    dispatch(mailboxRegistrationSuccess());
    return 'success';
  };
};

/*
 *  Get Folder Content
 */

export const GET_FOLDER_MESSAGES_REQUEST =
  'MAILPAGE::GET_FOLDER_MESSAGES_REQUEST';
export const getFolderMessagesRequest = () => {
  return {
    type: GET_FOLDER_MESSAGES_REQUEST
  };
};

export const GET_FOLDER_MESSAGES_REQUEST_SUCCESS =
  'MAILPAGE::GET_FOLDER_MESSAGES_REQUEST_SUCCESS';
export const getFolderMessagesSuccess = (messages: MailMessageType[]) => {
  return {
    type: GET_FOLDER_MESSAGES_REQUEST_SUCCESS,
    messages
  };
};

export const GET_FOLDER_MESSAGES_REQUEST_FAILURE =
  'MAILPAGE::GET_FOLDER_MESSAGES_REQUEST_FAILURE';
export const getFolderMessagesFailure = (error: Error) => {
  return {
    type: GET_FOLDER_MESSAGES_REQUEST_FAILURE,
    error: error.message
  };
};

export const fetchFolderMessages = (id: number) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(getFolderMessagesRequest());
    let messages;

    try {
      messages = await Mail.getMessagesByFolderId(id, 500);
    } catch (error) {
      dispatch(getFolderMessagesFailure(error));
      return Promise.reject(error);
    }
    await dispatch(getFolderMessagesSuccess(messages));

    // const { activeMsgId } = getState().globalState;

    // if (Object.prototype.hasOwnProperty.call(activeMsgId, id)) {
    //   const foldersActiveMsg = activeMsgId[id].id;
    //   const current = messages.filter(m => m.id === foldersActiveMsg);
    //   if (current.length === 1) {
    //     await dispatch(fetchMsg(current[0]));
    //   }
    // }

    return Promise.resolve(messages);
  };
};

/*
 *  Get Mailbox Folders
 */

export const GET_MAILBOX_FOLDERS_REQUEST =
  'MAILPAGE::GET_MAILBOX_FOLDERS_REQUEST';
export const getMailboxFoldersRequest = () => {
  return {
    type: GET_MAILBOX_FOLDERS_REQUEST
  };
};

export const GET_MAILBOX_FOLDERS_REQUEST_SUCCESS =
  'MAILPAGE::GET_MAILBOX_FOLDERS_REQUEST_SUCCESS';
export const getMailboxFoldersSuccess = (id: number, folders: FolderType[]) => {
  return {
    type: GET_MAILBOX_FOLDERS_REQUEST_SUCCESS,
    id,
    folders
  };
};

export const GET_MAILBOX_FOLDERS_REQUEST_FAILURE =
  'MAILPAGE::GET_MAILBOX_FOLDERS_REQUEST_FAILURE';
export const getMailboxFoldersFailure = (error: Error) => {
  return {
    type: GET_MAILBOX_FOLDERS_REQUEST_FAILURE,
    error: error.message
  };
};

export const fetchMailboxFolders = (id: number) => {
  return async (dispatch: Dispatch) => {
    dispatch(getMailboxFoldersRequest());
    let folders;
    try {
      folders = await Mail.getMailboxFolders(id);
    } catch (error) {
      dispatch(getMailboxFoldersFailure(error));
      return error;
    }
    dispatch(getMailboxFoldersSuccess(id, folders));
    return folders;
  };
};

export const CREATE_NEW_FOLDER = 'MAILPAGE::CREATE_NEW_FOLDER';
export const createNewFolder = (folder: FolderType) => {
  return {
    type: CREATE_NEW_FOLDER,
    folder
  };
};

/*
 *  Get Mailboxes
 */

export const GET_MAILBOXES_REQUEST = 'MAILPAGE::GET_MAILBOXES_REQUEST';
export const getMailboxesRequest = () => {
  return {
    type: GET_MAILBOXES_REQUEST
  };
};

export const GET_MAILBOXES_REQUEST_SUCCESS =
  'MAILPAGE::GET_MAILBOXES_REQUEST_SUCCESS';
export const getMailboxesSuccess = (mailboxes: MailboxType[]) => {
  return {
    type: GET_MAILBOXES_REQUEST_SUCCESS,
    mailboxes
  };
};

export const GET_MAILBOXES_REQUEST_FAILURE =
  'MAILPAGE::GET_MAILBOXES_REQUEST_FAILURE';
export const getMailboxesFailure = (error: Error) => {
  return {
    type: GET_MAILBOXES_REQUEST_FAILURE,
    error: error.message
  };
};

export const fetchMailboxes = () => {
  return async (dispatch: Dispatch) => {
    dispatch(getMailboxesRequest());
    let mailboxes;

    try {
      mailboxes = await Mail.getMailboxes();
    } catch (error) {
      dispatch(getMailboxesFailure(error));
      return error;
    }

    dispatch(getMailboxesSuccess(mailboxes));

    return mailboxes;
  };
};

/*
 *  Saving Emails to local DB and removing it from S3
 */

export const SAVE_INCOMING_MESSAGES_REQUEST =
  'MAILPAGE::SAVE_INCOMING_MESSAGES_REQUEST';
export const saveIncomingMessagesRequest = () => {
  return {
    type: SAVE_INCOMING_MESSAGES_REQUEST
  };
};

export const SAVE_INCOMING_MESSAGES_SUCCESS =
  'MAILPAGE::SAVE_INCOMING_MESSAGES_SUCCESS';
export const saveIncomingMessagesSuccess = function (
  messages: MailMessageType[],
  activeFolderId: number
) {
  return {
    type: SAVE_INCOMING_MESSAGES_SUCCESS,
    messages,
    activeFolderId
  };
};

export const SAVE_INCOMING_MESSAGES_FAILURE =
  'MAILPAGE::SAVE_INCOMING_MESSAGES_FAILURE';
export const saveIncomingMessagesFailure = (error: Error) => {
  return {
    type: SAVE_INCOMING_MESSAGES_FAILURE,
    error: error.message
  };
};

export const saveIncomingMessages = (messages: Email[]) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    // dispatch(saveIncomingMessagesRequest());
    const {
      globalState: { activeFolderIndex },
      mail: {
        folders: { allIds: foldersArray }
      }
    } = getState();
    // eslint-disable-next-line
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        let msg;
        try {
          msg = await Mail.save({ messages, type: 'Incoming', sync: true });
          // eslint-disable-next-line no-underscore-dangle
          const msgArray = messages.map(m => m._id);
          Mail.markAsSynced(msgArray, { sync: false });
        } catch (error) {
          dispatch(saveIncomingMessagesFailure(error));
          return reject(error);
        }
        dispatch(
          saveIncomingMessagesSuccess(msg, foldersArray[activeFolderIndex])
        );
        return resolve('done');
      });
    });
  };
};

/*
 *  Fetching the Email reference ids from S3 of the message needing downloading
 */

export const FETCH_NEW_MESSAGE_REQUEST = 'MAILPAGE::FETCH_NEW_MESSAGE_REQUEST';
export const fetchNewMessageRequest = () => {
  return {
    type: FETCH_NEW_MESSAGE_REQUEST
  };
};

export const FETCH_NEW_MESSAGE_SUCCESS = 'MAILPAGE::FETCH_NEW_MESSAGE_SUCCESS';
export const fetchNewMessageSuccess = (messages: ExternalMailMessageType[]) => {
  return {
    type: FETCH_NEW_MESSAGE_SUCCESS,
    messages
  };
};

export const FETCH_NEW_MESSAGE_FAILURE = 'MAILPAGE::FETCH_NEW_MESSAGE_FAILURE';
export const fetchNewMessageFailure = (error: string) => {
  return {
    type: FETCH_NEW_MESSAGE_FAILURE,
    error
  };
};

export function fetchNewMessages() {
  return async (dispatch: Dispatch, getState: GetState) => {
    const {
      client,
      globalState: { activeFolderIndex },
      mail: {
        folders: { byId, allIds: foldersArray }
      }
    } = getState();

    let messages;
    try {
      Mail.getNewMail()
        .then(data => {
          if (data.meta.length > 0) {
            return MessageIngress.decipherMailMeta({
              async: false,
              meta: data.meta,
              account: data.account
            });
          }

          return true;
        })
        .catch(err => {
          return err;
        });
    } catch (err) {
      console.log(err);
      dispatch(fetchNewMessageFailure(err));
      return err;
    }

    // dispatch(fetchNewMessageSuccess(messages));
    return messages;
  };
}

/*
 *  Updating the mailbox with any new messages that may have come in.
 */

export const FETCH_MSG_BODY = 'MAILPAGE::FETCH_MSG_BODY';
export const fetchMsgBody = (id: string) => {
  return {
    type: FETCH_MSG_BODY,
    id
  };
};

export const FETCH_MSG_BODY_SUCCESS = 'MAILPAGE::FETCH_MSG_BODY_SUCCESS';
export const fetchMsgBodySuccess = (update: MailMessageType) => {
  return {
    type: FETCH_MSG_BODY_SUCCESS,
    message: update
  };
};

export const FETCH_MSG_BODY_FAILURE = 'MAILPAGE::FETCH_MSG_BODY_FAILURE';
export const fetchMsgBodyFailure = (error: Error) => {
  return {
    type: FETCH_MSG_BODY_FAILURE,
    error: error.message
  };
};

export const fetchMsg = (messageId: string) => {
  return async (dispatch: Dispatch) => {
    dispatch(fetchMsgBody(messageId));
    let email;

    try {
      email = await Mail.getMessagebyId(messageId);
    } catch (err) {
      dispatch(fetchMsgBodyFailure(err));
      return Promise.reject(err);
    }

    dispatch(fetchMsgBodySuccess(email));
    return Promise.resolve(email);
  };
};


export const SHOW_MAXIMIZED_MESSAGE_DISPLAY =
  'MESSAGES::SHOW_MAXIMIZED_MESSAGE_DISPLAY';
export const showMaximizedMessageDisplay = (bool: boolean) => {
  return {
    type: SHOW_MAXIMIZED_MESSAGE_DISPLAY,
    showMaximizedMessageDisplay: bool
  };
};

// END OF THIS MAY BE IN THE WRONG ACTION CREATOR FOLDER
// END OF CLEANUP TO FOLLOW REDUX PATTERN

export const MSG_SELECTION_FLOW = 'MAILPAGE::MSG_SELECTION_FLOW';
export const msgSelectionFlow = (id: string, folderId: number) => {
  return {
    type: MSG_SELECTION_FLOW,
    id,
    folderId
  };
};

export const MSG_SELECTION_FLOW_SUCCESS =
  'MAILPAGE::MSG_SELECTION_FLOW_SUCCESS';
export const msgSelectionFlowSuccess = (
  message: MailMessageType,
  id: string,
  folderId: number
) => {
  return {
    type: MSG_SELECTION_FLOW_SUCCESS,
    message,
    id,
    folderId
  };
};

export const MSG_SELECTION_FLOW_FAILURE =
  'MAILPAGE::MSG_SELECTION_FLOW_FAILURE';
export const msgSelectionFlowFailure = (error: Error) => {
  return {
    type: MSG_SELECTION_FLOW_FAILURE,
    error: error.message
  };
};

export const messageSelection = (message: MailMessageType, action: string) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(msgSelectionFlow(message.id, message.folderId));
    if (action === 'showMaxDisplay') {
      dispatch(showMaximizedMessageDisplay(true));
    }

    let fullMsg;

    try {
      if (
        message.unread &&
        message.folderId !== 3 &&
        message.folderId !== 4 &&
        message.folderId !== 5
      ) {
        dispatch(updateFolderCount(message.folderId, -1));
      }

      fullMsg = await dispatch(fetchMsg(message.id));
    } catch (err) {
      dispatch(msgSelectionFlowFailure(err));
      return Promise.reject(err);
    }

    dispatch(msgSelectionFlowSuccess(fullMsg, message.id, message.folderId));
    return Promise.resolve(message.id);
  };
};

export const MSG_RANGE_SELECTION = 'MAILPAGE::MSG_RANGE_SELECTION';
export const msgRangeSelection = (
  selected: SelectionRange,
  folderId: number
) => {
  return {
    type: MSG_RANGE_SELECTION,
    payload: selected,
    folderId
  };
};

export const FOLDER_SELECTION_FLOW = 'MAILPAGE::FOLDER_SELECTION_FLOW';
export const folderSelectionFlow = (id: number) => {
  return {
    type: FOLDER_SELECTION_FLOW,
    id
  };
};

export const FOLDER_SELECTION_FLOW_SUCCESS =
  'MAILPAGE::FOLDER_SELECTION_FLOW_SUCCESS';
export const folderSelectionFlowSuccess = (
  index: number,
  messages: MailMessageType[]
) => {
  return {
    type: FOLDER_SELECTION_FLOW_SUCCESS,
    index,
    messages
  };
};

export const FOLDER_SELECTION_FLOW_FAILURE =
  'MAILPAGE::FOLDER_SELECTION_FLOW_FAILURE';
export const folderSelectionFlowFailure = (error: Error) => {
  return {
    type: FOLDER_SELECTION_FLOW_FAILURE,
    error: error.message
  };
};

export const folderSelection = (folderIndex: string) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(folderSelectionFlow(folderIndex));
    // dispatch(showMaximizedMessageDisplay(false));

    const { mail, globalState } = getState();
    const foldersArray = mail.folders.allIds;
    const newFolderId = foldersArray[folderIndex];
    const activeMsgIdObj = globalState.activeMsgId;

    let messages;

    try {
      messages = await dispatch(fetchFolderMessages(newFolderId));

      if (Object.prototype.hasOwnProperty.call(activeMsgIdObj, newFolderId)) {
        const foldersActiveMsg = activeMsgIdObj[newFolderId].id;

        // Making sure the message selection has not been set to null before trying to fetch the message.
        if (foldersActiveMsg !== null) {
          const fullActiveMsg = await dispatch(fetchMsg(foldersActiveMsg));
          messages = messages.map(m =>
            m.id !== fullActiveMsg.id ? m : fullActiveMsg
          );
        }
      }
    } catch (err) {
      dispatch(folderSelectionFlowFailure(err));
      return Promise.reject(err);
    }

    dispatch(folderSelectionFlowSuccess(folderIndex, messages));
    return Promise.resolve();
  };
};

/*
 *  Retrieving all the available mailboxes from the DB.
 */

export const FETCH_MAIL_DATA = 'MAILPAGE::FETCH_MAIL_DATA';
export const fetchDataRequest = () => {
  return {
    type: FETCH_MAIL_DATA
  };
};

export const FETCH_MAIL_DATA_SUCCESS = 'MAILPAGE::FETCH_MAIL_DATA_SUCCESS';
export const fetchDataSuccess = (
  mailboxes: MailboxType[],
  activeMailboxId: number,
  folders: FolderType[],
  activeFolderId: number,
  messages: MailMessageType[]
) => {
  return {
    type: FETCH_MAIL_DATA_SUCCESS,
    mailboxes,
    activeMailboxId,
    folders,
    activeFolderId,
    messages
  };
};

export const FETCH_MAIL_DATA_FAILURE = 'MAILPAGE::FETCH_MAIL_DATA_FAILURE';
export const fetchDataFailure = (error: Error) => {
  return {
    type: FETCH_MAIL_DATA_FAILURE,
    error
  };
};

export const loadMailboxes = (opts: { fullSync: boolean }) => async (
  dispatch: Dispatch,
  getState: GetState
) => {
  dispatch(fetchDataRequest());
  const {
    globalState: {
      activeMailboxIndex,
      activeFolderIndex,
      activeMsgId: activeMsgIdObj
    }
  } = getState();

  let mailboxes;
  let folders;
  let messages;
  let activeMailboxId;
  let activeFolderId;

  try {
    mailboxes = await dispatch(fetchMailboxes());

    activeMailboxId = mailboxes[activeMailboxIndex].id;
    folders = await dispatch(fetchMailboxFolders(activeMailboxId));

    activeFolderId = folders[activeFolderIndex].id;
    messages = await dispatch(fetchFolderMessages(activeFolderId));

    if (Object.prototype.hasOwnProperty.call(activeMsgIdObj, activeFolderId)) {
      const foldersActiveMsg = activeMsgIdObj[activeFolderId].id;

      // Making sure the message selection has not been set to null before trying to fetch the message.
      if (foldersActiveMsg !== null) {
        const fullActiveMsg = await dispatch(fetchMsg(foldersActiveMsg));
        messages = messages.map(m =>
          m.id !== fullActiveMsg.id ? m : fullActiveMsg
        );
      }
    }
  } catch (error) {
    dispatch(fetchDataFailure(error));
    return error;
  }

  dispatch(
    fetchDataSuccess(
      mailboxes,
      activeMailboxId,
      folders,
      activeFolderId,
      messages
    )
  );

  return { mailboxes, folders, messages };
};

// THIS MAY BE IN THE WRONG ACTION CREATOR FOLDER
// CLEANUP TO FOLLOW SAME REDUX PATTERN
export const moveMessagesToFolder = messages => {
  return async (dispatch: Dispatch) => {
    await Mail.moveMessages(messages);
    await dispatch(loadMailboxes());
  };
};

export const sync = (opts: { fullSync: boolean }) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    console.time('Sync Mailboxes');

    if (opts.fullSync) {
      await dispatch(fetchNewMessages());
    }

    try {
      await dispatch(loadMailboxes(opts));
    } catch (error) {
      return error;
    }
    console.timeEnd('Sync Mailboxes');
    return true;
  };
};

export const HIGHLIGHT_SEARCH_QUERY = 'GLOBAL::HIGHLIGHT_SEARCH_QUERY';
export const setHighlightValue = (query: string) => {
  return {
    type: HIGHLIGHT_SEARCH_QUERY,
    searchQuery: query
  };
};
