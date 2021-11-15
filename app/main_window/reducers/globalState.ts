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
  FETCH_MAIL_DATA_FAILURE,
  MSG_SELECTION_FLOW,
  FOLDER_SELECTION_FLOW_SUCCESS,
  HIGHLIGHT_SEARCH_QUERY,
  MSG_RANGE_SELECTION,
  SET_SEARCH_FILTER,
  CLEAR_SEARCH_FILTER
} from '../actions/mail';

import {
  REMOVE_MESSAGE_SUCCESS,
  CLEAR_ACTIVE_MESSAGE
} from '../actions/mailbox/messages';

import { ALIAS_SELECTION_FLOW_SUCCESS } from '../actions/mailbox/aliases';

import {
  TOGGLE_EDITOR,
  UPDATE_NETWORK_STATUS,
  SET_MSGLIST_FILTER
} from '../actions/global';

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
  activeAliasIndex: null,
  searchFilteredMsg: [],
  msgListFilters: {},
  loading: false,
  status: 'online',
  error: '',
  editorIsOpen: false,
  editorAction: '',
  highlightText: '',
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
    case SET_MSGLIST_FILTER:
      return {
        ...state,
        msgListFilters: {
          ...state.msgListFilters,
          [action.aliasId || action.folderId]: {
            ...action.conditions
          }
        }
      };
    case MSG_SELECTION_FLOW:
      return {
        ...state,
        activeMsgId: {
          ...state.activeMsgId,
          [action.folderId]: {
            ...state.activeMsgId[action.folderId],
            id: action.id
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
          }
        }
      };
    case FOLDER_SELECTION_FLOW_SUCCESS:
      return {
        ...state,
        activeMsgId: {
          // ...state.activeMsgId,
          [action.folderId]: {
            id: null
          }
        },
        highlightText: '',
        searchFilteredMsg: [],
        activeFolderIndex: action.index,
        activeAliasIndex: null
      };

    case ALIAS_SELECTION_FLOW_SUCCESS:
      return {
        ...state,
        activeMsgId: {
          // ...state.activeMsgId,
          [action.aliasId]: {
            id: null
          }
        },
        highlightText: '',
        searchFilteredMsg: [],
        activeFolderIndex: 4,
        activeAliasIndex: action.index
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
    case CLEAR_ACTIVE_MESSAGE:
      return {
        ...state,
        activeMsgId: {
          ...state.activeMsgId,
          [action.folderId]: {
            id: null
          }
        },
        highlightText: ''
      };
    case HIGHLIGHT_SEARCH_QUERY:
      return {
        ...state,
        highlightText: action.searchQuery
      };
    case SET_SEARCH_FILTER:
      return {
        ...state,
        searchFilteredMsg: action.payload
      };
    case CLEAR_SEARCH_FILTER:
      return {
        ...state,
        searchFilteredMsg: [],
        highlightText: ''
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
