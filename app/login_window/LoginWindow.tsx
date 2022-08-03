import React from 'react';

// EXTERNAL LIBRAIRIES
import { Routes, Route } from 'react-router-dom';

// INTERNAL CSS STYLESHEET
import styles from './LoginWindow.css';

// INTERNAL COMPONENTS
import Login from './routes/Login';
import SyncRoutes from './routes/sync';

const LoginWindow = () => {
  return (
    <div className="relative w-full h-screen flex flex-row">
      <div className={`absolute w-full h-12 ${styles.draggableArea}`} />
      <div className="w-[400px] h-full bg-purple-500" />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Login />} />
          <Route path="/sync/*" element={<SyncRoutes />} />
          <Route path="/forgotten-password" element={<Login />} />
        </Routes>
      </div>
    </div>
  );
};

export default LoginWindow;
