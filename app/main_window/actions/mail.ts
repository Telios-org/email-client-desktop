/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
/* eslint-disable promise/no-nesting */
import { updateFolderCount } from './mailbox/folders';

import {
  aliasRegistrationSuccess,
  fetchAliasMessages,
  aliasSelection,
  updateAliasCount
} from './mailbox/aliases';
import {
  Dispatch,
  GetState,
  MailboxType,
  FolderType,
  NamespaceType,
  AliasesType,
  MailMessageType,
  ExternalMailMessageType,
  Email,
  SelectionRange
} from '../reducers/types';

import {
  activeMessageId,
  selectAllFoldersById,
  currentMessageList
} from '../selectors/mail';

import Mail from '../../services/mail.service';
import MessageIngress from '../../services/messageIngress.service';

// ELECTRON IPC IMPORT
const { ipcRenderer } = require('electron');

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
    return new Promise((resolve, reject) => {
      dispatch(getFolderMessagesRequest());
      console.time('GetMessagesByFolderId');
      Mail.getMessagesByFolderId(id, 20)
        .then(messages => {
          dispatch(getFolderMessagesSuccess(messages));

          const { activeMsgId } = getState().globalState;

          if (Object.prototype.hasOwnProperty.call(activeMsgId, id)) {
            const foldersActiveMsg = activeMsgId[id].id;
            const current = messages.filter(m => m.id === foldersActiveMsg);
            if (current.length === 1) {
              dispatch(fetchMsg(current[0]));
            }
          }
          console.timeEnd('GetMessagesByFolderId');
          return resolve(messages);
        })
        .catch(err => {
          dispatch(getFolderMessagesFailure(err));
          reject(err);
        });
    });
  };
};

export const FETCH_MORE_FOLDER_MESSAGES_SUCCESS =
  'MAILPAGE::FETCH_MORE_FOLDER_MESSAGES_SUCCESS';
export const fetchMoreFolderMessagesSuccess = (messages: MailMessageType[]) => {
  return {
    type: FETCH_MORE_FOLDER_MESSAGES_SUCCESS,
    messages
  };
};

export const fetchMoreFolderMessages = (id: number, offset: number) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    return new Promise((resolve, reject) => {
      Mail.getMessagesByFolderId(id, 20, offset)
        .then(messages => {
          dispatch(fetchMoreFolderMessagesSuccess(messages));
        })
        .catch(err => {
          reject(err);
        });
    });
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
    return new Promise((resolve, reject) => {
      dispatch(getMailboxFoldersRequest());
      Mail.getMailboxFolders(id)
        .then(folders => {
          dispatch(getMailboxFoldersSuccess(id, folders));
          return resolve(folders);
        })
        .catch(err => {
          dispatch(getMailboxFoldersFailure(err));
        });
    });
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
 *  Get Mailbox Namespaces
 */

export const GET_MAILBOX_NAMESPACES_REQUEST =
  'MAILPAGE::GET_MAILBOX_NAMESPACES_REQUEST';
export const getMailboxNamespacesRequest = () => {
  return {
    type: GET_MAILBOX_NAMESPACES_REQUEST
  };
};

export const GET_MAILBOX_NAMESPACES_REQUEST_SUCCESS =
  'MAILPAGE::GET_MAILBOX_NAMESPACES_REQUEST_SUCCESS';
export const getMailboxNamespacesSuccess = (
  id: number,
  namespaces: NamespaceType[]
) => {
  return {
    type: GET_MAILBOX_NAMESPACES_REQUEST_SUCCESS,
    id,
    namespaces
  };
};

export const GET_MAILBOX_NAMESPACES_REQUEST_FAILURE =
  'MAILPAGE::GET_MAILBOX_NAMESPACES_REQUEST_FAILURE';
export const getMailboxNamespacesFailure = (error: Error) => {
  return {
    type: GET_MAILBOX_NAMESPACES_REQUEST_FAILURE,
    error: error.message
  };
};

export const fetchMailboxNamespaces = (id: number) => {
  return async (dispatch: Dispatch) => {
    dispatch(getMailboxNamespacesRequest());
    let namespaces;
    try {
      namespaces = await Mail.getMailboxNamespaces(id);
    } catch (error) {
      dispatch(getMailboxNamespacesFailure(error));
      return error;
    }
    dispatch(getMailboxNamespacesSuccess(id, namespaces));
    return namespaces;
  };
};

/*
 *  Get Mailbox Aliases
 */

export const GET_MAILBOX_ALIASES_REQUEST =
  'MAILPAGE::GET_MAILBOX_ALIASES_REQUEST';
export const getMailboxAliasesRequest = (namespaceKeys: number[]) => {
  return {
    type: GET_MAILBOX_ALIASES_REQUEST,
    payload: namespaceKeys
  };
};

export const GET_MAILBOX_ALIASES_REQUEST_SUCCESS =
  'MAILPAGE::GET_MAILBOX_ALIASES_REQUEST_SUCCESS';
