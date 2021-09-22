import Mail from '../../../services/mail.service';
import { Dispatch, GetState } from '../../reducers/types';

export const REGISTER_NAMESPACE = 'ALIASES::REGISTER_NAMESPACE';
export const startNamespaceRegistration = () => {
  return {
    type: REGISTER_NAMESPACE
  };
};

export const REGISTER_NAMESPACE_SUCCESS = 'ALIASES::REGISTER_NAMESPACE_SUCCESS';
export const namespaceRegistrationSuccess = (payload) => {
  return {
    type: REGISTER_NAMESPACE_SUCCESS,
    payload
  };
};

export const REGISTER_NAMESPACE_FAILURE = 'ALIASES::REGISTER_NAMESPACE_FAILURE';
export const namespaceRegistrationFailure = (error: string) => {
  return {
    type: REGISTER_NAMESPACE_FAILURE,
    error
  };
};

export const registerNamespace = (mailboxId: number, namespace: string) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(startNamespaceRegistration());
    let ns;
    try {
      console.log('ALIAS_ACTIONCREATOR::REGISTERNS', mailboxId, namespace);
      ns = await Mail.registerAliasNamespace({ mailboxId, namespace });

      console.log('ALIASES::NS REGISTRATION', ns);
      if (!ns.registered) {
        throw new Error('already-registered');
      }
    } catch (error) {
      dispatch(namespaceRegistrationFailure(error));
      return error;
    }

    dispatch(namespaceRegistrationSuccess(ns));
    return 'success';
  };
};
