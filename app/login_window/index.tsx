// import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import React, { Fragment } from 'react';
import { render } from 'react-dom';
import LoginPage from './containers/LoginPage';
// import '../app.tailwind.css';
import '../app.global.css';

const { nativeTheme } = require('electron').remote;

// const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;
const mode = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';

document.addEventListener('DOMContentLoaded', () =>
  render(
    <>
      <div id="theme-mode" className={mode}>
        <LoginPage />
      </div>
    </>,
    document.getElementById('root')
  )
);
