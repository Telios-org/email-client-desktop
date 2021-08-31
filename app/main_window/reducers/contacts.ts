import {
  GET_ROLLADEX_REQUEST_SUCCESS,
  CONTACT_SAVE_REQUEST_SUCCESS,
  CONTACT_DELETION_REQUEST_SUCCESS
} from '../actions/contacts/contacts';

import { ContactsType, ContactAction } from './types';

const initialState: ContactsType = [];

export default function client(
  state: ContactsType = initialState,
  action: ContactAction
) {
  switch (action.type) {
    case GET_ROLLADEX_REQUEST_SUCCESS:
      return [...action.payload];
    case CONTACT_SAVE_REQUEST_SUCCESS: {
      const newState: ContactsType = [];
      let addition = true;
      // updating values if it's not net new
      state.forEach(c => {
        if (c.id === action.payload.id) {
          newState.push(action.payload);
          addition = false;
        } else {
          newState.push(c);
        }
      });

      // adding contact if net new
      if (addition) {
        newState.push(action.payload);
      }

      return newState;
    }
    case CONTACT_DELETION_REQUEST_SUCCESS:
      return state.filter(c => c.id !== action.id);
    default:
      return state;
  }
}
