import React from 'react';
import { Routes, Route } from 'react-router';
import { ErrorScreen } from '../../window_components';
// import RecoverySuccess from './RecoverySuccess';
// import RecoveryCode from './RecoveryCode';
import Recovery from './Recovery';

const RegistrationRoutes = () => {
  return (
    <Routes>
      <Route index element={<Recovery />} />
      {/* <Route path="/code" element={<RecoveryCode />} />
      <Route path="/success" element={<RecoverySuccess />} /> */}
      <Route
        path="/failure"
        element={
          <ErrorScreen message="We were unable to recover your account." />
        }
      />
    </Routes>
  );
};

export default RegistrationRoutes;
