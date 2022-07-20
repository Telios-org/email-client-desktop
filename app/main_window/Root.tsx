import React from 'react';
import { Provider } from 'react-redux';
import { HistoryRouter as Router } from 'redux-first-history/rr6';
import { History } from 'history';
import { Store } from './reducers/types';
import RoutesTable from './RoutesTable';

type Props = {
  store: Store;
  history: History;
};

const Root = ({ store, history }: Props) => (
  <Provider store={store}>
    <Router history={history}>
      <RoutesTable />
    </Router>
  </Provider>
);

export default Root;
