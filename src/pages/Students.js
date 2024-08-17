import React, { useState } from 'react';
import '../styles/styles.css';
import Navbar from '../components/Navbar';
import AssignmentsList from '../components/assignmentlist';

// Mock data for now
const mockAssignments = [
  { id: 1, title: 'Lesson 1', progress: 75 },
  { id: 1, title: 'Lesson 2', progress: 75 },
  { id: 1, title: 'Lesson 3', progress: 75 },
  { id: 1, title: 'Lesson 4', progress: 0 },
  { id: 2, title: 'Quiz', progress: 50 },
  { id: 3, title: 'Worksheet', progress: 30 },
];

const fetchAssignmentsForCourse = (courseId) => {
  return mockAssignments;
};

const StudentsAnalyticsPage = ({ classroomId }) => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assignments, setAssignments] = useState([]);

  const handleStudentChange = (e) => {
    setSelectedStudent(e.target.value);
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);

    const filteredAssignments = fetchAssignmentsForCourse(e.target.value);
    setAssignments(filteredAssignments);
  };

  return (
    <div className="analytics-page">
      <div className="analytics-controls">
        <select onChange={handleStudentChange} value={selectedStudent}>
          <option value="">Select a Student</option>
          <option value="Student 1">Name of Student 1</option>
          <option value="Student 2">Name of Student 2</option>
          <option value="Student 3">Name of Student 3</option>
        </select>

        <select onChange={handleCourseChange} value={selectedCourse}>
          <option value="">Select a Course</option>
          <option value="Course 1">Course 1</option>
          <option value="Course 2">Course 2</option>
          <option value="Course 3">Course 3</option>
        </select>
      </div>

      <div className="analytics-content">
        {selectedStudent && selectedCourse && (
          <AssignmentsList assignments={assignments} />
        )}
      </div>
    </div>
  );
};

export default StudentsAnalyticsPage;
