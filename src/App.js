import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GroupsPage from './pages/Groups';
import Dashboard from './pages/dashboard';
import MessagingPage from './pages/Messages'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GroupsPage />} />
        <Route path="/dashboard/:classroomId" element={<Dashboard />} />
        <Route path="/messages" element={<MessagingPage />} />
      </Routes>
    </Router>
  );
}

export default App;