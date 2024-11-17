import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GroupsPage from './pages/Groups';
import Dashboard from './pages/dashboard';
import MessagingPage from './pages/Messages';
import Settings from './pages/settings';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Check if dark mode preference exists in localStorage
  useEffect(() => {
    const savedDarkMode = JSON.parse(localStorage.getItem('darkMode'));
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode);
    }
  }, []);

  // Toggle dark mode globally
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Save dark mode preference in localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<GroupsPage />} />
          <Route path="/dashboard/:classroomId" element={<Dashboard />} />
          <Route path="/messages" element={<MessagingPage />} />
          <Route path="/settings" element={<Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
