import React, { useState, useEffect } from 'react';

const EditClassroomModal = ({ classroom, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Ensure that name and description get set every time the modal opens with a new classroom
  useEffect(() => {
    if (classroom) {
      setName(classroom.name || '');          // Set name if it exists
      setDescription(classroom.description || ''); // Set description if it exists
    }
  }, [classroom]);

  const handleSave = () => {
    onSave({
      ...classroom,   // Maintain existing classroom data
      name,
      description,
    });
  };

  return (
    <div className="edit-classroom-form">
      <h3>{classroom ? 'Edit Classroom' : 'Add Classroom'}</h3>
      <input
        type="text"
        placeholder="Classroom Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        placeholder="Classroom Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button className="button-save" onClick={handleSave}>Save Changes</button>
      <button className="button-cancel" onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default EditClassroomModal;
