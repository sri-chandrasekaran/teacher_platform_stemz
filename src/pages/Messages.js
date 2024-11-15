import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaHome, FaUsers, FaEnvelope, FaBell, FaCog, FaChartLine, FaPlusCircle } from 'react-icons/fa';
import '../styles/messaging.css';

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

  const students = ['Student 1', 'Student 2', 'Student 3', 'Student 4', 'Student 5']; // Replace with actual student list

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
      if (selectedStudent === 'announcement') {
        handleSendAnnouncement();
      } else {
        handleSendMessage();
      }
    }
  };

  const handleCreateGroup = () => {
    // Handle creating a group by selecting students
    console.log("Created group with students:", selectedStudents);
    setShowCreateGroup(false);
  };

  const handleCheckboxChange = (student) => {
    if (selectedStudents.includes(student)) {
      setSelectedStudents(selectedStudents.filter(s => s !== student));
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  return (
    <div className="messaging-page">
      {/* Sidebar */}
      <div className="sidebar">
        <ul className="sidebar-links">
          <li>
            <Link to="/">
              <FaHome className="sidebar-icon" />
            </Link>
          </li>
          <li>
            <Link to={`/dashboard/${classroomId}`}>
              <FaChartLine className={`sidebar-icon ${location.pathname === `/dashboard/${classroomId}` ? 'active' : ''}`} />
            </Link>
          </li>
          <li>
            <Link to="/users">
              <FaUsers className={`sidebar-icon ${location.pathname === '/users' ? 'active' : ''}`} />
            </Link>
          </li>
          <li>
            <Link to="/messages">
              <FaEnvelope className={`sidebar-icon ${location.pathname === '/messages' ? 'active' : ''}`} />
            </Link>
          </li>
          <li>
            <Link to="/notifications">
              <FaBell className={`sidebar-icon ${location.pathname === '/notifications' ? 'active' : ''}`} />
            </Link>
          </li>
          <li>
            <Link to="/settings">
              <FaCog className={`sidebar-icon ${location.pathname === '/settings' ? 'active' : ''}`} />
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        <div className="home-icon" onClick={() => navigate('/')}>
          <FaHome style={{ fontSize: '48px', cursor: 'pointer' }} />
        </div>
        
        {/* Student List */}
        <div className="student-list">
          <div
            className={`student-item ${selectedStudent === 'announcement' ? 'selected' : ''}`}
            onClick={() => setSelectedStudent('announcement')}
          >
            Make an Announcement
          </div>
          {students.map((student) => (
            <div
              key={student}
              className={`student-item ${selectedStudent === student ? 'selected' : ''}`}
              onClick={() => handleStudentSelect(student)}
            >
              {student}
            </div>
          ))}
          <div
            className="student-item create-group"
            onClick={() => setShowCreateGroup(true)}
          >
            <FaPlusCircle /> Create a Study Group
          </div>
        </div>

        {/* Create Group Modal */}
        {showCreateGroup && (
          <div className="create-group-modal">
            <div className="modal-content">
              <h3>Select students for the study group</h3>
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
              <button onClick={handleCreateGroup}>Create Group</button>
              <button onClick={() => setShowCreateGroup(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="chat-area">
          <div className="chat-history">
            {selectedStudent === 'announcement' ? (
              announcements.length > 0 ? (
                announcements.map((announcement, index) => (
                  <div key={index} className="announcement-message">
                    Announcement: {announcement}
                  </div>
                ))
              ) : (
                <div className="announcement-placeholder">What would you like to announce?</div>
              )
            ) : selectedStudent && messages[selectedStudent] ? (
              messages[selectedStudent].map((msg, index) => (
                <div key={index} className="chat-message">
                  {msg}
                </div>
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
                placeholder={
                  selectedStudent === 'announcement'
                    ? 'Type your announcement...'
                    : 'Type your message...'
                }
              />
              <button
                onClick={
                  selectedStudent === 'announcement'
                    ? handleSendAnnouncement
                    : handleSendMessage
                }
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
