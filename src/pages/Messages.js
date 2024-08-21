import React, { useState } from 'react';
import '../styles/messaging.css';

const MessagingPage = () => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [announcements, setAnnouncements] = useState([]); // Track multiple announcements

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

    setAnnouncements([...announcements, newMessage]); // Add new announcement to the array
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
