import { arrayToObject, idFromArrayDict } from '../../utils/reducer.util';
import { FETCH_MAIL_DATA_SUCCESS } from '../../actions/mail';

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
  switch (action.type) {
    case FETCH_MAIL_DATA_SUCCESS:
      fwd = [];

      action.aliases.forEach(el => {
        fwd.push(...el.fwdAddresses);
      });

      uniqueFwd = [...new Set(fwd)];

      return {
        byId: {
          ...arrayToObject(action.aliases, 'aliasId')
        },
        allIds: [...idFromArrayDict(action.aliases, 'aliasId')],
        fwdAddresses: uniqueFwd
      };
    default:
      return { ...state };
  }
}
