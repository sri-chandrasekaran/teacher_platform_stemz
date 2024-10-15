import React, { useState, useEffect } from 'react';
import ClassroomList from '../components/ClassroomList';
import EditClassroomModal from '../components/editclassroom';
import InviteStudentsModal from '../components/invitestudents';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';
import { call_api } from '../api';

const GroupsPage = () => {
  const navigate = useNavigate();
  
  const [classrooms, setClassrooms] = useState([]);

  // Fetch classrooms from API using the call_api function
  useEffect(() => {
    call_api(null, 'classrooms', 'GET')
      .then(data => setClassrooms(data))
      .catch(error => console.error('Error fetching classrooms:', error));
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState('');
  const [newClassroomDescription, setNewClassroomDescription] = useState('');
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [classroomToInvite, setClassroomToInvite] = useState(null);

  const [bannerMessage, setBannerMessage] = useState('');
  const [showBanner, setShowBanner] = useState(false);

  const handleEnterClassroom = (id) => {
    navigate(`/classroom/${id}/students`);
  };

  const handleAddClassroom = () => {
    const newClassroom = {
      id: classrooms.length + 1,
      name: newClassroomName,
      description: newClassroomDescription,
    };
    setClassrooms([...classrooms, newClassroom]);
    setShowForm(false);
    setNewClassroomName('');
    setNewClassroomDescription('');
  };

  const handleDeleteClassroom = (id) => {
    setClassrooms(classrooms.filter((classroom) => classroom.id !== id));
  };

  const handleEditClassroom = (classroom) => {
    setSelectedClassroom(classroom);
    setShowEditModal(true);
  };

  const handleSaveClassroom = (updatedClassroom) => {
    setClassrooms(
      classrooms.map((classroom) =>
        classroom.id === updatedClassroom.id ? updatedClassroom : classroom
      )
    );
    setShowEditModal(false);
    setSelectedClassroom(null);
  };

  const handleInviteStudent = (classroom) => {
    setClassroomToInvite(classroom);
    setShowInviteModal(true);
  };

  const handleSendInvitation = (email) => {
    setShowInviteModal(false);

    call_api(null, `users/email/${email}`, "GET")
    .then(data => console.log(data))
    .catch(error => console.error('Error fetching classrooms:', error));

    setBannerMessage(`Confirmation email sent to: ${email}`);
    setShowBanner(true);

    setTimeout(() => {
      setShowBanner(false);
    }, 3000);
  };


  return (
    <div className="classroom-list-container">
      {showBanner && <div className="confirmation-banner">{bannerMessage}</div>}

      <h2 className="page-heading">Your Classrooms</h2>
      <ClassroomList
        classrooms={classrooms}
        onEnter={handleEnterClassroom}
        onDelete={handleDeleteClassroom}
        onEdit={handleEditClassroom}
        onInvite={handleInviteStudent} 
      />

      {showEditModal && (
        <EditClassroomModal
          classroom={selectedClassroom}
          onSave={handleSaveClassroom}
          onCancel={() => setShowEditModal(false)}
        />
      )}

      {showInviteModal && (
        <InviteStudentsModal
          classroom={classroomToInvite}
          onInvite={handleSendInvitation}
          onCancel={() => setShowInviteModal(false)}
        />
      )}

      <button
        className="add-classroom-button"
        onClick={() => setShowForm(true)}
      >
        +
      </button>

      {showForm && (
        <div className="create-classroom-form">
          <h3>Create a New Classroom</h3>
          <input
            type="text"
            placeholder="Classroom Name"
            value={newClassroomName}
            onChange={(e) => setNewClassroomName(e.target.value)}
          />
          <textarea
            placeholder="Classroom Description"
            value={newClassroomDescription}
            onChange={(e) => setNewClassroomDescription(e.target.value)}
          />
          <button onClick={handleAddClassroom}>Add Classroom</button>
          <button onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
