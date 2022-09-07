import React from 'react';

// EXTERNAL LIBRAIRIES
import { Routes, Route } from 'react-router-dom';
import { MailIcon } from '@heroicons/react/outline';

// INTERNAL CSS STYLESHEET
import styles from './LoginWindow.css';

// INTERNAL COMPONENTS
import Login from './routes/login/Login';
import SyncRoutes from './routes/sync';
import ForgotPasswordRoutes from './routes/forgot_password';
import RegistrationRoutes from './routes/registration';
import RecoveryRoutes from './routes/recovery';
import SyncOrRecovery from './routes/sync_or_recovery/SyncOrRecovery';
// import ConstellationSVG from './images/ConstellationSVG';
import ConstellationSVG from './images/NetworkGraph.svg';
import TeliosLogoWhite from './images/TeliosLogoWhite.svg'

const pkg = require('../package.json');

const LoginWindow = () => {
  return (
    <div className="relative w-full h-screen flex flex-row">
      <div className={`absolute w-full h-12 ${styles.draggableArea}`} />
      <div className="relative w-[400px] h-full bg-[#884AFC]">
        <div className="absolute z-0 top-0 bg-gradient-to-tr w-full h-full from-[#A996FF]/10 via-[#A996FF]/30 to-[#57C9F5]/30" />
        {/* <ConstellationSVG /> */}
        <div className="relative z-10 h-full flex flex-col select-none">
          <div className="relative h-24 w-full flex">
            <img src={TeliosLogoWhite} className="w-32 mx-auto mt-4" alt="React Logo" />
          </div>
          <div className="min-h-[280px]">
            <img src={ConstellationSVG} className="w-[80%] mx-auto" alt="React Logo" />
          </div>
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col ml-10 mr-3 mt-10">
              <div className="text-gray-300 text-base font-semibold pb-3">Peer-to-Peer</div>
              <div className="text-white text-base font-semibold">
              Communicate with your friends, colleagues and more via our peer-to-peer, encrypted and private network.
              </div>
            </div>
            <div className="max-h-14 flex flex-row justify-between pb-4">
              <span className="pl-4 text-xs text-white">
              &copy;Telios {new Date().getFullYear()}
              </span>
              <span className="text-white z-10 select-none text-xs">
                <span className="">v</span>
                {pkg.version}
              </span>
              <span className="pr-4 text-xs text-white flex flex-row items-center">
                <MailIcon className="h-3 w-3 mr-1" />
                support@telios.io
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Login />} />
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
