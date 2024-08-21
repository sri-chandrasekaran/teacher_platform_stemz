import React, { useState } from 'react';

const PostModal = ({ onClose }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assignmentType, setAssignmentType] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const renderForm = () => {
    if (selectedOption === 'announcement') {
      return (
        <form>
          <h3>Make an Announcement</h3>
          <textarea placeholder="Enter your announcement here..." rows="5" style={{ width: '100%' }}></textarea>
          <button type="submit">Post Announcement</button>
        </form>
      );
    } else if (selectedOption === 'assignment') {
      return (
        <form>
          <h3>Assign a Task</h3>

          {/* Course Dropdown */}
          <label>Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          >
            <option value="">Select a Course</option>
            <option value="math">Astronomy</option>
            <option value="science">Basics of Coding</option>
            <option value="history">Chemistry</option>
          </select>

          {/* Assignment Type Dropdown */}
          <label>Assignment Type</label>
          <select
            value={assignmentType}
            onChange={(e) => setAssignmentType(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          >
            <option value="">Select Assignment Type</option>
            <option value="quiz">Quiz</option>
            <option value="worksheet">Worksheet</option>
            <option value="lesson">Lesson</option>
          </select>

          <label>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          />

          <label>Additional Details</label>
          <textarea
            rows="3"
            style={{ width: '100%' }}
          ></textarea>

          <button type="submit" style={{ marginTop: '10px' }}>Assign Task</button>
        </form>
      );
    }
  };

  return (
    <div className="modal-overlay corner-modal">
      <div className="modal-content corner-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Create a New Post</h2>
        <div className="post-options">
          <button onClick={() => handleOptionChange('announcement')}>Make an Announcement</button>
          <button onClick={() => handleOptionChange('assignment')}>Assign a Task</button>
        </div>
        {renderForm()}
      </div>
    </div>
  );
};

export default PostModal;
