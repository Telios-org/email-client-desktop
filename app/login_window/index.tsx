// import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import React, { Fragment } from 'react';
import { render } from 'react-dom';

// EXTERNAL LIBRAIRIES
import { HashRouter, Routes, Route } from 'react-router-dom';

// INTERNAL LIBRAIRIES
import LoginPage from './containers/LoginPage';
import LoginWindow from './LoginWindow';
// import '../app.tailwind.css';
import '../app.global.css';

const { nativeTheme } = require('electron').remote;

// const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;
const mode = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';

document.addEventListener('DOMContentLoaded', () =>
  render(
    <HashRouter>
      <Routes>
        <Route path="/" element={<LoginWindow />} />
      </Routes>
    </HashRouter>,
    // <LoginWindow />
    document.getElementById('root')
  )
);
