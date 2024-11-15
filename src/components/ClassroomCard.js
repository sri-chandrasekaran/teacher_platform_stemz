import React from 'react';

const ClassroomCard = ({ classroom, onEnter, onDelete, onEdit, onInvite }) => {
  const handleEdit = (e) => {
    e.stopPropagation(); // Prevents triggering onEnter (the navigation) when editing
    onEdit(classroom.id);  // Send the ID to the parent for analytics
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevents triggering onEnter (the navigation) when deleting
    onDelete(classroom.id);  // Send the ID to the parent for analytics
  };

  const handleInvite = (e) => {
    e.stopPropagation(); // Prevents triggering onEnter (the navigation) when inviting
    onInvite(classroom.id);  // Send the ID to the parent for analytics
  };

  return (
    <div className="classroom-card" onClick={() => onEnter(classroom.id)}>
      <button
        className="edit-classroom-button"
        onClick={handleEdit}
      >
        ✏️
      </button>
      <button
        className="delete-classroom-button"
        onClick={handleDelete}
      >
        &#10005;
      </button>
      <button
        className="invite-students-button"
        onClick={handleInvite}
      >
        📧
      </button>
      <h3>{classroom.name}</h3>
      <p>{classroom.description}</p>
    </div>
  );
};


export default ClassroomCard;
