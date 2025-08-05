import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GroupsPage from './pages/Groups';
import Dashboard from './pages/dashboard';
import MessagingPage from './pages/Messages';
import Settings from './pages/settings';
import Users from './pages/users';
import Notifications from './pages/notification';
import Login from './pages/Login';
import { call_api } from './components/api';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Verify token with backend
      await call_api(null, 'auth/verify', 'POST');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Authentication failed:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedDarkMode = JSON.parse(localStorage.getItem('darkMode'));
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading Teacher Portal...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Home page - classroom list */}
          <Route path="/" element={<GroupsPage />} />
          
          {/* Dashboard routes - both with and without classroom name */}
          <Route path="/dashboard/:classroomId/:classroomName" element={<Dashboard />} />
          <Route path="/dashboard/:classroomId" element={<Dashboard />} />
          
          {/* General messaging page */}
          <Route path="/messages" element={<MessagingPage />} />
          
          {/* Classroom-specific messaging */}
          <Route path="/messages/:classroomId" element={<MessagingPage />} />
          
          {/* Settings page */}
          <Route path="/settings" element={<Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          
          {/* Users/Students page - general and classroom-specific */}
          <Route path="/users" element={<Users />} /> 
          <Route path="/users/:classroomId" element={<Users />} />
          
          {/* Notifications page */}
          <Route path="/users/:classroomId" element={<Users />} /> 
          <Route path="/notifications" element={<Notifications />} /> 
          
          {/* Fallback route */}
          <Route path="*" element={<GroupsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;