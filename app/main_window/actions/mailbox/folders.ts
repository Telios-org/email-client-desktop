import Mail from '../../../services/mail.service';

export const UPDATE_FOLDER_COUNT = 'GLOBAL::UPDATE_FOLDER_COUNT';
export const updateFolderCount = (id: number, amount: number) => {

  Mail.updateFolderCount({ id, amount });

  return {
    type: UPDATE_FOLDER_COUNT,
    id,
    amount
  };
};
