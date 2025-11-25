import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import '../styles/settings.css';
import apiClient from '../services/apiClient';

const Settings = () => {
  const { classroomId } = useParams();
  const [classroomName, setClassroomName] = useState('Loading...');
  const [classroomDescription, setClassroomDescription] = useState('Loading...');
  const [darkMode, setDarkMode] = useState(false);
  const [weeklyEmails, setWeeklyEmails] = useState(true);
  const [schoolName, setSchoolName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [classroomNumber, setClassroomNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const response = await apiClient.fetchClassroomById(classroomId);
      console.log('Fetched classroom data:', response);
      if (response) {
        setClassroomName(response.name);
        setClassroomDescription(response.description);
        setDarkMode(response.darkMode);
        setWeeklyEmails(response.weeklyEmails);
        setSchoolName(response.schoolName || '');
        setGradeLevel(response.gradeLevel || '');
        setAcademicYear(response.academicYear || '');
        setClassroomNumber(response.classroomNumber || '');
      }
    };
    fetchData();
  }, [classroomId]);

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
      apiClient.deleteClassroom(classroomId)
        .then(() => {
          console.log('Classroom deleted');
          navigate('/');
        })
        .catch((error) => {
          console.error('Error deleting classroom:', error);
        });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMessage('');
      // simple validations per model
      if (!classroomName || classroomName.trim().length === 0) {
        setSaveMessage('Name is required.');
        return;
      }
      if (classroomName.length > 100) {
        setSaveMessage('Name must be at most 100 characters.');
        return;
      }
      const payload = {
        name: classroomName.trim(),
        description: (classroomDescription || '').trim(),
        schoolName: (schoolName || '').trim(),
        gradeLevel: gradeLevel || undefined,
        academicYear: (academicYear || '').trim(),
        classroomNumber: (classroomNumber || '').trim(),
      };
      await apiClient.updateClassroom(classroomId, payload);
      setSaveMessage('Saved changes.');
    } catch (e) {
      console.error('Failed to save classroom', e);
      setSaveMessage('Failed to save.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div className="settings-page">
  {/* Sidebar */}
  <Sidebar classroomId={classroomId} classroomName={classroomName} />
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
          <div className="form-group">
            <label className="form-label">School Name</label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Grade Level</label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="form-input"
            >
              <option value="">Select grade</option>
              {['K','1','2','3','4','5','6','7','8','9','10','11','12'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Academic Year</label>
            <input
              type="text"
              placeholder="e.g., 2024-2025"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Classroom Number</label>
            <input
              type="text"
              value={classroomNumber}
              onChange={(e) => setClassroomNumber(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-actions">
            <button onClick={handleSave} className="save-button" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saveMessage && <span className="save-message">{saveMessage}</span>}
          </div>
        </div>

        {/* <div className="settings-section">
          <h2>Appearance</h2>
          <div className="dark-mode-toggle">
            <button onClick={toggleDarkMode}>
              {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </div>
        </div> */}

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
