import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import MainWindow from './containers/Layout/MainWindow';

const { nativeTheme } = require('electron').remote;

export default function Routes() {
  const mode = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';

  return (
    <App>
      <div id="theme-mode" className={mode}>
        <Switch>
          {/* <Route exact path={routes.MAIL} component={MailPage} /> */}
          <Route exact path={routes.MAIL} component={MainWindow} />
        </Switch>
      </div>
    </App>
  );
}
