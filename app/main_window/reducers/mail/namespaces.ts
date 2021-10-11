import { arrayToObject, idFromArrayDict } from '../../utils/reducer.util';
import { FETCH_MAIL_DATA_SUCCESS } from '../../actions/mail';

import { REGISTER_NAMESPACE_SUCCESS } from '../../actions/mailbox/aliases';

const initialState = {
  byId: {},
  allIds: []
};

export default function namespaces(
  state: MailType = initialState,
  action: MailAction
) {
  switch (action.type) {
    case FETCH_MAIL_DATA_SUCCESS:
      return {
        byId: {
          ...arrayToObject(action.namespaces, 'name')
        },
        allIds: [...idFromArrayDict(action.namespaces, 'name')]
      };
    case REGISTER_NAMESPACE_SUCCESS:
      return {
        byId: {
          ...state.byId,
          ...arrayToObject([action.payload], 'name')
        },
        allIds: [...state.allIds, ...idFromArrayDict([action.payload], 'name')]
      };

    default:
      return { ...state };
  }
}
