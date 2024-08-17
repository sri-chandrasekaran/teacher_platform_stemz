import React, { useState } from 'react';
import ProgressBar from './progressbar';
import '../styles/assignmentbox.css';

const AssignmentBox = ({ assignment }) => {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="assignment-box">
      <div onClick={handleOpenModal} className="assignment-content">
        <h3>{assignment.title}</h3>
        <ProgressBar progress={assignment.progress} />
      </div>

      {showModal && (
        <div className="assignment-modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseModal}>
              &times;
            </span>
            <h2>{assignment.title} - Analytics</h2>
            {/* Here you would include detailed analytics */}
            <p>Completion: {assignment.progress}%</p>
            <p>Average Score: {assignment.averageScore}</p>
            <p>Time Spent: {assignment.timeSpent} hours</p>
            {/* Add more analytics data as needed */}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentBox;