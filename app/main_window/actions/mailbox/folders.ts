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

export const UPDATE_ALIAS_COUNT = 'GLOBAL::UPDATE_ALIAS_COUNT';
export const updateAliasCount = (id: string, amount: number) => {

  Mail.updateAliasCount({ id, amount });

  return {
    type: UPDATE_ALIAS_COUNT,
    id,
    amount
  };
};
