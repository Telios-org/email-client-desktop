import {
  FETCH_MAIL_DATA_SUCCESS,
  CREATE_LOCAL_MAILBOX_SUCCESS  
} from '../../actions/mail';

import {
  UPDATE_FOLDER_COUNT,
  CREATE_NEW_FOLDER_SUCCESS
} from '../../actions/mailbox/folders';

import { MailType, MailAction } from '../types';
import { arrayToObject, idFromArrayDict } from '../../utils/reducer.util';

// const clone = require('rfdc')();

const initialState = {
  byId: {},
  allIds: []
};

export default function folders(
  state: MailType = initialState,
  action: MailAction
) {
  switch (action.type) {
    case CREATE_LOCAL_MAILBOX_SUCCESS:
    case FETCH_MAIL_DATA_SUCCESS:
      return {
        byId: {
          ...arrayToObject(action.folders, 'id')
        },
        allIds: [...idFromArrayDict(action.folders)]
      };
    case CREATE_NEW_FOLDER_SUCCESS:
      return {
        byId: {
          ...state.byId,
          [action.folder.id]: action.folder
        },
        allIds: [...state.allIds, action.folder.id]
      };
    case UPDATE_FOLDER_COUNT:
      if (action.id) {
        return {
          byId: {
            ...state.byId,
            [action.id]: {
              ...state.byId[action.id],
              count: state.byId[action.id].count + action.amount
            }
          },
          allIds: [...state.allIds]
        };
      }
      return { ...state };
    default:
      return { ...state };
  }
}
