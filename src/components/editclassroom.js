import React, { useState } from 'react';

const EditClassroomModal = ({ classroom, onSave, onCancel }) => {
  const [name, setName] = useState(classroom.name);
  const [description, setDescription] = useState(classroom.description);

  const handleSave = () => {
    onSave({
      ...classroom,
      name,
      description,
    });
  };

  return (
    <div className="edit-classroom-form">
      <h3>Edit Classroom</h3>
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
      <button onClick={handleSave}>Save Changes</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default EditClassroomModal;
