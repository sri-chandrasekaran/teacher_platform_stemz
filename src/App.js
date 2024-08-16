import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GroupsPage from './pages/Groups';
import ClassroomPage from './pages/Classroom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GroupsPage />} />
        <Route path="/classroom/:id/*" element={<ClassroomPage />} />
      </Routes>
    </Router>
  );
}

export default App;
