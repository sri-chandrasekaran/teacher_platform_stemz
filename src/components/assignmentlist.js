import React, { useState } from 'react';
import Modal from './assignmentmodal';
import '../styles/assignmentbox.css';
import jsPDF from 'jspdf';

const AssignmentsList = ({ assignments }) => {
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const handleBoxClick = (assignment) => {
    setSelectedAssignment(assignment);
  };

  const handleCloseModal = () => {
    setSelectedAssignment(null);
  };

  const handleDownloadPDF = () => {
    if (!selectedAssignment) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Assignment Analytics', 10, 10);
    
    doc.setFontSize(14);
    doc.text(`Title: ${selectedAssignment.title}`, 10, 20);
    doc.text(`Completion: ${selectedAssignment.progress}%`, 10, 30);
    doc.text(`Average Score: ${selectedAssignment.averageScore}`, 10, 40);
    doc.text(`Time Spent: ${selectedAssignment.timeSpent} hours`, 10, 50);

    doc.save(`${selectedAssignment.title}-Analytics.pdf`);
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
            <button className="download-btn" onClick={handleDownloadPDF}>
              Download as PDF
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AssignmentsList;
