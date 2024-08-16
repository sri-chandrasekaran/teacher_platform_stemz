import React, { useState } from 'react';

const ClassroomCard = ({ classroom, onEnter, onDelete, onEdit, onInvite }) => {
  return (
    <div className="classroom-card" onClick={() => onEnter(classroom.id)}>
      <button
        className="edit-classroom-button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(classroom);
        }}
      >
        ✏️
      </button>
      <button
        className="delete-classroom-button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(classroom.id);
        }}
      >
        &#10005;
      </button>
      <button
        className="invite-students-button"
        onClick={(e) => {
          e.stopPropagation();
          onInvite(classroom);
        }}
      >
        📧
      </button>
      <h3>{classroom.name}</h3>
      <p>{classroom.description}</p>
    </div>
  );
};

export default ClassroomCard;
