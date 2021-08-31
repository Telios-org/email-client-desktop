import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import LoginPage from './containers/LoginPage';
import '../app.global.less';

const { nativeTheme } = require('electron').remote;

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;
const mode = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';

document.addEventListener('DOMContentLoaded', () =>
  render(
    <AppContainer>
      <div id="theme-mode" className={mode}>
        <LoginPage />
      </div>
    </AppContainer>,
    document.getElementById('root')
  )
);
