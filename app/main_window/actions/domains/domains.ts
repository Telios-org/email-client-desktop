/* eslint-disable promise/no-nesting */
import { Domain } from 'domain';
import { Dispatch, GetState } from '../reducers/types';
import DomainService from '../../../services/domain.service';

/*
 * Description
 */
export const ADD_DOMAIN_REQUEST = 'DOMAIN::ADD_DOMAIN_REQUEST';
export const addDomainRequest = () => {
  return {
    type: ADD_DOMAIN_REQUEST
  };
};

export const ADD_DOMAIN_SUCCESS = 'DOMAIN::ADD_DOMAIN_SUCCESS';
export const addDomainSuccess = payload => {
  return {
    type: ADD_DOMAIN_SUCCESS,
    payload
  };
};

export const ADD_DOMAIN_FAILURE = 'DOMAIN::ADD_DOMAIN_FAILURE';
export const addDomainFailure = (error: Error) => {
  return {
    type: ADD_DOMAIN_FAILURE,
    error
  };
};

export const addCustomDomain = (domain: string) => {
  return async (dispatch: Dispatch) => {
    dispatch(addDomainRequest());
    let result;
    try {
      result = await DomainService.register(domain);
    } catch (error) {
      dispatch(addDomainFailure(error));
      return error;
    }

    const created = {
      active: false,
      createdAt: new Date().toISOString(),
      name: domain,
      updatedAt: new Date().toISOString(),
      verified: false
    };

    dispatch(addDomainSuccess(created));

    return result;
  };
};

/*
 * Retrieve all the domains from the store
 */
export const FETCH_ALL_REQUEST = 'DOMAIN::FETCH_ALL_REQUEST';
export const fetchAllRequest = () => {
  return {
    type: FETCH_ALL_REQUEST
  };
};

export const FETCH_ALL_SUCCESS = 'DOMAIN::FETCH_ALL_SUCCESS';
export const fetchAllSuccess = payload => {
  return {
    type: FETCH_ALL_SUCCESS,
    payload
  };
};

export const FETCH_ALL_FAILURE = 'DOMAIN::FETCH_ALL_FAILURE';
export const fetchAllFailure = (error: Error) => {
  return {
    type: FETCH_ALL_FAILURE,
    error
  };
};

export const fetchAllDomains = () => {
  return async (dispatch: Dispatch) => {
    return new Promise((resolve, reject) => {
      dispatch(fetchAllRequest());
      DomainService.getAll()
        .then(result => {
          dispatch(fetchAllSuccess(result));
          return resolve(result);
        })
        .catch(err => {
          dispatch(fetchAllFailure(err));
        });
    });
  };
};

/*
 * Deleting a domain
 */
export const DELETE_REQUEST = 'DOMAIN::DELETE_REQUEST';
export const deleteRequest = () => {
  return {
    type: DELETE_REQUEST
  };
};

export const DELETE_SUCCESS = 'DOMAIN::DELETE_SUCCESS';
export const deleteSuccess = payload => {
  return {
    type: DELETE_SUCCESS,
    payload
  };
};

export const DELETE_FAILURE = 'DOMAIN::DELETE_FAILURE';
export const deleteFailure = (error: Error) => {
  return {
    type: DELETE_FAILURE,
    error
  };
};

export const deleteDomain = domain => {
  return async (dispatch: Dispatch) => {
    dispatch(deleteRequest());
    let result;

    try {
      result = await DomainService.delete(domain);
    } catch (error) {
      dispatch(deleteFailure(error));
      return error;
    }

    dispatch(deleteSuccess({ id: domain }));

    return result;
  };
};

/*
 * Register Mailboxes under domain
 */
export const REGISTER_MAILBOX_REQUEST = 'DOMAIN::REGISTER_MAILBOX_REQUEST';
export const registerMailboxRequest = () => {
  return {
    type: REGISTER_MAILBOX_REQUEST
  };
};

export const REGISTER_MAILBOX_SUCCESS = 'DOMAIN::REGISTER_MAILBOX_SUCCESS';
export const registerMailboxSuccess = mailbox => {
  return {
    type: REGISTER_MAILBOX_SUCCESS,
    mailbox
  };
};

export const REGISTER_MAILBOX_FAILURE = 'DOMAIN::REGISTER_MAILBOX_FAILURE';
export const registerMailboxFailure = (error: Error) => {
  return {
    type: REGISTER_MAILBOX_FAILURE,
    error
  };
};

export const registerMailbox = (payload: {
  type: 'SUB' | 'CLAIMED';
  email: string;
  displayName: string;
  domain: string;
  recoveryEmail: string;
  deviceType: 'DESKTOP' | 'MOBILE';
}) => {
  return async (dispatch: Dispatch) => {
    dispatch(registerMailboxRequest());
    let result;

    try {
      result = await DomainService.registerMailbox(payload);
    } catch (error) {
      dispatch(registerMailboxFailure(error));
      return { status: error.message, success: false };
    }

    dispatch(registerMailboxSuccess(result.mailbox));

    return { status: 'registered', success: true };
  };
};

/*
 * Deleting Mailbox governed under a certain domain
 */
export const DELETE_MAILBOX_REQUEST = 'DOMAIN::DELETE_MAILBOX_REQUEST';
export const deleteMailboxRequest = () => {
  return {
    type: DELETE_MAILBOX_REQUEST
  };
};

export const DELETE_MAILBOX_SUCCESS = 'DOMAIN::DELETE_MAILBOX_SUCCESS';
export const deleteMailboxSuccess = payload => {
  return {
    type: DELETE_MAILBOX_SUCCESS,
    payload
  };
};

export const DELETE_MAILBOX_FAILURE = 'DOMAIN::DELETE_MAILBOX_FAILURE';
export const deleteMailboxFailure = (error: Error) => {
  return {
    type: DELETE_MAILBOX_FAILURE,
    error
  };
};

export const deleteMailbox = payload => {
  return async (dispatch: Dispatch) => {
    dispatch(deleteMailboxRequest());
    let result;

    try {
      result = await DomainService.deleteMailbox(payload);
    } catch (error) {
      dispatch(deleteMailboxFailure(error));
      return error;
    }

    dispatch(deleteMailboxSuccess(result));

    return result;
  };
};

/*
 * Update a mailbox under a given domain
 */
export const UPDATE_MAILBOX_REQUEST = 'DOMAIN::UPDATE_MAILBOX_REQUEST';
export const updateMailboxRequest = () => {
  return {
    type: UPDATE_MAILBOX_REQUEST
  };
};

export const UPDATE_MAILBOX_SUCCESS = 'DOMAIN::UPDATE_MAILBOX_SUCCESS';
export const updateMailboxSuccess = payload => {
  return {
    type: UPDATE_MAILBOX_SUCCESS,
    payload
  };
};

export const UPDATE_MAILBOX_FAILURE = 'DOMAIN::UPDATE_MAILBOX_FAILURE';
export const updateMailboxFailure = (error: Error) => {
  return {
    type: UPDATE_MAILBOX_FAILURE,
    error
  };
};

export const updateMailbox = payload => {
  return async (dispatch: Dispatch) => {
    dispatch(updateMailboxRequest());
    let result;

    try {
      result = await DomainService.updateMailbox(payload);
    } catch (error) {
      dispatch(updateMailboxFailure(error));
      return error;
    }

    dispatch(updateMailboxSuccess(result));

    return result;
  };
};
