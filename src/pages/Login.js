import React, { useState } from 'react';
import { call_api } from '../components/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await call_api({ email, password }, 'auth/login', 'POST');
      localStorage.setItem('token', response.token);
      window.location.href = '/';
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', width: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Teacher Portal Login</h1>
        
        {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>{error}</div>}
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '2px solid #e9ecef', borderRadius: '8px', boxSizing: 'border-box' }}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '2px solid #e9ecef', borderRadius: '8px', boxSizing: 'border-box' }}
        />
        
        <button 
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </div>
    </div>
  );
};

export default Login;