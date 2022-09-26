import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { createReduxHistoryContext } from 'redux-first-history';
import createRootReducer from '../reducers';
import { Store } from '../reducers/types';

const {
  createReduxHistory,
  routerMiddleware,
  routerReducer
} = createReduxHistoryContext({
  history: createHashHistory()
  // other options if needed
});

// const history = createReduxHistory(store);
const rootReducer = createRootReducer(routerReducer);
// const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, routerMiddleware);

function configureStore(initialState): Store {
  return createStore(rootReducer, initialState, enhancer);
}

function createHistory(store: Store) {
  return createReduxHistory(store);
}

export default { configureStore, createHistory };
