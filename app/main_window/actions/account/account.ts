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

/*
 *  This action is to retrieve the Account stats from the server and store them locally for use in the Settings Page.
 */
export const RETRIEVE_STATS_REQUEST = 'ACCOUNT::RETRIEVE_STATS_REQUEST';
export const retrieveStatsRequest = () => {
  return {
    type: RETRIEVE_STATS_REQUEST
  };
};

export const RETRIEVE_STATS_SUCCESS = 'ACCOUNT::RETRIEVE_STATS_SUCCESS';
export const retrieveStatsSuccess = payload => {
  return {
    type: RETRIEVE_STATS_SUCCESS,
    payload
  };
};

export const RETRIEVE_STATS_FAILURE = 'ACCOUNT::RETRIEVE_STATS_FAILURE';
export const retrieveStatsFailure = (error: Error) => {
  return {
    type: RETRIEVE_STATS_FAILURE,
    error
  };
};

export const retrieveStats = () => {
  return async (dispatch: Dispatch) => {
    dispatch(retrieveStatsRequest());
    let result;

    try {
      result = await AccountService.retrieveStats();
      console.log('ACCOUNT STATS', result);
    } catch (error) {
      dispatch(retrieveStatsFailure(error));
      return error;
    }

    dispatch(retrieveStatsSuccess(result));

    return result;
  };
};
