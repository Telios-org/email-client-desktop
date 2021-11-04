
// import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { configureStore, history } from './store/configureStore';
// import 'tailwindcss/tailwind.css';
import '../app.global.css';

const store = configureStore();

// const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () => {
  const Root = require('./Root').default;
  return render(
    <>
      <Root store={store} history={history} />
    </>,
    document.getElementById('root')
  );
});
