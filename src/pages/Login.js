import React, { useState } from 'react';
import apiClient from '../services/apiClient';

// Save user information to localStorage after successful login
// Change api for teacher's classrooms
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);   
  const [tempToken, setTempToken] = useState('');
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

      // If 2FA is required, set the state accordingly
      if (response?.twoFARequired) {
        setMfaRequired(true);
        setTempToken(response.tempToken);
        setLoading(false);
        return;
      }
      
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

  const handleTotpVerify = async (e) => {
    e.preventDefault();
    if (!totpCode) {
      setError('Enter your authentication code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const verifyResponse = await apiClient.post('api/auth/login/totp', {
        email: email,
        password: password,
        twoFAToken: totpCode,
        tempToken // send the temporary token/challenge identifier
      });
      if (verifyResponse?.token) {
        localStorage.setItem('token', verifyResponse.token);
        localStorage.setItem('user', JSON.stringify(verifyResponse.user));
        localStorage.setItem('login_response', JSON.stringify(verifyResponse));
        apiClient.setAuthToken(verifyResponse.token);
        setTimeout(() => { window.location.href = '/'; }, 100);
      } else {
        throw new Error('Invalid verification response');
      }
    } catch (err) {
      setError(`TOTP verification failed: ${err.message || 'Try again.'}`);
      setLoading(false);
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
        {!mfaRequired && (
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
        )}
        {mfaRequired && (
          <form onSubmit={handleTotpVerify} style={{ width: '100%' }}>
            <p style={{ marginBottom: '15px' }}>Enter the 6-digit code from your authenticator app.</p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="123456"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
              disabled={loading}
              required
              style={{ width: '100%', letterSpacing: '4px', fontSize: '18px', textAlign: 'center', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '10px', backgroundColor: '#1e88e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '10px' }}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => { setMfaRequired(false); setTotpCode(''); setTempToken(''); }}
              style={{ width: '100%', padding: '8px', backgroundColor: '#777', color: '#fff', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;