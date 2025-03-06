import React from 'react';
import '../styles/styles.css';

const CourseGrades = () => {
    const activeUsers = [
        { name: "Alice Johnson", grade: 95, completion: 100 },
        { name: "Bob Smith", grade: 87, completion: 90 },
        { name: "Charlie Brown", grade: 78, completion: 85 },
        { name: "Diana Ross", grade: 82, completion: 95 },
        { name: "Ethan Hunt", grade: 91, completion: 100 },
        { name: "Fiona Carter", grade: 88, completion: 92 },
        { name: "George Miller", grade: 76, completion: 80 },
        { name: "Hannah Lee", grade: 92, completion: 100 },
        { name: "Ian Thompson", grade: 85, completion: 88 },
        { name: "Jessica Parker", grade: 89, completion: 93 },
        { name: "Kevin Martinez", grade: 73, completion: 70 },
        { name: "Lily Adams", grade: 97, completion: 100 },
        { name: "Michael Scott", grade: 81, completion: 78 },
        { name: "Natalie Brooks", grade: 90, completion: 96 },
        { name: "Oliver Davis", grade: 79, completion: 82 }
      ];
            
  

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
          {activeUsers.map((user, index) => (
            <tr key={index}>
              <td>{user.name}</td>
              <td>{user.grade}</td>
              <td>{user.completion}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseGrades;