import React, { useState } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import '../styles/messaging.css';

const MessagingPage = () => {
  const navigate = useNavigate();

  const [selectedStudent, setSelectedStudent] = useState('');
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [announcements, setAnnouncements] = useState([]);

  const students = ['Student 1', 'Student 2', 'Student 3'];

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

  return (
    <div className="messaging-page">
      <div className="home-icon" onClick={() => navigate('/')}>
        <HomeIcon style={{ fontSize: '48px', cursor: 'pointer' }} />
      </div>
      <div className="student-list">
        <div
          className={`student-item ${
            selectedStudent === 'announcement' ? 'selected' : ''
          }`}
          onClick={() => setSelectedStudent('announcement')}
        >
          Make an Announcement
        </div>
        {students.map((student) => (
          <div
            key={student}
            className={`student-item ${
              selectedStudent === student ? 'selected' : ''
            }`}
            onClick={() => handleStudentSelect(student)}
          >
            {student}
          </div>
        ))}
      </div>
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
  );
};

export default MessagingPage;
