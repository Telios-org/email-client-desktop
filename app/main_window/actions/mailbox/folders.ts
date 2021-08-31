import Mail from '../../../services/mail.service';

import { loadMailboxes } from '../mail';
import { clearActiveMessage } from './messages';

export const UPDATE_FOLDER_COUNT = 'GLOBAL::UPDATE_FOLDER_COUNT';
export const updateFolderCount = (id: number, amount: number) => {
  return {
    type: UPDATE_FOLDER_COUNT,
    id,
    amount
  };
};

export const moveMessagesToFolder = messages => {
  return async (dispatch: Dispatch) => {
    await Mail.moveMessages(messages);
    await dispatch(clearActiveMessage(messages[0].folder.fromId));
    await dispatch(loadMailboxes());
  };
};
