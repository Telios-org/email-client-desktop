import { DomainsType, DomainAction } from './types';
import { ADD_DOMAIN_SUCCESS } from '../actions/domains/domains';
import { arrayToObject, idFromArrayDict } from '../../utils/reducer.util';

const initialState: DomainsType = {
  byId: {},
  allIds: []
};

export default function client(
  state: DomainsType = initialState,
  action: DomainAction
) {
  switch (action.type) {
    case ADD_DOMAIN_SUCCESS:
      return {
        byId: {
          ...state.byId,
          ...arrayToObject([action.payload], 'name')
        },
        allIds: [...state.allIds, ...idFromArrayDict([action.payload], 'name')]
      };
    default:
      return state;
  }
}
