import Mail from '../../../services/mail.service';
import { Dispatch, GetState } from '../../reducers/types';

export const REGISTER_NAMESPACE = 'ALIASES::REGISTER_NAMESPACE';
export const startNamespaceRegistration = () => {
  return {
    type: REGISTER_NAMESPACE
  };
};

export const REGISTER_NAMESPACE_SUCCESS = 'ALIASES::REGISTER_NAMESPACE_SUCCESS';
export const namespaceRegistrationSuccess = payload => {
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
      ns = await Mail.registerAliasNamespace({ mailboxId, namespace });
    } catch (error) {
      dispatch(namespaceRegistrationFailure(error));

      if (error.message.startsWith('E11000 duplicate key')) {
        return { status: 'already-registered', success: false };
      }
      return error;
    }

    dispatch(namespaceRegistrationSuccess(ns));
    return { status: 'registered', success: true };
  };
};

export const REGISTER_ALIAS = 'ALIASES::REGISTER_ALIAS';
export const startAliasRegistration = (alias:string) => {
  return {
    type: REGISTER_ALIAS,
    alias
  };
};

export const REGISTER_ALIAS_SUCCESS = 'ALIASES::REGISTER_ALIAS_SUCCESS';
export const aliasRegistrationSuccess = payload => {
  return {
    type: REGISTER_ALIAS_SUCCESS,
    payload
  };
};

export const REGISTER_ALIAS_FAILURE = 'ALIASES::REGISTER_ALIAS_FAILURE';
export const aliasRegistrationFailure = (error: string, alias:string) => {
  return {
    type: REGISTER_ALIAS_FAILURE,
    error,
    alias
  };
};

export const registerAlias = (
  namespaceName: string,
  namespaceKey: string,
  domain: string,
  address: string,
  description: string,
  fwdAddresses: string[],
  whitelisted: boolean
) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(startAliasRegistration(`${namespaceName}#${address}@${domain}`));
    let alias;
    try {
      alias = await Mail.registerAliasAddress({
        namespaceName,
        namespaceKey,
        domain,
        address,
        description,
        fwdAddresses,
        whitelisted
      });
    } catch (error) {
      dispatch(
        aliasRegistrationFailure(error, `${namespaceName}#${address}@${domain}`)
      );

      // if (error.message.startsWith('E11000 duplicate key')) {
      //   return { status: 'already-registered', success: false };
      // }
      return {
        status: 'issue-registering',
        success: false,
        message: error.message
      };
    }

    dispatch(aliasRegistrationSuccess(alias));
    return { status: 'registered', success: true };
  };
};
