import {
  FETCH_MAIL_DATA_SUCCESS,
  SAVE_INCOMING_MESSAGES_SUCCESS,
  MSG_SELECTION_FLOW_SUCCESS,
  FOLDER_SELECTION_FLOW_SUCCESS,
  FETCH_MORE_FOLDER_MESSAGES_SUCCESS
} from '../../actions/mail';
import {
  SAVE_SENT_MESSAGE_SUCCESS,
  REMOVE_MESSAGE_SUCCESS,
  MARK_UNREAD_SUCCESS,
  UPDATE_MESSAGE_LIST
} from '../../actions/mailbox/messages';

import {
  ALIAS_SELECTION_FLOW_SUCCESS,
  FETCH_MORE_ALIAS_MESSAGES_SUCCESS
} from '../../actions/mailbox/aliases';
import { MailType, MailAction } from '../types';
import { arrayToObject, idFromArrayDict } from '../../../utils/reducer.util';

const initialState = {
  byId: {},
  allIds: [],
  loading: false
};

export default function messages(
  state: MailType = initialState,
  action: MailAction
) {
  let _byId;
  let _allIds;
  switch (action.type) {
    case MSG_SELECTION_FLOW_SUCCESS:
      console.log('ACTION ::: ', action)
      
      if (action.message) {
        console.log({
          ...state,
          byId: {
            ...state.byId,
            [action.message.emailId]: { ...action.message }
          }
        })
        return {
          ...state,
          byId: {
            ...state.byId,
            [action.message.emailId]: { ...action.message }
          }
        };
      }
      console.log('RETURN STATE')
      return { ...state };
    case MARK_UNREAD_SUCCESS:
      if (action.id) {
        return {
          ...state,
          byId: {
            ...state.byId,
            [action.id]: { ...state.byId[action.id], unread: true }
          }
        };
      }
      return { ...state };
    case SAVE_INCOMING_MESSAGES_SUCCESS:
    case SAVE_SENT_MESSAGE_SUCCESS:
      // checking for undefined to satisfy TS requirement.
      if (action.messages !== undefined && action.messages.length > 0) {
        let messageArr = [];

        const msg = action.messages.filter(
          m => m.folderId === action.activeFolderId
        );

        if (msg.length) {
          messageArr = [...msg];

          for (const key in state.byId) {
            messageArr.push(state.byId[key]);
          }

          const sortedMessages = messageArr.sort((a, b) => b.date - a.date);

          return {
            ...state,
            byId: {
              ...arrayToObject(sortedMessages, 'emailId')
            },
            allIds: [...idFromArrayDict(sortedMessages, 'emailId')]
          };
        }
      }
      return { ...state };
    case REMOVE_MESSAGE_SUCCESS:
      const byId = { ...state.byId };
      delete byId[action.payload.id];

      return {
        ...state,
        byId,
        allIds: [...state.allIds].filter(id => id !== action.payload.id)
      };

    case FETCH_MAIL_DATA_SUCCESS:
    case FOLDER_SELECTION_FLOW_SUCCESS:
    case ALIAS_SELECTION_FLOW_SUCCESS:
      return {
        ...state,
        byId: {
          ...arrayToObject(action.messages, 'emailId')
        },
        allIds: [...idFromArrayDict(action.messages, 'emailId')]
      };
    case UPDATE_MESSAGE_LIST:
      _byId = { ...state.byId };
      _allIds = [...state.allIds];

      if (
        action.messages &&
        action.updateType &&
        action.updateType === 'remove'
      ) {
        for (let i = 0; i < action.messages.length; i += 1) {
          const msgId = action.messages[i].emailId;

          delete _byId[msgId];
          _allIds = _allIds.filter(id => id !== msgId);
        }
      }

      return {
        ...state,
        byId: _byId,
        allIds: _allIds
      };
    case FETCH_MORE_FOLDER_MESSAGES_SUCCESS:
    case FETCH_MORE_ALIAS_MESSAGES_SUCCESS:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...arrayToObject(action.messages, 'emailId')
        },
        allIds: [...state.allIds, ...idFromArrayDict(action.messages, 'emailId')]
      };
    default:
      return { ...state };
  }
}
