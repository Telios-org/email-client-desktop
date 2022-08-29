import React from 'react';

// EXTERNAL LIBRAIRIES
import { Routes, Route } from 'react-router-dom';

// INTERNAL CSS STYLESHEET
import styles from './LoginWindow.css';

// INTERNAL COMPONENTS
import Login from './routes/login/Login';
import SyncRoutes from './routes/sync';
import ForgotPasswordRoutes from './routes/forgot_password';
import RegistrationRoutes from './routes/registration';
import RecoveryRoutes from './routes/recovery';

const LoginWindow = () => {
  return (
    <div className="relative w-full h-screen flex flex-row">
      <div className={`absolute w-full h-12 ${styles.draggableArea}`} />
      <div className="w-[400px] h-full bg-purple-500" />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration/*" element={<RegistrationRoutes />} />
          <Route path="/sync/*" element={<SyncRoutes />} />
          <Route path="/forgotpassword/*" element={<ForgotPasswordRoutes />} />
          <Route path="/recovery/*" element={<RecoveryRoutes />} />
        </Routes>
      </div>
    </div>
  );
};

export default LoginWindow;
