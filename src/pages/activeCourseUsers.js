import React from 'react';
import '../styles/styles.css';

const ActiveCourseUsers = ({ grade_data, course, students, worksheets }) => {
  // Sort grade_data by createdAt timestamp in descending order
  const sortedGradeData = grade_data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const filteredGradeData = sortedGradeData.filter((data) => data.course_id === course.id);
  // Map sorted grade_data to activeUsers format
  const activeUsers = filteredGradeData.map((data) => {
    const student = students.find((student) => student.id === data.student_user_id);
    return {
      name: student ? student.name : 'Unknown', // Fallback to 'Unknown' if student not found
      assignment: data.worksheet_name,
      timeSignedIn: data.time_to_complete, // Assuming timeSpent is in minutes
      grade: data.grade,
    };
  });
  

  return (
    <div className="active-users-container">
      <h2>Recent Activity</h2>
      <table className="active-users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Assignment</th>
            <th>Time To Complete</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {activeUsers.map((user, index) => (
            <tr key={index}>
              <td>{user.name}</td>
              <td>{user.assignment}</td>
              <td>{user.timeSignedIn} minutes</td>
              <td>{user.grade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActiveCourseUsers;