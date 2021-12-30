import { AccountType, Dispatch, GetState } from '../../reducers/types';
import AccountService from '../../../services/account.service';

/*
 *  Load Account Information
 */
export const LOAD_ACCOUNT_DATA = 'ACCOUNT::LOAD_ACCOUNT_DATA';
export const loadAccountData = (account: AccountType) => {
  return {
    type: LOAD_ACCOUNT_DATA,
    payload: account
  };
};

/*
 *  Updating some Account Information (i.e avatar and displayName)
 */
export const UPDATE_PROFILE_REQUEST = 'ACCOUNT::UPDATE_PROFILE_REQUEST';
export const updateProfileRequest = () => {
  return {
    type: UPDATE_PROFILE_REQUEST
  };
};

export const UPDATE_PROFILE_SUCCESS = 'ACCOUNT::UPDATE_PROFILE_SUCCESS';
export const updateProfileSuccess = (account: AccountType) => {
  return {
    type: UPDATE_PROFILE_SUCCESS,
    payload: account
  };
};

export const UPDATE_PROFILE_FAILURE = 'ACCOUNT::UPDATE_PROFILE_FAILURE';
export const updateProfileFailure = (error: Error) => {
  return {
    type: UPDATE_PROFILE_FAILURE,
    error
  };
};

export const updateProfile = (data: {
  displayName: string;
  avatar: string;
}) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(updateProfileRequest());

    const {
      account: { accountId }
    } = getState();

    try {
      // We purposefully only let this method update two parameters
      await AccountService.updateAccount({
        accountId,
        ...data
      });
    } catch (error) {
      dispatch(updateProfileFailure(error));
      return error;
    }

    dispatch(updateProfileSuccess(data));

    return 'Success';
  };
};
