import React, { useState } from 'react';
import apiClient from '../services/apiClient';

// Save user information to localStorage after successful login
// Change api for teacher's classrooms
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    console.log('handleLogin called');
    
    // Prevent form submission and page refresh
    e.preventDefault();
    e.stopPropagation();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(''); // Clear previous errors
    
    try {
      console.log('Attempting login with:', { email });
      
      // Use the standardized API client instead of call_api
      const response = await apiClient.post('api/auth/login', { email, password });
      console.log('Login successful:', response);
      
      if (response && response.token) {
        // Store token in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('login_response', JSON.stringify(response));
        
        // Set token in apiClient for immediate use
        apiClient.setAuthToken(response.token);
        
        // Use setTimeout to ensure state updates before redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      } else {
        throw new Error('No token received from server');
      }
      
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      
      setError(`Login failed: ${error.message || 'Please check your credentials and try again.'}`);
      setLoading(false); // Only set loading false on error
    }
  };

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      margin: 0,
      padding: 0
    }}>
      <div style={{ border: '2px solid #ddd', borderRadius: '8px', padding: '30px', width: '400px', backgroundColor: 'white', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '20px', color: 'black' }}>Teacher Portal Login</h1>
        {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
          />
          <button 
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '10px', backgroundColor: 'darkgreen', color: '#fff', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '10px' }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;