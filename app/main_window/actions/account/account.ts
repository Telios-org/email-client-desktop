import { AccountType, Dispatch, GetState } from '../../reducers/types';
import AccountService from '../../../services/account.service';
import MailboxService from '../../../services/mail.service';

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
export const updateProfileSuccess = (
  account: AccountType,
  mailboxId: string
) => {
  return {
    type: UPDATE_PROFILE_SUCCESS,
    payload: { ...account, mailboxId }
  };
};

export const UPDATE_PROFILE_FAILURE = 'ACCOUNT::UPDATE_PROFILE_FAILURE';
export const updateProfileFailure = (error: Error) => {
  return {
    type: UPDATE_PROFILE_FAILURE,
    error
  };
};

export const updateProfile = (
  data: {
    displayName: string;
    avatar: string;
  },
  localOnly = false
) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(updateProfileRequest());

    const {
      account: { accountId },
      mail: {
        mailboxes: { allIds }
      }
    } = getState();

    if (!localOnly) {
      try {
        // console.log('PROFILE DATA', data, allIds[0]);
        // We purposefully only let this method update two parameters
        await AccountService.updateAccount({
          accountId,
          ...data
        });

        // We want to change the Display Name of the primary mailbox at the same time.
        await MailboxService.updateMailboxName(allIds[0], data.displayName);
      } catch (error) {
        dispatch(updateProfileFailure(error));
        return error;
      }
    }

    dispatch(updateProfileSuccess(data, allIds[0]));

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
  return (dispatch: Dispatch) => {
    dispatch(retrieveStatsRequest());

    AccountService.retrieveStats().then(result => {
      dispatch(retrieveStatsSuccess(result));
      return result;
    });
  };
};

/*
 * Updating the Account password while user is logged in.
 */
export const UPDATE_PASSWORD_REQUEST = 'ACCOUNT::UPDATE_PASSWORD_REQUEST';
export const updateAccountPasswordRequest = () => {
  return {
    type: UPDATE_PASSWORD_REQUEST
  };
};

export const UPDATE_PASSWORD_SUCCESS = 'ACCOUNT::UPDATE_PASSWORD_SUCCESS';
export const updateAccountPasswordSuccess = (payload: {
  email: string;
  newPass: string;
}) => {
  return {
    type: UPDATE_PASSWORD_SUCCESS,
    payload
  };
};

export const UPDATE_PASSWORD_FAILURE = 'ACCOUNT::UPDATE_PASSWORD_FAILURE';
export const updateAccountPasswordFailure = (error: Error) => {
  return {
    type: UPDATE_PASSWORD_FAILURE,
    error
  };
};

export const updateAccountPassword = (payload: {
  email: string;
  newPass: string;
}) => {
  return async (dispatch: Dispatch) => {
    dispatch(updateAccountPasswordRequest(payload));
    let result;

    try {
      const results = await AccountService.updateAccountPassword(payload);
    } catch (error) {
      dispatch(updateAccountPasswordFailure(error));
      return {
        status: 'issue-updating',
        success: false,
        message: error.message
      };
    }

    dispatch(updateAccountPasswordSuccess(payload));

    return { status: 'updateed', success: true };
  };
};
