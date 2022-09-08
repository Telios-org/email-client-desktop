import React from 'react';
import { Routes, Route } from 'react-router';
import ForgotPassword from './ForgotPassword';
import SetNewPassword from './SetNewPassword';
import ResetSuccess from './ResetSuccess';
import { ErrorScreen } from '../../window_components';

const ForgotPasswordRoutes = () => {
  return (
    <Routes>
      <Route index element={<ForgotPassword />} />
      <Route path="/setnewpassword" element={<SetNewPassword />} />
      <Route path="/resetsuccess" element={<ResetSuccess />} />
      <Route
        path="/resetfailure"
        element={(
          <ErrorScreen
            message="We were unable to reset your password, make sure the recovery
                passphrase and password is accurate."
          />
        )}
      />
    </Routes>
  );
};

export default ForgotPasswordRoutes;
