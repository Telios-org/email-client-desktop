import {
  FETCH_MAIL_DATA_SUCCESS,
  SAVE_INCOMING_MESSAGES_SUCCESS,
  MSG_SELECTION_FLOW_SUCCESS,
  MSG_SELECTION_FLOW,
  FOLDER_SELECTION_FLOW_SUCCESS
} from '../../actions/mail';
import {
  SAVE_SENT_MESSAGE_SUCCESS,
  REMOVE_MESSAGE_SUCCESS,
  MARK_UNREAD_SUCCESS
} from '../../actions/mailbox/messages';
import { MailType, MailAction } from '../types';
import { arrayToObject, idFromArrayDict } from '../../utils/reducer.util';

const initialState = {
  byId: {},
  allIds: [],
  loading: false
};

export default function messages(
  state: MailType = initialState,
  action: MailAction
) {
  switch (action.type) {
    case MSG_SELECTION_FLOW:
      return {
        ...state,
        loading: true
      };
    case MSG_SELECTION_FLOW_SUCCESS:
      if (action.message) {
        return {
          ...state,
          byId: {
            ...state.byId,
            [action.message.id]: { ...action.message }
          },
          loading: false
        };
      }
      return { ...state };
    case MARK_UNREAD_SUCCESS:
      if (action.id) {
        return {
          ...state,
          byId: {
            ...state.byId,
            [action.id]: { ...state.byId[action.id], unread: 1 }
          }
        };
      }
      return { ...state };
    case SAVE_INCOMING_MESSAGES_SUCCESS:
    case SAVE_SENT_MESSAGE_SUCCESS:
      // checking for undefined to satisfy TS requirement.
      if (action.messages !== undefined && action.messages.length > 0) {
        const msg = action.messages.filter(
          m => m.folderId === action.activeFolderId
        );
        return {
          ...state,
          byId: {
            ...state.byId,
            ...arrayToObject(msg)
          },
          allIds: [...idFromArrayDict(msg), ...state.allIds]
        };
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
      return {
        ...state,
        byId: {
          ...arrayToObject(action.messages)
        },
        allIds: [...idFromArrayDict(action.messages)]
      };
    default:
      return { ...state };
  }
}
