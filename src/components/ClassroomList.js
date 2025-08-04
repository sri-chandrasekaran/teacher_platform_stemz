import React, { useState, useEffect } from 'react';
import ClassroomCard from './ClassroomCard';
import EditClassroomModal from './editclassroom';
import InviteStudentsModal from './invitestudents';

const ClassroomList = ({ classrooms, onEnter, onDelete, onEdit, onInvite, onAddClassroom, onSave }) => {
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [classroomList, setClassroomList] = useState(classrooms);
  const [notification, setNotification] = useState('');
  const [notificationVisible, setNotificationVisible] = useState(false);

  useEffect(() => {
    setClassroomList(classrooms);
  }, [classrooms]);

  // Function to open modal for adding a new classroom
  const handleAddClassroom = () => {
    setSelectedClassroom(null);  // Set to null for a new classroom
    setEditModalOpen(true);
    setInviteModalOpen(false);
  };

  const handleEdit = (classroom) => {
    console.log('Edit classroom triggered:', classroom);
    setSelectedClassroom(classroom);
    setEditModalOpen(true);
    setInviteModalOpen(false);
  };

  const handleSaveEdit = (updatedClassroom) => {
    console.log('Save edit triggered:', updatedClassroom);
    
    // Close the modal
    setEditModalOpen(false);
    setSelectedClassroom(null);
    
    // Call the parent's save handler (which handles both create and update)
    if (onSave) {
      onSave(updatedClassroom);
    }
  };

  const handleDelete = (id) => {
    console.log('Delete classroom triggered:', id);
    // Call the parent's delete handler
    if (onDelete) {
      onDelete(id);
    }
    setSelectedClassroom(null);
  };

  const handleInvite = (classroom) => {
    console.log('Invite students triggered:', classroom);
    setSelectedClassroom(classroom);
    setInviteModalOpen(true);
    setEditModalOpen(false);
  };

  const handleSendInvitation = (email) => {
    console.log('Send invitation triggered:', email);
    
    if (selectedClassroom) {
      setNotification(`Invitation sent to ${email} for ${selectedClassroom.name}`);
      setNotificationVisible(true);
      setInviteModalOpen(false);
  
      setTimeout(() => {
        setNotificationVisible(false);
        setNotification('');
      }, 3000);
    }

    // Call the parent's invite handler
    if (onInvite) {
      onInvite(email);
    }
  };

  return (
    <div className="classroom-list">
      {/* Add Classroom Button as a Card */}
      <div
        className="add-classroom-card"
        onClick={handleAddClassroom}
      >
        <span className="add-classroom-icon">+</span>
        <p>Add Classroom</p>
      </div>

      {/* Render existing classrooms */}
      {classroomList && classroomList.length > 0 ? (
        classroomList.map((classroom) => (
          <ClassroomCard
            key={classroom.id}
            classroom={classroom}
            onEnter={onEnter}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onInvite={handleInvite}
          />
        ))
      ) : (
        <div className="no-classrooms">
          <p>No classrooms yet. Create your first classroom!</p>
        </div>
      )}

      {/* Edit Classroom Modal */}
      {isEditModalOpen && (
        <EditClassroomModal
          classroom={selectedClassroom}
          onSave={handleSaveEdit}
          onCancel={() => {
            setEditModalOpen(false);
            setSelectedClassroom(null);
          }}
        />
      )}

      {/* Invite Students Modal */}
      {isInviteModalOpen && selectedClassroom && (
        <InviteStudentsModal
          classroom={selectedClassroom}
          onInvite={handleSendInvitation}
          onCancel={() => {
            setInviteModalOpen(false);
            setSelectedClassroom(null);
          }}
        />
      )}

      {/* Notification Toast */}
      {notificationVisible && (
        <div className="notification-toast">
          {notification}
        </div>
      )}
    </div>
  );
};

export default ClassroomList;