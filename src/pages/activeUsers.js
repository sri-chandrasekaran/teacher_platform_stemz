import React from 'react';
import '../styles/styles.css';

const ActiveUsers = ({ students }) => {
  console.log('ActiveUsers component rendered with students:', students);
  const activeUsers = students.map(student => ({
    name: student.name,
    course: 'N/A',
    assignment: 'N/A',
    timeSignedIn: new Date(student.last_logged_on).toLocaleTimeString(),
  }));

  return (
    <div className="active-users-container">
      <h2>Active Users</h2>
      <table className="active-users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Course</th>
            <th>Assignment</th>
            <th>Time Signed In</th>
          </tr>
        </thead>
        <tbody>
          {activeUsers.map((user, index) => (
            <tr key={index}>
              <td>{user.name}</td>
              <td>{user.course}</td>
              <td>{user.assignment}</td>
              <td>{user.timeSignedIn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActiveUsers;
