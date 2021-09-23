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
      console.log(
        'DICT TO ARRAY',
        action.namespaces,
        idFromArrayDict(action.namespaces, 'namespaceKey')
      );
      return {
        byId: {
          ...arrayToObject(action.namespaces, 'namespaceKey')
        },
        allIds: [...idFromArrayDict(action.namespaces, 'namespaceKey')]
      };
    case REGISTER_NAMESPACE_SUCCESS:
      console.log(
        'DICT TO ARRAY2',
        action.paylod,
        idFromArrayDict([action.payload], 'namespaceKey')
      );
      return {
        byId: {
          ...state.byId,
          ...arrayToObject([action.payload], 'namespaceKey')
        },
        allIds: [
          ...state.allIds,
          ...idFromArrayDict([action.payload], 'namespaceKey')
        ]
      };

    default:
      return { ...state };
  }
}
