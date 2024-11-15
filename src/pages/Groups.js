import React, { useState } from 'react';
import ClassroomList from '../components/ClassroomList';
import EditClassroomModal from '../components/editclassroom';
import InviteStudentsModal from '../components/invitestudents';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';

const GroupsPage = () => {
  const navigate = useNavigate();
  
  const [classrooms, setClassrooms] = useState([
    { id: 1, name: 'Group 1', description: 'Students from Class A' },
    { id: 2, name: 'Group 2', description: 'Students from Class B' },
    { id: 3, name: 'Group 3', description: 'Advanced Students' }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState('');
  const [newClassroomDescription, setNewClassroomDescription] = useState('');
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [classroomToInvite, setClassroomToInvite] = useState(null);

  const [bannerMessage, setBannerMessage] = useState('');
  const [showBanner, setShowBanner] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // entering a classroom
  const handleEnterClassroom = (id) => {
    navigate(`/dashboard/${id}`);
  };

  // add a new classroom
  const handleAddClassroom = (newClassroom) => {
    setClassrooms([...classrooms, newClassroom]);
    setShowForm(false);
    setNewClassroomName('');
    setNewClassroomDescription('');
    setBannerMessage('Classroom added successfully.');
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 3000);
  };

  // delete a classroom
  const handleDeleteClassroom = (id) => {
    setClassrooms(classrooms.filter((classroom) => classroom.id !== id));
    setBannerMessage('Classroom deleted.');
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 3000);
  };

  //  open edit modal with selected classroom
  const handleEditClassroom = (classroom) => {
    setSelectedClassroom(classroom);
    // setShowEditModal(true);
    setSelectedClassroom(classroom);
    setName(classroom.name || '');          
    setDescription(classroom.description || '');
    setIsModalOpen(true);
  };

  //  save the edited classroom
  const handleSaveClassroom = (updatedClassroom) => {
    setClassrooms(
      classrooms.map((classroom) =>
        classroom.id === updatedClassroom.id ? updatedClassroom : classroom
      )
    );
    setShowEditModal(false);
    setSelectedClassroom(null);
    setBannerMessage('Classroom updated successfully.');
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 3000);
  };

  // inviting a student
  const handleInviteStudent = (classroom) => {
    setClassroomToInvite(classroom);
    setShowInviteModal(true);
    setShowEditModal(false);
  };

  // send invitation
  const handleSendInvitation = (email) => {
    setShowInviteModal(false);
    setBannerMessage(`Invitation email sent to: ${email}`);
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 3000);
  };

  return (
    <div className="classroom-list-container">
      {showBanner && <div className="confirmation-banner">{bannerMessage}</div>}

    <div className="page-container">
    <div className="page-heading-container">
      <h2 className="page-heading">Your Classrooms</h2>
    </div>
    <div className="classroom-list-scroll">
      <ClassroomList
        classrooms={classrooms}
        onEnter={handleEnterClassroom}
        onDelete={handleDeleteClassroom}
        onEdit={handleEditClassroom}
        onInvite={handleInviteStudent}
        onAddClassroom={handleAddClassroom}
      />
    </div>
  </div>

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
      )},

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
          <button onClick={() => handleAddClassroom({ id: Date.now(), name: newClassroomName, description: newClassroomDescription })}>Save</button>
          <button onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
