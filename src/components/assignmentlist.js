import React, { useState } from 'react';
import Modal from './assignmentmodal';
import '../styles/assignmentbox.css';

const AssignmentsList = ({ assignments }) => {
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const handleBoxClick = (assignment) => {
    setSelectedAssignment(assignment);
  };

  const handleCloseModal = () => {
    setSelectedAssignment(null);
  };

  return (
    <div className="assignments-list">
      {assignments.map((assignment) => (
        <div
          key={assignment.id}
          className="assignment-box"
          onClick={() => handleBoxClick(assignment)}
        >
          <div className="assignment-title">{assignment.title}</div>
          <div className="assignment-progress">
            <div
              className="assignment-progress-bar"
              style={{ width: `${assignment.progress}%` }}
            />
          </div>
        </div>
      ))}

      <Modal show={selectedAssignment !== null} onClose={handleCloseModal}>
        {selectedAssignment && (
          <div>
            <h2>{selectedAssignment.title} - Analytics</h2>
            <p>Completion: {selectedAssignment.progress}%</p>
            <p>Average Score: {selectedAssignment.averageScore}</p>
            <p>Time Spent: {selectedAssignment.timeSpent} hours</p>
            <button className="download-btn">Download as PDF</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AssignmentsList;
