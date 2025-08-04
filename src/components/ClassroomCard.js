import React from 'react';

const ClassroomCard = ({ classroom, onEnter, onDelete, onEdit, onInvite }) => {
  const handleEdit = (e) => {
    e.stopPropagation(); 
    onEdit(classroom); // Pass the whole classroom object instead of just ID
  };

  const handleDelete = (e) => {
    e.stopPropagation(); 
    onDelete(classroom.id); 
  };

  const handleInvite = (e) => {
    e.stopPropagation(); 
    onInvite(classroom);  // Pass the whole classroom object
  };

  const handleEnter = () => {
    console.log('Entering classroom:', classroom);
    onEnter(classroom.id, classroom.name); // Pass both ID and name for navigation
  };

  return (
    <div className="classroom-card" onClick={handleEnter}>
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
      
      {/* Show additional info */}
      <div className="classroom-meta">
        <small>Grade {classroom.gradeLevel} • {classroom.studentCount} students</small>
      </div>
    </div>
  );
};

export default ClassroomCard;