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
export const startAliasRegistration = (alias: string) => {
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
export const aliasRegistrationFailure = (error: string, alias: string) => {
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
  disabled: boolean
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
        disabled
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

// UPDATE ALIAS ACTIONS

export const UPDATE_ALIAS = 'ALIASES::UPDATE_ALIAS';
export const startAliasUpdate = (alias: string, payload: any) => {
  return {
    type: UPDATE_ALIAS,
    alias,
    payload
  };
};

export const UPDATE_ALIAS_SUCCESS = 'ALIASES::UPDATE_ALIAS_SUCCESS';
export const aliasUpdateSuccess = (payload: any) => {
  return {
    type: UPDATE_ALIAS_SUCCESS,
    payload
  };
};

export const UPDATE_ALIAS_FAILURE = 'ALIASES::UPDATE_ALIAS_FAILURE';
export const aliasUpdateFailure = (
  error: string,
  alias: string,
  payload: any
) => {
  return {
    type: UPDATE_ALIAS_FAILURE,
    error,
    alias,
    payload
  };
};

export const updateAlias = (payload: {
  namespaceName: string;
  domain: string;
  address: string;
  description: string;
  fwdAddresses: string[];
  disabled: boolean;
}) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    const {
      namespaceName,
      domain,
      address,
      description,
      fwdAddresses,
      disabled
    } = payload;
    dispatch(
      startAliasUpdate(`${namespaceName}#${address}@${domain}`, payload)
    );
    try {
      await Mail.updateAliasAddress({
        namespaceName,
        domain,
        address,
        description,
        fwdAddresses,
        disabled
      });
    } catch (error) {
      dispatch(
        aliasUpdateFailure(
          error,
          `${namespaceName}#${address}@${domain}`,
          payload
        )
      );

      // if (error.message.startsWith('E11000 duplicate key')) {
      //   return { status: 'already-updateed', success: false };
      // }
      return {
        status: 'issue-updateing',
        success: false,
        message: error.message
      };
    }

    dispatch(aliasUpdateSuccess(payload));
    return { status: 'updateed', success: true };
  };
};
