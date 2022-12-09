import {
  FETCH_MAIL_DATA_SUCCESS,
  CREATE_LOCAL_MAILBOX_SUCCESS
} from '../../actions/mail';

import {
  UPDATE_FOLDER_COUNT,
  CREATE_NEW_FOLDER_SUCCESS,
  UPDATE_FOLDER,
  REMOVE_FOLDER
} from '../../actions/mailbox/folders';

import { MailType, MailAction } from '../types';
import { arrayToObject, idFromArrayDict } from '../../../utils/reducer.util';

// const clone = require('rfdc')();

const initialState = {
  byId: {},
  allIds: []
};

export default function folders(
  state: MailType = initialState,
  action: MailAction
) {
  let newState;
  switch (action.type) {
    case CREATE_LOCAL_MAILBOX_SUCCESS:
    case FETCH_MAIL_DATA_SUCCESS:
      return {
        byId: {
          ...arrayToObject(action.folders, 'folderId')
        },
        allIds: [...idFromArrayDict(action.folders, 'folderId')]
      };
    case CREATE_NEW_FOLDER_SUCCESS:
    case UPDATE_FOLDER:
      return {
        byId: {
          ...state.byId,
          [action.folder.folderId]: action.folder
        },
        allIds: [...new Set([...state.allIds, action.folder.folderId])]
      };
    case UPDATE_FOLDER_COUNT:
      if (action.id) {
        return {
          byId: {
            ...state.byId,
            [action.id]: {
              ...state.byId[action.id],
              count: state.byId[action.id]?.count
                ? state.byId[action.id].count + action.amount
                : action.amount
            }
          },
          allIds: [...state.allIds]
        };
      }
      return { ...state };
    case REMOVE_FOLDER:
      newState = {
        byId: { ...state.byId },
        allIds: state.allIds.filter(aid => aid !== action.payload.folderId)
      };
      delete newState.byId[action.payload.folderId];
      return newState;
    default:
      return { ...state };
  }
}
