import React, { useState } from 'react';

const InviteStudentsModal = ({ onInvite, onCancel }) => {
  const [email, setEmail] = useState('');

  const handleInvite = () => {
    onInvite(email);
    setEmail('');
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
    </div>
  );
};

export default InviteStudentsModal;
