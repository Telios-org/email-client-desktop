import { DomainsType, DomainAction } from './types';
import {
  ADD_DOMAIN_SUCCESS,
  FETCH_ALL_SUCCESS,
  DELETE_SUCCESS
} from '../actions/domains/domains';
import { arrayToObject, idFromArrayDict } from '../../utils/reducer.util';

const initialState: DomainsType = {
  byId: {},
  allIds: []
};

export default function client(
  state: DomainsType = initialState,
  action: DomainAction
) {
  let byId;
  switch (action.type) {
    case ADD_DOMAIN_SUCCESS:
      return {
        byId: {
          ...state.byId,
          ...arrayToObject([action.payload], 'name')
        },
        allIds: [...state.allIds, ...idFromArrayDict([action.payload], 'name')]
      };
    case FETCH_ALL_SUCCESS: {
      return {
        byId: {
          ...arrayToObject(action.payload, 'name')
        },
        allIds: [...idFromArrayDict(action.payload, 'name')]
      };
    }
    case DELETE_SUCCESS:
      byId = { ...state.byId };
      delete byId[action.payload.id];

      return {
        ...state,
        byId,
        allIds: [...state.allIds].filter(id => id !== action.payload.id)
      };
    default:
      return state;
  }
}
