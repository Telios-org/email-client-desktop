import {
  FETCH_MAIL_DATA_SUCCESS,
  GET_MAILBOXES_REQUEST_SUCCESS
} from '../../actions/mail';
import {
  REGISTER_MAILBOX_SUCCESS,
  DELETE_MAILBOX_SUCCESS
} from '../../actions/domains/domains';
import {
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PASSWORD_SUCCESS
} from '../../actions/account/account';
import { MailType, MailAction } from '../types';
import { arrayToObject, idFromArrayDict } from '../../../utils/reducer.util';

const initialState = {
  byId: {},
  allIds: []
};

export default function mailboxes(
  state: MailType = initialState,
  action: MailAction
) {
  let newState;
  switch (action.type) {
    case REGISTER_MAILBOX_SUCCESS:
      return {
        byId: {
          ...state.byId,
          ...arrayToObject([action.mailbox])
        },
        allIds: [...state.allIds, ...idFromArrayDict([action.mailbox])]
      };

    case DELETE_MAILBOX_SUCCESS:
      newState = {
        byId: { ...state.byId },
        allIds: state.allIds.filter(aid => aid !== action.payload.id)
      };
      delete newState.byId[action.payload.id];
      return newState;

    case FETCH_MAIL_DATA_SUCCESS: {
      const newMailboxesObj = arrayToObject(action.mailboxes);

      return {
        byId: {
          ...newMailboxesObj,
          [action.activeMailboxId]: {
            ...newMailboxesObj[action.activeMailboxId],
            folders: action.folders?.map(fd => fd.folderId)
          }
        },
        allIds: [...idFromArrayDict(action.mailboxes)]
      };
    }

    case UPDATE_PROFILE_SUCCESS: {
      return {
        byId: {
          ...state.byId,
          [action.payload.mailboxId]: {
            ...state.byId[action.payload.mailboxId],
            displayName: action.payload.displayName
          }
        },
        allIds: [...state.allIds]
      };
    }

    case UPDATE_PASSWORD_SUCCESS: {
      return {
        byId: {
          ...state.byId,
          [action.payload.mailboxId]: {
            ...state.byId[action.payload.mailboxId],
            password: action.payload.newPass
          }
        },
        allIds: [...state.allIds]
      };
    }

    // case GET_MAILBOX_FOLDERS_REQUEST_SUCCESS:
    //   if (action.id !== undefined) {
    //     return {
    //       byId: {
    //         ...state.byId,
    //         [action.id]: {
    //           ...state.byId[action.id],
    //           folders: action.folders?.map(fd => fd.id)
    //         }
    //       },
    //       allIds: [...state.allIds]
    //     };
    //   }
    //   return state;
    default:
      return { ...state };
  }
}
