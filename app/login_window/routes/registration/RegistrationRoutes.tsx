import React from 'react';
import { Routes, Route } from 'react-router';
import Consent from './Consent';
import EmailPick from './EmailPick';
import RecoveryEmail from './RecoveryEmail';
import Registration from './Registration';
import { ErrorScreen } from '../../window_components';
import RegistrationSuccess from './RegistrationSuccess';
import SetPassword from './SetPassword';

const RegistrationRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Registration />}>
        <Route path="/" element={<Consent />} />
        <Route path="/emailpick" element={<EmailPick />} />
        <Route path="/password" element={<SetPassword />} />
        <Route path="/recovery" element={<RecoveryEmail />} />
        <Route path="/success" element={<RegistrationSuccess />} />
        <Route path="/error" element={<ErrorScreen />} />
      </Route>
    </Routes>
  );
};

export default RegistrationRoutes;
