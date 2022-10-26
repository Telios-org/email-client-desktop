/* eslint-disable promise/no-nesting */
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
      console.log(domain);
      result = await DomainService.register(domain);
      console.log(result);
    } catch (error) {
      dispatch(addDomainFailure(error));
      return error;
    }

    // dispatch(addDomainSuccess(result));

    return result;
  };
};
