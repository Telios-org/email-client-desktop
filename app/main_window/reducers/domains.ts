import { DomainsType, DomainAction } from './types';

const initialState: DomainsType = {
  byId: {},
  allIds: []
};

export default function client(
  state: DomainsType = initialState,
  action: DomainAction
) {
  switch (action.type) {
    default:
      return state;
  }
}
