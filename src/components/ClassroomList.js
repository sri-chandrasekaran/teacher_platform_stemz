import React, { useState } from 'react';
import ClassroomCard from './ClassroomCard';
import EditClassroomModal from './editclassroom';
import InviteStudentsModal from './invitestudents';

const ClassroomList = ({ classrooms, onEnter, onDelete, onEdit, onInvite, onAddClassroom }) => {
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [classroomList, setClassroomList] = useState(classrooms);

  // Function to open modal for adding a new classroom
  const handleAddClassroom = () => {
    setSelectedClassroom(null);  // Set to null for a new classroom
    setEditModalOpen(true);
    setInviteModalOpen(false);
  };

  const handleEdit = (id) => {
    const classroom = classroomList.find((classroom) => classroom.id === id);
    setSelectedClassroom(classroom);
    setEditModalOpen(true);
    onEdit(id);
    setInviteModalOpen(false);
  };

  const handleSaveEdit = (updatedClassroom) => {
    if (updatedClassroom.id) {
      // Update existing classroom
      setClassroomList((prevClassrooms) =>
        prevClassrooms.map((classroom) =>
          classroom.id === updatedClassroom.id ? updatedClassroom : classroom
        )
      );
    } else {
      // Add new classroom
      const newClassroom = { ...updatedClassroom, id: Date.now() };  // Generate unique ID
      setClassroomList((prevClassrooms) => [...prevClassrooms, newClassroom]);
      onAddClassroom(newClassroom);  // Notify parent to show confirmation banner
    }
    setEditModalOpen(false);
  };

  const handleDelete = (id) => {
    const updatedClassrooms = classroomList.filter((classroom) => classroom.id !== id);
    setClassroomList(updatedClassrooms);
    onDelete(id);
    setSelectedClassroom(null);
  };

  return (
    <div className="classroom-list">
      {/* Add Classroom Button as a Card */}
      <div
        className="add-classroom-card"
        onClick={handleAddClassroom}
      >
        <span className="add-classroom-icon">+</span>
      </div>

      {classroomList.map((classroom) => (
        <ClassroomCard
          key={classroom.id}
          classroom={classroom}
          onEnter={onEnter}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onInvite={() => setInviteModalOpen(true)}
        />
      ))}

      {/* Edit Classroom Modal */}
      {isEditModalOpen && (
        <EditClassroomModal
          classroom={selectedClassroom}
          onSave={handleSaveEdit}
          onCancel={() => setEditModalOpen(false)}
        />
      )}

      {/* Invite Students Modal */}
      {isInviteModalOpen && selectedClassroom && (
        <InviteStudentsModal
          onInvite={(email) => console.log(`Inviting ${email} to ${selectedClassroom.name}`)}
          onCancel={() => setInviteModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ClassroomList;
