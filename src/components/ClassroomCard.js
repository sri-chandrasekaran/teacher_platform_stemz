import React from 'react';

const ClassroomCard = ({ classroom, onEnter, onDelete }) => {
  return (
    <div className="classroom-card">
      <button
        className="delete-classroom-button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(classroom.id);
        }}
      >
        &ndash;
      </button>
      
      <h3>{classroom.name}</h3>
      <p>{classroom.description}</p>
    </div>
  );
};

export default ClassroomCard;
