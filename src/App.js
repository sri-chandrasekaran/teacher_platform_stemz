import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/Main';
import Dashboard from './pages/dashboard';
import MessagingPage from './pages/Messages';
import Settings from './pages/settings';
import Users from './pages/users';
import Notifications from './pages/notification';
import Login from './pages/Login';
import apiClient from './services/apiClient';

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

      // Set token in apiClient for all requests
      apiClient.setAuthToken(token);

      // Verify token with backend
      await apiClient.post('api/auth/verify');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Authentication failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('login_response');
      apiClient.clearAuthToken();
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
          <Route path="/" element={<MainPage />} />
          
          {/* Dashboard routes - both with and without classroom name */}
          <Route path="/dashboard/:classroomId/:classroomName" element={<Dashboard />} />
          <Route path="/dashboard/:classroomId" element={<Dashboard />} />
          
          {/* General messaging page */}
          <Route path="/messages" element={<MessagingPage />} />
          
          {/* Classroom-specific messaging */}
          <Route path="/messages/:classroomId" element={<MessagingPage />} />
          
          {/* Settings page */}
          <Route path="/settings/:classroomId" element={<Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          
          {/* Users/Students page - general and classroom-specific */}
          <Route path="/users" element={<Users />} /> 
          <Route path="/users/:classroomId" element={<Users />} />
          
          {/* Notifications page */}
          <Route path="/users/:classroomId" element={<Users />} /> 
          <Route path="/notifications" element={<Notifications />} /> 
          <Route path="/notifications/:classroomId" element={<Notifications />} />

          {/* Fallback route */}
          <Route path="*" element={<MainPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;