/* eslint import/no-cycle: [2, { ignoreExternal: true }] */
import { AiOutlineConsoleSql } from 'react-icons/ai';
import { updateFolderCount } from './folders';
import { updateAliasCount } from './aliases';

import { toggleEditor } from '../global';

import Mail from '../../../services/mail.service';
import {
  Dispatch,
  GetState,
  Email,
  MailMessageType,
  Recipients
} from '../../reducers/types';

import { activeFolderId } from '../../selectors/mail';

export const SAVE_SENT_MESSAGE = 'MESSAGES::SAVE_SENT_MESSAGE';
export const initiateSaveSent = () => {
  return {
    type: SAVE_SENT_MESSAGE
  };
};

export const SAVE_SENT_MESSAGE_SUCCESS = 'MESSAGES::SAVE_SENT_MESSAGE_SUCCESS';
export const saveSentSuccess = (
  messages: MailMessageType[],
  activeFolder: number
) => {
  return {
    type: SAVE_SENT_MESSAGE_SUCCESS,
    messages,
    activeFolder
  };
};

export const SAVE_SENT_MESSAGE_FAILURE = 'MESSAGES::SAVE_SENT_MESSAGE_FAILURE';
export const saveSentFailure = (error: string) => {
  return {
    type: SAVE_SENT_MESSAGE_FAILURE,
    error
  };
};

export const saveSentMessage = (email: Email) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(initiateSaveSent());
    let msg;
    const {
      globalState: { activeFolderIndex },
      mail: {
        folders: { allIds: foldersArray }
      }
    } = getState();
    try {
      msg = await Mail.save({ messages: [email], type: 'Sent', sync: true });
    } catch (error) {
      dispatch(saveSentFailure(error));
      return error;
    }

    dispatch(saveSentSuccess(msg, foldersArray[activeFolderIndex]));
    return 'success';
  };
};

// ASYNC SEND EMAIL W/ TELIOS-SDK
export const SEND_MESSAGE = 'MESSAGES::SEND_MESSAGE';
export const initiateSending = (payload: Email) => {
  return {
    type: SEND_MESSAGE,
    payload
  };
};

export const SEND_MESSAGE_SUCCESS = 'MESSAGES::SEND_MESSAGE_SUCCESS';
export const messageSendingSuccess = () => {
  return {
    type: SEND_MESSAGE_SUCCESS
  };
};

export const SEND_MESSAGE_FAILURE = 'MESSAGES::SEND_MESSAGE_FAILURE';
export const messageSendingFailure = (error: string) => {
  return {
    type: SEND_MESSAGE_FAILURE,
    error
  };
};

export const sendMessage = (email: Email) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    const { client, globalState } = getState();
    dispatch(initiateSending(email));

    try {
      await Mail.send(email, client.secretBoxPrivKey, client.secretBoxPubKey);
      await dispatch(saveSentMessage(email));
    } catch (error) {
      dispatch(messageSendingFailure(error));
      return error;
    }

    dispatch(messageSendingSuccess());
    return 'success';
  };
};

// NOT CURRENTLY BEING USED
export const REMOVE_MESSAGE = 'MESSAGES::REMOVE_MESSAGE';
export const initiateRemoveMessage = () => {
  return {
    type: REMOVE_MESSAGE
  };
};

// NOT CURRENTLY BEING USED
export const REMOVE_MESSAGE_SUCCESS = 'MESSAGES::REMOVE_SUCCESS';
export const removeMessageSuccess = (id: number, folderId: number) => {
  return {
    type: REMOVE_MESSAGE_SUCCESS,
    payload: {
      id,
      folderId
    }
  };
};

// NOT CURRENTLY BEING USED
export const REMOVE_MESSAGE_FAILURE = 'MESSAGES::REMOVE_FAILURE';
export const removeMessageFailure = (error: string) => {
  return {
    type: REMOVE_MESSAGE_FAILURE,
    error
  };
};

// NOT CURRENTLY BEING USED because choice was made to reload all messages upon delete instead
// May need to switch to the redux method later.
export const removeMessage = (id: number, folderId: number) => {
  return async (dispatch: Dispatch) => {
    dispatch(initiateRemoveMessage());
    try {
      await Mail.removeMessages(id);
      await dispatch(removeMessageSuccess(id, folderId));
    } catch (error) {
      dispatch(removeMessageFailure(error));
      return error;
    }

    dispatch(removeMessageSuccess(id, folderId));
    return 'success';
  };
};

export const MARK_UNREAD = 'MESSAGES::MARK_UNREAD';
export const initiateMarkAsUnread = (id: number) => {
  return {
    type: MARK_UNREAD,
    id
  };
};

export const MARK_UNREAD_SUCCESS = 'MESSAGES::MARK_UNREAD_SUCCESS';
export const markAsUnreadSuccess = (id: number) => {
  return {
    type: MARK_UNREAD_SUCCESS,
    id
  };
};

export const MARK_UNREAD_FAILURE = 'MESSAGES::MARK_UNREAD_FAILURE';
export const markAsUnreadFailure = (error: string) => {
  return {
    type: MARK_UNREAD_FAILURE,
    error
  };
};

export const markAsUnread = (id: number, folderId: number) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(initiateMarkAsUnread(id));

    try {
      if (folderId === 5) {
        const { mail, globalState } = getState();
        const aliasId = mail.aliases.allIds[globalState.activeAliasIndex];

        await Mail.markAsUnread(id);
        await dispatch(updateAliasCount(aliasId, 1));
      } else {
        await Mail.markAsUnread(id);
        await dispatch(updateFolderCount(folderId, 1));
      }
    } catch (error) {
      dispatch(markAsUnreadFailure(error));
      return error;
    }

    dispatch(clearActiveMessage(folderId));
    return dispatch(markAsUnreadSuccess(id));
  };
};

export const CLEAR_ACTIVE_MESSAGE = 'MESSAGES::CLEAR_ACTIVE_MESSAGE';
export const clearActiveMessage = (folderId: number) => {
  return {
    type: CLEAR_ACTIVE_MESSAGE,
    folderId
  };
};

export const replyMessage = (isReplyAll: boolean) => {
  const all = !!isReplyAll;
  const editorAction = all ? 'replyAll' : 'reply';

  return async (dispatch: Dispatch, getState: GetState) => {
    const state = getState();
    const folderId = activeFolderId(state);

    await dispatch(clearActiveMessage(folderId));
    dispatch(toggleEditor(editorAction, true));
  };
};

export const forwardMessage = () => {
  return async (dispatch: Dispatch, getState: GetState) => {
    const state = getState();
    const folderId = activeFolderId(state);

    await dispatch(clearActiveMessage(folderId));
    dispatch(toggleEditor('forward', true));
  };
};

export const UPDATE_MESSAGE_LIST = 'MESSAGES::UPDATE_MESSAGE_LIST';
export const updateMessageList = (messages: any, updateType: string) => {
  return {
    type: UPDATE_MESSAGE_LIST,
    messages,
    updateType
  };
};

export const moveMessagesToFolder = (messages: any) => {
  return async (dispatch: Dispatch) => {
    let currentFolderId = 0;

    const msgArr = messages.map((msg: any) => {
      if (!currentFolderId) {
        currentFolderId = msg.folder.fromId;
      }
      return msg;
    });
    try {
      dispatch(clearActiveMessage(currentFolderId));
      dispatch(updateMessageList(msgArr, 'remove'));
      await Mail.moveMessages(msgArr);
    } catch (error) {
      console.log(error);
    }
  };
};