export const getMailboxAliasesSuccess = (
  namespaceKeys: number[],
  aliases: AliasesType[]
) => {
  return {
    type: GET_MAILBOX_ALIASES_REQUEST_SUCCESS,
    namespaceKeys,
    aliases
  };
};

export const GET_MAILBOX_ALIASES_REQUEST_FAILURE =
  'MAILPAGE::GET_MAILBOX_ALIASES_REQUEST_FAILURE';
export const getMailboxAliasesFailure = (error: Error) => {
  return {
    type: GET_MAILBOX_ALIASES_REQUEST_FAILURE,
    error: error.message
  };
};

export const fetchMailboxAliases = (namespaceKeys: number[]) => {
  return async (dispatch: Dispatch) => {
    dispatch(getMailboxAliasesRequest(namespaceKeys));
    let aliases;
    try {
      aliases = await Mail.getMailboxAliases(namespaceKeys);
    } catch (error) {
      dispatch(getMailboxAliasesFailure(error));
      return error;
    }
    dispatch(getMailboxAliasesSuccess(namespaceKeys, aliases));
    return aliases;
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
export const saveIncomingMessagesSuccess = function(
  messages: MailMessageType[],
  activeFolderId: number,
  activeAliasId: string
) {
  return {
    type: SAVE_INCOMING_MESSAGES_SUCCESS,
    messages,
    activeFolderId,
    activeAliasId
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

export const saveIncomingMessages = (messages: any, newAliases: string[]) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    const {
      globalState: { activeFolderIndex, activeAliasIndex },
      mail: {
        folders: { allIds: foldersArray },
        aliases: { allIds: aliasesArray }
      }
    } = getState();
    // eslint-disable-next-line
    let folderCounts = {};
    const aliasCounts = {};

    if (newAliases.length) {
      // add new aliases to redux
      for (const alias of newAliases) {
        dispatch(aliasRegistrationSuccess(alias));
      }
    }

    dispatch(
      saveIncomingMessagesSuccess(
        messages,
        foldersArray[activeFolderIndex],
        aliasesArray[activeAliasIndex]
      )
    );

    for (const msg of messages) {
      if (msg.folderId) {
        if (!folderCounts[msg.folderId]) folderCounts[msg.folderId] = 0;
        folderCounts[msg.folderId] += 1;
      }

      if (msg.aliasId) {
        if (!aliasCounts[msg.aliasId]) aliasCounts[msg.aliasId] = 0;
        aliasCounts[msg.aliasId] += 1;
      }
    }

    // Update Folder Counts
    for (const key in folderCounts) {
      dispatch(updateFolderCount(parseInt(key), folderCounts[key]));
    }

    // Update Alias Counts
    for (const key in aliasCounts) {
      dispatch(updateAliasCount(key, aliasCounts[key]));
    }

    return Promise.resolve('done');
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
export const fetchNewMessageSuccess = () => {
  return {
    type: FETCH_NEW_MESSAGE_SUCCESS
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
  return async (dispatch: Dispatch) => {
    return new Promise((resolve, reject) => {
      dispatch(fetchNewMessageRequest());

      Mail.getNewMail()
        .then(data => {
          if (data.meta.length > 0) {
            MessageIngress.decipherMailMeta({
              async: false,
              meta: data.meta,
              account: data.account
            });
          }

          dispatch(fetchNewMessageSuccess());
          return resolve();
        })
        .catch(err => {
          console.log(err);
          dispatch(fetchNewMessageFailure(err));
          reject(err);
        });
    });
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
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(fetchMsgBody(messageId));
    const { mail } = getState();
    const isUnread = mail.messages?.byId[messageId]?.unread;

    return new Promise((resolve, reject) => {
      Mail.getMessagebyId(messageId)
        .then(email => {
          if (isUnread) {
            if (email.aliasId !== null) {
              dispatch(updateAliasCount(email.aliasId, -1));
            } else {
              dispatch(updateFolderCount(email.folderId, -1));
            }
          }

          dispatch(fetchMsgBodySuccess(email));
          return resolve(email);
        })
        .catch(err => {
          dispatch(fetchMsgBodyFailure(err));
          return reject(err);
        });
    });
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
export const msgSelectionFlowSuccess = (id: string, folderId: number) => {
  return {
    type: MSG_SELECTION_FLOW_SUCCESS,
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

export const messageSelection = (message: MailMessageType) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(msgSelectionFlow(message.emailId, message.folderId));

    dispatch(msgSelectionFlowSuccess(message.emailId, message.folderId));
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
  folderId: number,
  messages: MailMessageType[]
) => {
  return {
    type: FOLDER_SELECTION_FLOW_SUCCESS,
    index,
    folderId,
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

export const folderSelection = (
  folderIndex: number,
  searchList: any[] = []
) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(folderSelectionFlow(folderIndex));

    const { mail, globalState } = getState();
    const foldersArray = mail.folders.allIds;
    const newFolderId = foldersArray[folderIndex];
    const activeMsgIdObj = globalState.activeMsgId;

    if (searchList.length === 0) {
      return new Promise((resolve, reject) => {
        dispatch(fetchFolderMessages(newFolderId))
          .then(messages => {
            dispatch(
              folderSelectionFlowSuccess(folderIndex, newFolderId, messages)
            );
            return resolve();
          })
          .catch(err => {
            return reject(err);
          });
      });
    }

    return new Promise((resolve, reject) => {
      dispatch(
        folderSelectionFlowSuccess(folderIndex, newFolderId, searchList)
      );
      return resolve();
    });
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
  namespaces: NamespaceType[],
  aliases: AliasesType[],
  activeFolderId: number,
  messages: MailMessageType[]
) => {
  return {
    type: FETCH_MAIL_DATA_SUCCESS,
    mailboxes,
    activeMailboxId,
    folders,
    namespaces,
    aliases,
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

export const loadMailboxes = () => async (
  dispatch: Dispatch,
  getState: GetState
) => {
  dispatch(fetchDataRequest());
  const {
    globalState: {
      activeMailboxIndex,
      activeFolderIndex,
      activeAliasIndex,
      activeMsgId: activeMsgIdObj
    }
  } = getState();

  let mailboxes;
  let folders;
  let aliases;
  let namespaces;
  let messages;
  let activeMailboxId;
  let activeFolderId;
  let activeAliasId;

  const isAlias = activeAliasId !== undefined && activeAliasIndex !== null;

  // try {
  dispatch(fetchMailboxes()).then(mailboxes => {
    console.log('MAILBOXES', mailboxes);
    console.log('activeMailboxIndex', activeMailboxIndex);

    activeMailboxId = mailboxes[activeMailboxIndex].mailboxId;

    console.log('activeMailboxId', activeMailboxId);

    dispatch(fetchMailboxFolders(activeMailboxId)).then(_folders => {
      console.log('folders', _folders);
      folders = _folders;

      dispatch(fetchMailboxNamespaces(activeMailboxId)).then(
        async _namespaces => {
          namespaces = _namespaces;
          const namespaceKeys = namespaces.map(ns => ns.name);

          if (namespaceKeys.length > 0) {
            aliases = await dispatch(fetchMailboxAliases(namespaceKeys));
          } else {
            aliases = [];
          }

          if (isAlias) {
            activeAliasId = aliases[activeAliasIndex].folderId;
            messages = await dispatch(fetchAliasMessages(activeAliasId));
          } else {
            activeFolderId = folders[activeFolderIndex].folderId;
            messages = await dispatch(fetchFolderMessages(activeFolderId));
          }

          console.log('MESSAGES', messages);

          dispatch(
            fetchDataSuccess(
              mailboxes,
              activeMailboxId,
              folders,
              namespaces,
              aliases,
              activeFolderId,
              messages
            )
          );

          return { mailboxes, folders, messages, namespaces, aliases };
        }
      );
    });
  });
};

// ALL BELOW SHOULD BE PLACE IN THE global.ts actions file
export const HIGHLIGHT_SEARCH_QUERY = 'GLOBAL::HIGHLIGHT_SEARCH_QUERY';
export const setHighlightValue = (query: string) => {
  return {
    type: HIGHLIGHT_SEARCH_QUERY,
    searchQuery: query
  };
};

export const SET_SEARCH_FILTER = 'GLOBAL::SET_SEARCH_FILTER';
export const setSearchFilter = (payload: boolean) => {
  return {
    type: SET_SEARCH_FILTER,
    payload
  };
};

export const CLEAR_SEARCH_FILTER = 'GLOBAL::CLEAR_SEARCH_FILTER';
export const clearSearchFilter = () => {
  return {
    type: CLEAR_SEARCH_FILTER
  };
};

export const selectSearch = (
  payload: any,
  msg: MailMessageType,
  searchQuery: string
): ((dispatch: Dispatch, getState: GetState) => Promise<void>) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    const {
      mail: {
        folders: { allIds: foldersAllIds },
        aliases: { allIds: aliasAllIds }
      },
      globalState: { editorIsOpen }
    } = getState();

    const isAlias = payload.aliasId !== null && payload.name !== 'Trash';
    if (isAlias) {
      const aliasIndex = aliasAllIds.indexOf(payload.aliasId);
      await dispatch(aliasSelection(aliasIndex, payload.messages));
    } else {
      const folderIndex = foldersAllIds.indexOf(payload.folderId);
      await dispatch(folderSelection(folderIndex, payload.messages));
    }

    dispatch(setSearchFilter(true));
    await dispatch(setHighlightValue(searchQuery));

    // If we actually select a specific message and not just a folder.
    if (msg !== null) {
      // const selected = {
      //   startIdx: index,
      //   endIdx: index,
      //   exclude: [],
      //   items: [message.id]
      // };

      if (editorIsOpen) {
        ipcRenderer.send('RENDERER::closeComposerWindow', {
          action: 'save',
          reloadDb: true
        });
      }
      dispatch(messageSelection(msg));
      // dispatch(selectMessageRange(selected, message.folderId));
    }
  };
};
// END OF WHAT SHOULD BE MOVED TO OTHER FILE.
