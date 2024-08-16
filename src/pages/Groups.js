import React, { useState } from 'react';
import ClassroomList from '../components/ClassroomList';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';

const GroupsPage = () => {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([
    { id: 1, name: 'Group 1', description: 'Students from Class A' },
    { id: 2, name: 'Group 2', description: 'Students from Class B' },
    { id: 3, name: 'Group 3', description: 'Advanced Students' },
    { id: 4, name: 'some class', description: '' },
    { id: 5, name: 'new class', description: '' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState('');
  const [newClassroomDescription, setNewClassroomDescription] = useState('');

  const handleEnterClassroom = (id) => {
    navigate(`/classroom/${id}`);
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
    setClassrooms(classrooms.filter(classroom => classroom.id !== id));
  };

  return (
    <div className="classroom-list-container">
      <h2 className="page-heading">Your Classrooms</h2>
      <ClassroomList
        classrooms={classrooms}
        onEnter={handleEnterClassroom}
        onDelete={handleDeleteClassroom}
      />

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
