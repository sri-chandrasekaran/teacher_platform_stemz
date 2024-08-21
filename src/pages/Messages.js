import React, { useState } from 'react';
import '../styles/messaging.css';

const MessagingPage = () => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');

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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="messaging-page">
      <div className="student-list">
        {students.map((student) => (
          <div
            key={student}
            className={`student-item ${selectedStudent === student ? 'selected' : ''}`}
            onClick={() => handleStudentSelect(student)}
          >
            {student}
          </div>
        ))}
      </div>
      <div className="chat-area">
        <div className="chat-history">
          {selectedStudent && messages[selectedStudent]
            ? messages[selectedStudent].map((msg, index) => (
                <div
                  key={index}
                  className={`chat-message ${
                    msg.includes('Message from') ? 'incoming' : 'outgoing'
                  }`}
                >
                  {msg}
                </div>
              ))
            : 'Select a student to start messaging'}
        </div>
        {selectedStudent && (
          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingPage;
