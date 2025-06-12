import React, { useState, useEffect } from 'react';
import ClassroomList from '../components/ClassroomList';
import EditClassroomModal from '../components/editclassroom';
import InviteStudentsModal from '../components/invitestudents';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';

const API_BASE_URL = 'http://localhost:3000/api';

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

  const [courses, setCourses] = useState('');
  const [students, setStudents] = useState('');

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await fetch(API_BASE_URL + `/classrooms`);
        const data = await response.json();
        console.log("Fetched data: ", data);
  
        // Normalize data to fit the structure you're expecting
        const normalizedData = data.map((room, index) => ({
          id: room._id,
          name: room.name,
          description: room.description || 'No description provided',
        }));
        
        console.log("Normalized data: ", normalizedData);
        setClassrooms(normalizedData);
      } catch (error) {
        console.error('Error fetching courses:', error);
  
        const fakeCourses = [
          { course_name: "Fun with Coding" },
          { course_name: "Adventures in Scratch" },
          { course_name: "Building Websites for Beginners" },
          { course_name: "Exploring Robots and AI" },
          { course_name: "Introduction to Computers" },
          { course_name: "Staying Safe Online" },
          { course_name: "Making Your First Mobile App" },
          { course_name: "Creating Simple Video Games" },
          { course_name: "Clouds and the Internet" },
          { course_name: "Money and Technology" }
        ];
  
        const fallbackData = fakeCourses.map((course, index) => ({
          id: index + 100, // Use a different range to avoid collisions
          name: course.course_name,
          description: 'Sample course description',
        }));
  
        setClassrooms(fallbackData);
      }
    };
  
    fetchClassrooms();
  }, []);
  

  // entering a classroom
  const handleEnterClassroom = (id) => {
    const classroom = classrooms.find((classroom) => classroom.id === id);
    if (classroom) {
      // const formattedName = classroom.name.replace(/\s+/g, '-').toLowerCase();
      navigate(`/dashboard/${id}/${classroom.name}`);
    }
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
    const classroom_data = {
      name: newClassroom.name,
      description: newClassroom.description || 'No description provided',
      course_ids: newClassroom.courses || [],
      student_user_ids: newClassroom.students || [],
      teacher_user_id: newClassroom.teacher || '',
    };
    console.log('Adding classroom:', classroom_data);
    try {
      fetch(`${API_BASE_URL}/classrooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classroom_data),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to add classroom');
        }
        return response.json();
      })
      .then(data => {
        console.log('Classroom added:', data);
      });
    }
    catch (error) {
      console.error('Error adding classroom:', error);
      setBannerMessage('Failed to add classroom.');
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    }
  };

  // delete a classroom
  const handleDeleteClassroom = async (id) => {
    setClassrooms(classrooms.filter((classroom) => classroom.id !== id));
    setBannerMessage('Classroom deleted.');
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 3000);

    try {
      const response = await fetch(`${API_BASE_URL}/classrooms/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete classroom');
      }
    }
    catch (error) {
      console.error('Error deleting classroom:', error);
      setBannerMessage('Failed to delete classroom.');
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    }
  };

  //  open edit modal with selected classroom
  const handleEditClassroom = (classroom) => {
    setSelectedClassroom(classroom);
    // setShowEditModal(true);
    setSelectedClassroom(classroom);
    setName(classroom.name || '');          
    setDescription(classroom.description || '');
    setIsModalOpen(true);
    console.log('Editing classroom:', classroom);
    // console.log('Name:', name);
    // console.log('Description:', description);
  };

  //  save the edited classroom
  const handleSaveClassroom = (updatedClassroom) => {
    console.log('Saving classroom:', updatedClassroom);
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
            placeholder="Name"
            value={newClassroomName}
            onChange={(e) => setNewClassroomName(e.target.value)}
          />
          <textarea
            placeholder="Classroom Description"
            value={newClassroomDescription}
            onChange={(e) => setNewClassroomDescription(e.target.value)}
          />
          <select
            value={newClassroomDescription}
            onChange={(e) => setNewClassroomDescription(e.target.value)}
            style={{ marginBottom: '10px' }}
          >
            <option value="">Select a description</option>
            <option value="Students from Class A">Students from Class A</option>
            <option value="Students from Class B">Students from Class B</option>
            <option value="Advanced Students">Advanced Students</option>
            <option value="Beginner Group">Beginner Group</option>
            <option value="Intermediate Group">Intermediate Group</option>
          </select>
          
          <button onClick={() => handleAddClassroom({ id: Date.now(), name: newClassroomName, description: newClassroomDescription })}>Save</button>
          <button onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
