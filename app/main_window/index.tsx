
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { configureStore, history } from './store/configureStore';
import '../app.global.less';

const store = configureStore();

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () => {
  const Root = require('./Root').default;
  return render(
    <AppContainer>
      <Root store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
  );
});
