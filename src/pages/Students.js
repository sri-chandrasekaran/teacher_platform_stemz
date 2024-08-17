import React, { useState } from 'react';
import '../styles/styles.css';
import Navbar from '../components/Navbar';

const StudentsAnalyticsPage = ({ classroomId }) => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const handleStudentChange = (e) => {
    setSelectedStudent(e.target.value);
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  const renderAnalytics = () => {
    if (!selectedStudent && !selectedCourse) {
      return <div>Showing cumulative analytics...</div>;
    } else if (selectedStudent && !selectedCourse) {
      return <div>Showing analytics for {selectedStudent} across all courses...</div>;
    } else if (!selectedStudent && selectedCourse) {
      return <div>Showing analytics for {selectedCourse} across all students...</div>;
    } else {
      return <div>Showing analytics for {selectedStudent} in {selectedCourse}...</div>;
    }
  };

  return (
    <div className="analytics-page">
      {/* <Navbar classroomId={classroomId} /> */}
      
      <div className="analytics-controls">
        <select onChange={handleStudentChange} value={selectedStudent}>
          <option value="">Select a Student</option>
          <option value="Student 1">Name of Student 1</option>
          <option value="Student 2">Name of Student 2</option>
          <option value="Student 3">Name of Student 3</option>
          {/* Add more students as needed */}
        </select>

        <select onChange={handleCourseChange} value={selectedCourse}>
          <option value="">Select a Course</option>
          <option value="Course 1">Course 1</option>
          <option value="Course 2">Course 2</option>
          <option value="Course 3">Course 3</option>
          {/* Add more courses as needed */}
        </select>
      </div>

      <div className="analytics-content">
        {renderAnalytics()}
      </div>
    </div>
  );
};

export default StudentsAnalyticsPage;
