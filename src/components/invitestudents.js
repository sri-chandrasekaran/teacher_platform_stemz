import React, { useState } from 'react';

const InviteStudentsModal = ({ onInvite, onCancel, classroomName }) => {
  const [email, setEmail] = useState('');
  const [notification, setNotification] = useState('');

  const handleInvite = () => {
    onInvite(email);
    setNotification(`${email} has been added to ${classroomName}`);
    setEmail('');
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="invite-students-form">
      <h3>Invite Students</h3>
      <input
        type="email"
        placeholder="Student Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="button-save" onClick={handleInvite}>Add</button>
      <button className="button-cancel" onClick={onCancel}>Cancel</button>
      {notification && <p>{notification}</p>}
    </div>
  );
};


export default InviteStudentsModal;
