import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaHome, FaUsers, FaEnvelope, FaBell, FaCog, FaChartLine, FaPlusCircle } from 'react-icons/fa';


const Settings = () => {
    const [classroomId, setClassroomId] = useState('12345');
    const [classroomName, setClassroomName] = useState('Default Classroom');
  const [classroomDescription, setClassroomDescription] = useState('A brief description of the classroom.');
  const [darkMode, setDarkMode] = useState(false);
  const [weeklyEmails, setWeeklyEmails] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const settings = {
      classroomName,
      classroomDescription,
      darkMode,
      weeklyEmails,
    };
    localStorage.setItem('classroomSettings', JSON.stringify(settings));
    console.log('Settings saved:', settings);
  }, [classroomName, classroomDescription, darkMode, weeklyEmails]);

  // Handle classroom deletion
  const handleDeleteClassroom = () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this classroom? This action cannot be undone.');
    if (confirmDelete) {
      console.log('Classroom deleted');
      navigate('/');
    }
  };

  // Handle Dark Mode Toggle
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="settings-page">
    {/* Sidebar */}
    <div className="sidebar">
      <ul className="sidebar-links">
        <li><Link to="/"><FaHome className="sidebar-icon" /></Link></li>
        <li><Link to={`/dashboard/${classroomId}`}><FaChartLine className={`sidebar-icon ${location.pathname === `/dashboard/${classroomId}` ? 'active' : ''}`} /></Link></li>
        <li><Link to="/users"><FaUsers className={`sidebar-icon ${location.pathname === '/users' ? 'active' : ''}`} /></Link></li>
        <li><Link to="/messages"><FaEnvelope className={`sidebar-icon ${location.pathname === '/messages' ? 'active' : ''}`} /></Link></li>
        <li><Link to="/notifications"><FaBell className={`sidebar-icon ${location.pathname === '/notifications' ? 'active' : ''}`} /></Link></li>
        <li><Link to="/settings"><FaCog className={`sidebar-icon ${location.pathname === '/settings' ? 'active' : ''}`} /></Link></li>
      </ul>
    </div>
    <div className={`settings-container ${darkMode ? 'settings-dark' : ''}`}>
      <main className="settings-content">
        {/* <h1 className="settings-title">Settings</h1> */}

        {/* Classroom Name and Description */}
        <div className="settings-section">
          <h2>Classroom Info</h2>
          <div className="form-group">
            <label className="form-label">Classroom Name</label>
            <input
              type="text"
              value={classroomName}
              onChange={(e) => setClassroomName(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Classroom Description</label>
            <textarea
              value={classroomDescription}
              onChange={(e) => setClassroomDescription(e.target.value)}
              className="form-textarea"
              rows="3"
            ></textarea>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div className="settings-section">
          <h2>Appearance</h2>
          <div className="dark-mode-toggle">
            {/* <span>Dark Mode</span> */}
            <button onClick={toggleDarkMode}>
              {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section">
          <h2>Notifications</h2>
          <div className="form-group">
            <label className="form-label">Receive Weekly Emails</label>
            <input
              type="checkbox"
              checked={weeklyEmails}
              onChange={(e) => setWeeklyEmails(e.target.checked)}
              className="form-checkbox"
            />
          </div>
        </div>

        {/* Delete Classroom */}
        <div className="settings-section danger-zone">
          <h2>Danger Zone</h2>
          <button
            onClick={handleDeleteClassroom}
            className="del-button"
          >
            Delete Classroom
          </button>
        </div>
      </main>
    </div>
    </div>
  );
};

export default Settings;
