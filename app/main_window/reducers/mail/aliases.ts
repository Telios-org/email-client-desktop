import { arrayToObject, idFromArrayDict } from '../../utils/reducer.util';
import {
  FETCH_MAIL_DATA_SUCCESS,
  SAVE_INCOMING_MESSAGES_SUCCESS
} from '../../actions/mail';

import {
  UPDATE_ALIAS_SUCCESS,
  REGISTER_ALIAS_SUCCESS,
  REMOVE_ALIAS_SUCCESS
} from '../../actions/mailbox/aliases';

import { UPDATE_ALIAS_COUNT } from '../../actions/mailbox/folders';

const initialState = {
  byId: {},
  allIds: [],
  fwdAddresses: [] // must have the format below
};

// const pickerData = [
//   { label: 'youri.nelson@gmail.com', value: 'youri.nelson@gmail.com' },
//   { label: 'pierre.kraus@gmail.com', value: 'pierre.kraus@gmail.com' }
// ]

export default function aliases(
  state: MailType = initialState,
  action: MailAction
) {
  let fwd;
  let uniqueFwd;
  let aliasId;
  let newState;
  switch (action.type) {
    case FETCH_MAIL_DATA_SUCCESS:
      fwd = [];

      action.aliases.forEach(el => {
        fwd.push(...el.fwdAddresses);
      });

      // we want unique strings greater than 0
      uniqueFwd = [...new Set(fwd)].filter(n => n.length > 0);

      return {
        byId: {
          ...arrayToObject(action.aliases, 'aliasId')
        },
        allIds: [...idFromArrayDict(action.aliases, 'aliasId')],
        fwdAddresses: uniqueFwd
      };
    case SAVE_INCOMING_MESSAGES_SUCCESS:
      if (action.messages !== undefined && action.messages.length > 0) {
        let messageArr = [];

        const msg = action.messages.filter(
          m => m?.aliasId === action.activeAliasId
        );

        if (msg.length) {
          messageArr = [...msg];

          // eslint-disable-next-line no-restricted-syntax
          for (const key in state.byId) {
            if ({}.hasOwnProperty.call(state.byId, key)) {
              messageArr.push(state.byId[key]);
            }
          }

          const sortedMessages = messageArr.sort((a, b) => b.date - a.date);

          return {
            ...state,
            byId: {
              ...arrayToObject(sortedMessages, 'aliasId')
            },
            allIds: [...idFromArrayDict(sortedMessages, 'aliasId')],
            fwdAddresses: [...state.fwdAddresses]
          };
        }
      }
      return { ...state };
    case REGISTER_ALIAS_SUCCESS:
      return {
        byId: {
          ...state.byId,
          [action.payload.aliasId]: {
            ...action.payload
          }
        },
        allIds: [action.payload.aliasId, ...state.allIds],
        fwdAddresses: [
          ...new Set([...state.fwdAddresses, ...action.payload.fwdAddresses])
        ]
      };
    case UPDATE_ALIAS_SUCCESS:
      aliasId = `${action.payload.namespaceName}#${action.payload.address}`;

      return {
        byId: {
          ...state.byId,
          [aliasId]: {
            ...state.byId[aliasId],
            disabled: action.payload.disabled,
            fwdAddresses: [...action.payload.fwdAddresses],
            description: action.payload.description
          }
        },
        allIds: [...state.allIds],
        fwdAddresses: [
          ...new Set([...state.fwdAddresses, ...action.payload.fwdAddresses])
        ]
      };
    case REMOVE_ALIAS_SUCCESS:
      newState = {
        byId: { ...state.byId },
        allIds: state.allIds.filter(aid => aid !== action.payload.aliasId),
        fwdAddresses: []
      };
      delete newState.byId[action.payload.aliasId];

      // Recreating the FwdAddresses Data
      fwd = [];

      newState.allIds.forEach(el => {
        fwd.push(...newState.byId[el].fwdAddresses);
      });
      // we want unique strings greater than 0
      uniqueFwd = [...new Set(fwd)].filter(n => n.length > 0);
      newState.fwdAddresses = uniqueFwd;

      return newState;

    case UPDATE_ALIAS_COUNT:
      return {
        byId: {
          ...state.byId,
          [action.id]: {
            ...state.byId[action.id],
            count: state.byId[action.id].count += action.amount
          }
        },
        allIds: [...state.allIds],
        fwdAddresses: [...state.fwdAddresses]
      };

    default:
      return { ...state };
  }
}
