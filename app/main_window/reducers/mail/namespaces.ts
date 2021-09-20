import { arrayToObject, idFromArrayDict } from '../../utils/reducer.util';
import { FETCH_MAIL_DATA_SUCCESS } from '../../actions/mail';

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
          ...arrayToObject(action.namespaces, 'namespaceKey')
        },
        allIds: [...idFromArrayDict(action.namespaces)]
      };
    default:
      return { ...state };
  }
}
