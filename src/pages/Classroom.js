import React, { useState } from 'react';
import { Routes, Route, useParams, useLocation } from 'react-router-dom'; // Ensure useLocation is imported
import Navbar from '../components/Navbar';
import StudentsPage from './Students';
import MessagingPage from './Messages';
import Post from '../pages/post'; 

const ClassroomPage = () => {
  const { id } = useParams();
  const location = useLocation(); // Using useLocation to get the current path
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div className="classroom-page">
      <h2 className="classroom-heading">Classroom {id}</h2>
      <Navbar classroomId={id} />
      <Routes>
        <Route path="students" element={<StudentsPage />} />
        <Route path="messages" element={<MessagingPage />} />
      </Routes>

      {location.pathname.includes('students') && (
        <button className="floating-button" onClick={openModal}>+</button>
      )}

      {isModalOpen && <Post onClose={closeModal} />}
    </div>
  );
};

export default ClassroomPage;
