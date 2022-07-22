import React from 'react';
import { Routes, Route } from 'react-router';
import Sync from './Sync';
import MasterPassword from './MasterPassword';

const SyncRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Sync />} />
      <Route path="/masterpassword" element={<MasterPassword />} />
    </Routes>
  );
};

export default SyncRoutes;
