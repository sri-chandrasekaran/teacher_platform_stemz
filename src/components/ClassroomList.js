import React from 'react';
import ClassroomCard from './ClassroomCard';

const ClassroomList = ({ classrooms, onEnter, onDelete }) => {
  return (
    <div className="classroom-list">
      {classrooms.map(classroom => (
        <ClassroomCard
          key={classroom.id}
          classroom={classroom}
          onEnter={onEnter}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ClassroomList;