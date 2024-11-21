import React from 'react';

const ClassroomCard = ({ classroom, onEnter, onDelete, onEdit, onInvite }) => {
  const handleEdit = (e) => {
    e.stopPropagation(); 
    onEdit(classroom.id); 
  };

  const handleDelete = (e) => {
    e.stopPropagation(); 
    onDelete(classroom.id); 
  };

  const handleInvite = (e) => {
    e.stopPropagation(); 
    onInvite(classroom.id);  
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
