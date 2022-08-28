import React from 'react';
import { Routes, Route } from 'react-router';
import ForgotPassword from './ForgotPassword';
import SetNewPassword from './SetNewPassword';
import ResetSuccess from './ResetSuccess';
import { ErrorScreen } from '../../window_components';

const ForgotPasswordRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ForgotPassword />} />
      <Route path="/setnewpassword" element={<SetNewPassword />} />
      <Route path="/resetsuccess" element={<ResetSuccess />} />
      <Route path="/resetfailure" element={<ErrorScreen />} />
    </Routes>
  );
};

export default ForgotPasswordRoutes;
