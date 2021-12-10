import { MailType, MailAction } from '../types';

const initialState = {
  byId: {},
  allIds: []
};

export default function folders(
  state: MailType = initialState,
  action: MailAction
) {
  switch (action.type) {
    default:
      return { ...state };
  }
}
