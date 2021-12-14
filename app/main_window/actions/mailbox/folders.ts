import Mail from '../../../services/mail.service';

import { Dispatch, GetState } from '../../reducers/types';

export const UPDATE_FOLDER_COUNT = 'GLOBAL::UPDATE_FOLDER_COUNT';
const updateCount = (id: number, amount: number) => {
  return {
    type: UPDATE_FOLDER_COUNT,
    id,
    amount
  };
};

export const updateFolderCount = (id: number, amount: number) => {
  // Don't update folder counts for Drafs and Trash
  const exceptions = [2,4];
  
  return async (dispatch: Dispatch, getState: GetState) => {
    const {
      mail: { folders }
    } = getState();

    const currCount = folders?.byId[id].count;

    let change = amount;

    // Make sure we never go below 0
    if (amount < 0 && Math.abs(amount) > Math.abs(currCount)) {
      change = -1 * currCount;
    }

    // Self-heal if count ever gets stuck below 0
    if(currCount < 0) {
      if(amount > 0) {
        change = Math.abs(currCount) + amount;
      } else {
        change = Math.abs(currCount);
      }
    }

    if(exceptions.indexOf(id) === -1) {
      Mail.updateFolderCount({ id, amount: change });
      dispatch(updateCount(id, change));
    }
  };
};
