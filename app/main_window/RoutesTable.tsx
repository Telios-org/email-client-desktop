import React from 'react';
import { Routes, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import MainWindow from './containers/Layout/MainWindow';

const { nativeTheme } = require('electron').remote;

export default function RoutesTable() {
  const mode = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';

  return (
    <App>
      <div id="theme-mode" className={mode}>
        <Routes>
          {/* <Route exact path={routes.MAIL} component={MailPage} /> */}
          <Route path={routes.MAIL} element={<MainWindow />} />
        </Routes>
      </div>
    </App>
  );
}
