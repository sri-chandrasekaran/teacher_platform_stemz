import React from 'react';
import ClassroomCard from './ClassroomCard';

const ClassroomList = ({ classrooms, onEnter, onDelete, onEdit, onInvite }) => {
  return (
    <div className="classroom-list">
      {classrooms.map(classroom => (
        <ClassroomCard
          key={classroom.id}
          classroom={classroom}
          onEnter={onEnter}
          onDelete={onDelete}
          onEdit={onEdit}
          onInvite={onInvite}
        />
      ))}
    </div>
  );
};

export default ClassroomList;