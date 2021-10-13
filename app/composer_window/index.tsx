import React, { Fragment } from 'react';
import { render } from 'react-dom';
import '../app.global.less';

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line global-require
  const Composer = require('./components/Composer').default;
  render(
    <>
      <Composer />
    </>,
    document.getElementById('root')
  );
});
