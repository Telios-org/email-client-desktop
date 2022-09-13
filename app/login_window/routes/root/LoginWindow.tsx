import React from 'react';

// EXTERNAL LIBRAIRIES
import { Routes, Route } from 'react-router-dom';

// INTERNAL CSS STYLESHEET
import styles from './LoginWindow.css';

// INTERNAL COMPONENTS
import Login from '../login/Login';
import SyncRoutes from '../sync';
import ForgotPasswordRoutes from '../forgot_password';
import RegistrationRoutes from '../registration';
import RecoveryRoutes from '../recovery';
import SyncOrRecovery from '../sync_or_recovery/SyncOrRecovery';
import NetworkCarousel from './NetworkCarousel';
import StepByStep from '../registration/StepByStep';
import SideLayout from './SideLayout';

const LoginWindow = () => {
  return (
    <div className="relative w-full h-screen flex flex-row">
      <div className={`absolute w-full h-12 ${styles.draggableArea}`} />
      <div className="relative w-[400px] h-full bg-[#884AFC]">
        <div className="absolute z-0 top-0 bg-gradient-to-tr w-full h-full from-[#A996FF]/10 via-[#A996FF]/30 to-[#57C9F5]/30" />
        <Routes>
          <Route element={<SideLayout />}>
            <Route path="/*" element={<NetworkCarousel />} />
            <Route path="/registration/*" element={<StepByStep />} />
          </Route>
        </Routes>
      </div>
      <div className="flex-1">
        <Routes>
          <Route index element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration/*" element={<RegistrationRoutes />} />
          <Route path="/sync/*" element={<SyncRoutes />} />
          <Route path="/forgotpassword/*" element={<ForgotPasswordRoutes />} />
          <Route path="/recovery/*" element={<RecoveryRoutes />} />
          <Route path="/syncorrecovery" element={<SyncOrRecovery />} />
        </Routes>
      </div>
    </div>
  );
};

export default LoginWindow;
