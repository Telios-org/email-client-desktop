import { createSelector } from 'reselect';
import { StateType } from '../reducers/types';

export const selectAllDomains = (state: StateType) => state.domains;
