import React from 'react';
import '../styles/styles.css';

const CourseGrades = ({ grade_data, course }) => {
  return (
    <div className="active-users-container">
      <h2>Course Grades</h2>
      <table className="active-users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Grade</th>
            <th>Completion</th>
          </tr>
        </thead>
        <tbody>
          {grade_data.map((user, index) => (
            <tr key={index}>
              <td>{user.name}</td>
              <td>{user.grade}</td>
              <td>N/A%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseGrades;