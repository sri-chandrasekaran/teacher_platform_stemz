import React, { useState } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StudentsPage from './Students';
import AnalyticsPage from './Analytics';
import Post from '../pages/post'; 

const ClassroomPage = () => {
  const { id } = useParams();
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div className="classroom-page">
      <Navbar classroomId={id} />
      <h2 className="classroom-heading">Classroom {id}</h2>
      <Routes>
        <Route path="students" element={<StudentsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Routes>

      <button className="floating-button" onClick={openModal}>
        +
      </button>

      {isModalOpen && <Post onClose={closeModal} />}
    </div>
  );
};

export default ClassroomPage;
