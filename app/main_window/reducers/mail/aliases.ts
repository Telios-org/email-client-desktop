import { arrayToObject, idFromArrayDict } from '../../utils/reducer.util';
import {
  FETCH_MAIL_DATA_SUCCESS,
  SAVE_INCOMING_MESSAGES_SUCCESS
} from '../../actions/mail';

import {
  UPDATE_ALIAS_SUCCESS,
  REGISTER_ALIAS_SUCCESS,
  REMOVE_ALIAS_SUCCESS,
  UPDATE_ALIAS_COUNT
} from '../../actions/mailbox/aliases';

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
