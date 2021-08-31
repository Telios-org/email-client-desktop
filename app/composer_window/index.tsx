import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
// import Composer from './components/Composer';
import '../app.global.less';

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const Composer = require('./components/Composer').default;
  render(
    <AppContainer>
      <Composer />
    </AppContainer>,
    document.getElementById('root')
  );
});
