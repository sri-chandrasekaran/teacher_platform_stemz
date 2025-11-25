import React, { useState } from 'react';
import AddStudentModal from '../components/AddStudentModal';

const ClassroomCard = ({ classroom, onEnter, onDelete, onEdit, onInvite, students = [], onStudentAdded }) => {
  const [isModalOpen, setModalOpen] = useState(false);

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
    setModalOpen(true);
  };

  const handleEnter = () => {
    console.log('Entering classroom:', classroom);
    onEnter(classroom.id, classroom.name); // Pass both ID and name for navigation
  };

  const closeModal = () => setModalOpen(false);


  const handleStudentAdded = (newStudent) => {
    if (onStudentAdded) {
      onStudentAdded(newStudent, classroom.id); // Pass classroom ID as well
    }
    // You might want to update local state or trigger a parent component update here
  };

  return (
    <>
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
        title="Add Student"
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
      <AddStudentModal 
      isOpen={isModalOpen} 
      onClose={closeModal} 
      classroomId={classroom.id}
      students={students}
      onStudentAdded={handleStudentAdded}
    />
  </>
  );
};

export default ClassroomCard;