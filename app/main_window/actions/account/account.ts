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
 * Updating the reference to user's plan on the Account collection. Purely acts as reference for when account is offline, does not give tangible permission to extra features.
 */
export const UPDATE_PLAN_REQUEST = 'ACCOUNT::UPDATE_PLAN_REQUEST';
export const updatePlanRequest = () => {
  return {
    type: UPDATE_PLAN_REQUEST
  };
};

export const UPDATE_PLAN_SUCCESS = 'ACCOUNT::UPDATE_PLAN_SUCCESS';
export const updatePlanSuccess = (payload: {
  accountId: string;
  plan: string;
}) => {
  return {
    type: UPDATE_PLAN_SUCCESS,
    payload
  };
};

export const UPDATE_PLAN_FAILURE = 'ACCOUNT::UPDATE_PLAN_FAILURE';
export const updatePlanFailure = (error: Error) => {
  return {
    type: UPDATE_PLAN_FAILURE,
    error
  };
};

export const updatePlan = (payload: { accountId: string; plan: string }) => {
  return async (dispatch: Dispatch) => {
    dispatch(updatePlanRequest());
    let result;

    try {
      result = await AccountService.updateAccountPlan(payload);
    } catch (error) {
      dispatch(updatePlanFailure(error));
      return {
        status: 'issue-retrieving',
        success: false,
        message: error.message
      };
    }

    dispatch(updatePlanSuccess(payload));

    return { status: 'updated', success: true };
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

// export const retrieveStats = () => {
//   return (dispatch: Dispatch) => {
//     dispatch(retrieveStatsRequest());

//     AccountService.retrieveStats().then(result => {
//       console.log()
//       dispatch(retrieveStatsSuccess(result));
//       return result;
//     });
//   };
// };

export const retrieveStats = () => {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(retrieveStatsRequest());
    let result;
    const {
      account: { accountId, plan }
    } = getState();
    try {
      result = await AccountService.retrieveStats();
      if (plan !== result.plan) {
        dispatch(updatePlan({ accountId, plan: result.plan }));
      }
    } catch (error) {
      dispatch(retrieveStatsFailure(error));
      return {
        status: 'issue-retrieving',
        success: false,
        message: error.message
      };
    }

    dispatch(retrieveStatsSuccess(result));

    return { status: 'retrieved', success: true };
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
  mailboxId: string;
}) => {
  return async (dispatch: Dispatch) => {
    dispatch(updateAccountPasswordRequest(payload));

    try {
      await AccountService.updateAccountPassword({
        email: payload.email,
        newPass: payload.newPass
      });
    } catch (error) {
      dispatch(updateAccountPasswordFailure(error));
      return {
        status: 'issue-updating',
        success: false,
        message: error.message
      };
    }

    dispatch(updateAccountPasswordSuccess(payload));

    return { status: 'updated', success: true };
  };
};

/*
 * Regenerate a New Passphrase for the account.
 */
export const CREATE_NEW_PASSPHRASE_REQUEST =
  'ACCOUNT::CREATE_NEW_PASSPHRASE_REQUEST';
export const createNewPassphraseRequest = () => {
  return {
    type: CREATE_NEW_PASSPHRASE_REQUEST
  };
};

export const CREATE_NEW_PASSPHRASE_SUCCESS =
  'ACCOUNT::CREATE_NEW_PASSPHRASE_SUCCESS';
export const createNewPassphraseSuccess = (payload: { mnemonic: string }) => {
  return {
    type: CREATE_NEW_PASSPHRASE_SUCCESS,
    payload
  };
};

export const CREATE_NEW_PASSPHRASE_FAILURE =
  'ACCOUNT::CREATE_NEW_PASSPHRASE_FAILURE';
export const createNewPassphraseFailure = (error: Error) => {
  return {
    type: CREATE_NEW_PASSPHRASE_FAILURE,
    error
  };
};

export const createNewPassphrase = () => {
  return async (dispatch: Dispatch) => {
    dispatch(createNewPassphraseRequest());
    let mnemonic;

    try {
      mnemonic = await AccountService.createNewPassphrase();
    } catch (error) {
      dispatch(createNewPassphraseFailure(error));
      return {
        status: 'issue-updating',
        success: false,
        message: error.message
      };
    }

    dispatch(createNewPassphraseSuccess({ mnemonic }));

    return { status: 'updated', success: true, data: { mnemonic } };
  };
};
