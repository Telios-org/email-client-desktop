import { ActionUnionType, GlobalType } from './types';
import {
  MAILBOX_REGISTRATION,
  /**
  MAILBOX_REGISTRATION_SUCCESS
  Ignoring this one as we don't want to change the
  loading indicator until the mailbox is created locally.
   */
  MAILBOX_REGISTRATION_FAILURE,
  CREATE_LOCAL_MAILBOX,
  CREATE_LOCAL_MAILBOX_FAILURE,
  CREATE_LOCAL_MAILBOX_SUCCESS,
  FETCH_MAIL_DATA_SUCCESS,
  // GET_FOLDER_MESSAGES_REQUEST_SUCCESS,
  FETCH_MAIL_DATA_FAILURE,
  MSG_SELECTION_FLOW_SUCCESS,
  SHOW_MAXIMIZED_MESSAGE_DISPLAY,
  FOLDER_SELECTION_FLOW_SUCCESS,
  HIGHLIGHT_SEARCH_QUERY,
  MSG_RANGE_SELECTION
} from '../actions/mail';

import {
  REMOVE_MESSAGE_SUCCESS,
  CLEAR_ACTIVE_MESSAGE
} from '../actions/mailbox/messages';

import { TOGGLE_EDITOR, UPDATE_NETWORK_STATUS } from '../actions/global';

const initialState = {
  activeMsgId: {},
  // activeSelectedRange: {
  //   startIdx: null,
  //   endIdx: null,
  //   exclude: [],
  //   items: []
  // },
  // This denote the index of the allIds array in mailboxes
  // NOT THE ID
  activeMailboxIndex: 0,
  activeAccountIndex: 0,
  // This denote the index of the allIds array in folders
  // NOT THE ID
  activeFolderIndex: 0,
  loading: false,
  status: 'online',
  error: '',
  editorIsOpen: false,
  editorAction: '',
  highlightText: '',
  // This below is to indicate the Message Display take the room of the Message List, it is not currently implemented.
  showMaximizedMessageDisplay: false,
  accounts: []
};

const globalState = (
  state: GlobalType = initialState,
  action: ActionUnionType
) => {
  switch (action.type) {
    case MAILBOX_REGISTRATION:
    case CREATE_LOCAL_MAILBOX:
    case FETCH_MAIL_DATA_SUCCESS:
    case CREATE_LOCAL_MAILBOX_SUCCESS:
    case MAILBOX_REGISTRATION_FAILURE:
    case CREATE_LOCAL_MAILBOX_FAILURE:
    case FETCH_MAIL_DATA_FAILURE:
      return {
        ...state,
        error: action.error,
        loading: false,
        editorIsOpen: false
        // activeMsgId: null
      };

    case MSG_RANGE_SELECTION:
      return {
        ...state,
        editorIsOpen: false,
        activeMsgId: {
          ...state.activeMsgId,
          [action.folderId]: {
            ...state.activeMsgId[action.folderId],
            selected: action.payload
          }
        }
      };

    case MSG_SELECTION_FLOW_SUCCESS:
      return {
        ...state,
        editorIsOpen: false,
        activeMsgId: {
          ...state.activeMsgId,
          [action.folderId]: {
            id: action.id
            // selected: {
            //   startIdx: null,
            //   endIdx: null,
            //   exclude: [],
            //   items: []
            // }
          }
        }
      };
    case REMOVE_MESSAGE_SUCCESS:
      return {
        ...state,
        editorIsOpen: false,
        activeMsgId: {
          ...state.activeMsgId,
          [action.folderId]: {
            id: null
            // selected: {
            //   startIdx: null,
            //   endIdx: null,
            //   exclude: [],
            //   items: []
            // }
          }
        }
      };
    case FOLDER_SELECTION_FLOW_SUCCESS:
      return {
        ...state,
        highlightText: '',
        activeFolderIndex: action.index
      };

    case TOGGLE_EDITOR: {
      let newVal;

      if (action.forcedStatus === undefined) {
        newVal = !state.editorIsOpen;
      } else {
        newVal = action.forcedStatus;
      }

      const newState = {
        ...state,
        editorIsOpen: newVal
      };

      if (!newVal) {
        newState.editorAction = '';
      } else {
        newState.editorAction = action.editorAction;
      }

      return newState;
    }
    case SHOW_MAXIMIZED_MESSAGE_DISPLAY:
      return {
        ...state,
        showMaximizedMessageDisplay: action.showMaximizedMessageDisplay
      };

    case CLEAR_ACTIVE_MESSAGE:
      return {
        ...state,
        activeMsgId: {
          ...state.activeMsgId,
          [action.folderId]: {
            id: null
          }
        },
        highlightText: '',
        showMaximizedMessageDisplay: false
      };

    case HIGHLIGHT_SEARCH_QUERY:
      return {
        ...state,
        highlightText: action.searchQuery
      };
    case UPDATE_NETWORK_STATUS:
      return {
        ...state,
        status: action.status
      };
    default:
      return state;
  }
};

export default globalState;
