import Mail from '../../../services/mail.service';

import { Dispatch, GetState, FolderType } from '../../reducers/types';

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
  const exceptions = [2, 4];

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
    if (currCount < 0) {
      if (amount > 0) {
        change = Math.abs(currCount) + amount;
      } else {
        change = Math.abs(currCount);
      }
    }

    if (exceptions.indexOf(id) === -1) {
      Mail.updateFolderCount({ id, amount: change });
      dispatch(updateCount(id, change));
    }
  };
};

export const CREATE_NEW_FOLDER_REQUEST = 'FOLDER::CREATE_NEW_FOLDER_REQUEST';
export const createNewFolder = () => {
  return {
    type: CREATE_NEW_FOLDER_REQUEST
  };
};

export const CREATE_NEW_FOLDER_SUCCESS = 'FOLDER::CREATE_NEW_FOLDER_SUCCESS';
export const createNewFolderSuccess = (folder: FolderType) => {
  return {
    type: CREATE_NEW_FOLDER_SUCCESS,
    folder
  };
};

export const CREATE_NEW_FOLDER_FAILURE = 'FOLDER::CREATE_NEW_FOLDER_FAILURE';
export const createNewFolderFailure = (error: Error) => {
  return {
    type: CREATE_NEW_FOLDER_FAILURE,
    error
  };
};

export const createFolder = (
  mailboxId: number,
  name: string,
  type: string,
  icon: string
) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(createNewFolder());

    const {
      mail: { folders }
    } = getState();

    try {
      const folder = await Mail.createFolder({
        mailboxId,
        name,
        type,
        icon,
        seq: folders.allIds.length + 1
      });

      await dispatch(createNewFolderSuccess(folder));
      return folder;
    } catch (error) {
      dispatch(createNewFolderFailure(error));
    }
  };
};
