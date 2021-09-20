import { arrayToObject, idFromArrayDict } from '../../utils/reducer.util';
import { FETCH_MAIL_DATA_SUCCESS } from '../../actions/mail';

const initialState = {
  byId: {},
  allIds: []
};

export default function aliases(
  state: MailType = initialState,
  action: MailAction
) {
  switch (action.type) {
    case FETCH_MAIL_DATA_SUCCESS:
      return {
        byId: {
          ...arrayToObject(action.aliases, 'id')
        },
        allIds: [...idFromArrayDict(action.aliases)]
      };
    default:
      return { ...state };
  }
}
