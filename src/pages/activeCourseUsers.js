import React from 'react';
import '../styles/styles.css';

const ActiveCourseUsers = () => {
  const activeUsers = [
    {
      name: "Alice Johnson",
      assignment: "Math Homework 1",
      timeSignedIn: 45, // 45 minutes
      grade: 95,
    },
    {
      name: "Bob Smith",
      assignment: "Science Project",
      timeSignedIn: 30, // 30 minutes
      grade: 87,
    },
    {
      name: "Charlie Brown",
      assignment: "History Essay",
      timeSignedIn: 60, // 1 hour
      grade: 78,
    },
    {
      name: "Diana Ross",
      assignment: "Physics Lab",
      timeSignedIn: 90, // 1.5 hours
      grade: 82,
    },
    {
      name: "Ethan Hunt",
      assignment: "Chemistry Report",
      timeSignedIn: 25, // 25 minutes
      grade: 91,
    },
  ];
  

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