import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaHome, FaUsers, FaEnvelope, FaBell, FaCog, FaChartLine, FaPlusCircle } from 'react-icons/fa';
import '../styles/styles.css';

const MessagingPage = () => {
  const { classroomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState('');
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [groupChats, setGroupChats] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]); // State for students

  // Fetch students on component load
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('https://core-server-nine.vercel.app/api/students');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStudents(data.map(student => student.student_name)); // Adjust based on your API response structure
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
  
    fetchStudents();
  }, []);
  

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    if (!messages[student]) {
      setMessages({ ...messages, [student]: [] });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    setMessages({
      ...messages,
      [selectedStudent]: [...messages[selectedStudent], newMessage],
    });
    setNewMessage('');
  };

  const handleSendAnnouncement = () => {
    if (newMessage.trim() === '') return;
    setAnnouncements([...announcements, newMessage]);
    setNewMessage('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      selectedStudent === 'announcement' ? handleSendAnnouncement() : handleSendMessage();
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      setError('Group name cannot be empty.');
      return;
    }
    if (groupChats.includes(groupName)) {
      setError('A group with this name already exists.');
      return;
    }
    setGroupChats([...groupChats, groupName]);
    setMessages({ ...messages, [groupName]: [] });
    setShowCreateGroup(false);
    setSelectedStudents([]);
    setGroupName('');
    setSelectedStudent(groupName);
    setError('');
  };

  const handleCheckboxChange = (student) => {
    setSelectedStudents(selectedStudents.includes(student)
      ? selectedStudents.filter(s => s !== student)
      : [...selectedStudents, student]);
  };

  return (
    <div className="messaging-page">
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

      {/* Main Content */}
      <div className="content">
        <div className="chat-container">
          {/* Student List */}
          <div className="student-list">
            <div className={`student-item ${selectedStudent === 'announcement' ? 'selected' : ''}`} onClick={() => setSelectedStudent('announcement')}>Make an Announcement</div>
            {students.map((student) => (
              <div key={student} className={`student-item ${selectedStudent === student ? 'selected' : ''}`} onClick={() => handleStudentSelect(student)}>{student}</div>
            ))}
            {groupChats.map((group) => (
              <div key={group} className={`student-item ${selectedStudent === group ? 'selected' : ''}`} onClick={() => handleStudentSelect(group)}>{group}</div>
            ))}
            <div className="student-item create-group" onClick={() => setShowCreateGroup(true)}>Create a Study Group</div>
          </div>

          {/* Create Group Modal */}
          {showCreateGroup && (
            <div className="create-group-modal">
              <div className="modal-content">
                <h3>Create a Study Group</h3>
                <input
                  type="text"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="group-name-input"
                />
                {error && <div className="error-message">{error}</div>}
                <h4>Select students for the group</h4>
                <div className="checkbox-container">
                  {students.map((student) => (
                    <label key={student}>
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student)}
                        onChange={() => handleCheckboxChange(student)}
                      />
                      {student}
                    </label>
                  ))}
                </div>
                <div className="modal-buttons">
                  <button className="create-button" onClick={handleCreateGroup}>Create Group</button>
                  <button className="cancel-button" onClick={() => setShowCreateGroup(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Chat Area */}
          <div className="chat-area">
            <div className="chat-history">
              {selectedStudent === 'announcement' ? (
                announcements.length > 0 ? (
                  announcements.map((announcement, index) => (
                    <div key={index} className="announcement-message">Announcement: {announcement}</div>
                  ))
                ) : (
                  <div className="announcement-placeholder">What would you like to announce?</div>
                )
              ) : selectedStudent && messages[selectedStudent] ? (
                messages[selectedStudent].map((msg, index) => (
                  <div key={index} className="chat-message">{msg}</div>
                ))
              ) : (
                'Select a student to start messaging'
              )}
            </div>
            {selectedStudent && (
              <div className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedStudent === 'announcement' ? 'Type your announcement...' : 'Type your message...'}
                />
                <button onClick={selectedStudent === 'announcement' ? handleSendAnnouncement : handleSendMessage}>Send</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
