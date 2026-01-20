import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaPlusCircle } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import '../styles/settings.css';
import apiClient from '../services/apiClient';

const SettingsUser = () => {
  const { classroomId } = useParams();
  const [darkMode, setDarkMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      const user = localStorage.getItem('user');
      console.log('Fetched user from localStorage:', user);
      if (user) {
        const userObj = JSON.parse(user);
        setUserName(userObj.name || '');
        setUserEmail(userObj.email || '');
        setUserId(userObj._id || '');
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMessage('');
      // simple validations per model
      if (!userName || userName.trim().length === 0) {
        setSaveMessage('Name is required.');
        return;
      }
      if (userName.length > 100) {
        setSaveMessage('Name must be at most 100 characters.');
        return;
      }
      const payload = {
        name: userName.trim(),
        email: userEmail.trim(),
      };
      await apiClient.updateUser(userId, payload);
      setSaveMessage('Saved changes.');
    } catch (e) {
      console.error('Failed to save user', e);
      setSaveMessage('Failed to save.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div className="settings-page">
  {/* Sidebar */}
  <Sidebar/>
    <div className={`settings-container ${darkMode ? 'settings-dark' : ''}`}>
      <main className="settings-content">
        {/* <h1 className="settings-title">Settings</h1> */}

        {/* Classroom Name and Description */}
        <div className="settings-section">
          <h2>User Info</h2>
          <div className="form-group">
            <label className="form-label">User Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">User Email</label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="form-input"
            />
          </div>
          <div className='form-actions'>
            <button onClick={() => navigate('/settings2FA')} className="save-button">
              2FA Settings
            </button>
          </div>
          <div className="form-actions">
            <button onClick={handleSave} className="save-button" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saveMessage && <span className="save-message">{saveMessage}</span>}
          </div>
        </div>
      </main>
    </div>
    </div>
  );
};

export default SettingsUser;
