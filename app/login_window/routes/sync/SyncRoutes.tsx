import React from 'react';
import { Routes, Route } from 'react-router';
import Sync from './Sync';
import MasterPassword from './MasterPassword';
import SyncPending from './SyncPending';
import SyncSuccess from './SyncSuccess';
import SyncError from './SyncError';

const SyncRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Sync />} />
      <Route path="/masterpassword" element={<MasterPassword />} />
      <Route path="/syncpending" element={<SyncPending />} />
      <Route path="/syncsuccess" element={<SyncSuccess />} />
      <Route path="/syncerror" element={<SyncError />} />
    </Routes>
  );
};

export default SyncRoutes;
