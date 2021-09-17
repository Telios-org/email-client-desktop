import { arrayToObject, idFromArrayDict } from '../../utils/reducer.util';

const initialState = {
  byId: {},
  allIds: []
};

export default function aliases(
  state: MailType = initialState,
  action: MailAction
) {
  switch (action.type) {
    default:
      return { ...state };
  }
}
