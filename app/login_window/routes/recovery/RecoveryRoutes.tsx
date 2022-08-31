import React from 'react';
import { Routes, Route } from 'react-router';
import { ErrorScreen } from '../../window_components';
// import RecoverySuccess from './RecoverySuccess';
// import RecoveryCode from './RecoveryCode';
import Recovery from './Recovery';

const RegistrationRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Recovery />} />
      {/* <Route path="/code" element={<RecoveryCode />} />
      <Route path="/success" element={<RecoverySuccess />} /> */}
      <Route path="/failure" element={<ErrorScreen />} />
    </Routes>
  );
};

export default RegistrationRoutes;
