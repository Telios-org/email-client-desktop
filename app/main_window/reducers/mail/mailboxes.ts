import {
  FETCH_MAIL_DATA_SUCCESS,
  CREATE_LOCAL_MAILBOX_SUCCESS,
  GET_MAILBOXES_REQUEST_SUCCESS
} from '../../actions/mail';
import { MailType, MailAction } from '../types';
import { arrayToObject, idFromArrayDict } from '../../utils/reducer.util';

const initialState = {
  byId: {},
  allIds: []
};

export default function mailboxes(
  state: MailType = initialState,
  action: MailAction
) {
  switch (action.type) {
    case CREATE_LOCAL_MAILBOX_SUCCESS:
      return {
        byId: {
          ...state.byId,
          ...arrayToObject([action.mailbox])
        },
        allIds: [...state.allIds, ...idFromArrayDict([action.mailbox])]
      };
    case FETCH_MAIL_DATA_SUCCESS: {
      const newMailboxesObj = arrayToObject(action.mailboxes);

      return {
        byId: {
          ...newMailboxesObj,
          [action.activeMailboxId]: {
            ...newMailboxesObj[action.activeMailboxId],
            folders: action.folders?.map(fd => fd.id)
          }
        },
        allIds: [...idFromArrayDict(action.mailboxes)]
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
