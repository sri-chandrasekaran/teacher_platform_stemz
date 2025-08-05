// import React from 'react';
// import '../styles/styles.css';

// const ActiveUsers = () => {
//   const activeUsers = [
//     { name: 'Student 5', course: 'Basics of Coding', assignment: 'Lesson 1 Slideshow', timeSignedIn: '10 mins' },
//     { name: 'Student 9', course: 'Zoology', assignment: 'Lesson 3 Worksheet', timeSignedIn: '20 mins' },
//     { name: 'Student 16', course: 'Astronomy', assignment: 'Lesson 4 Quiz', timeSignedIn: '15 mins' },
//     { name: 'Student 2', course: 'Chemistry', assignment: 'Lesson 3 Slideshow', timeSignedIn: '5 mins' },
//   ];

//   return (
//     <div className="active-users-container">
//       <h2>Active Users</h2>
//       <table className="active-users-table">
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Course</th>
//             <th>Assignment</th>
//             <th>Time Signed In</th>
//           </tr>
//         </thead>
//         <tbody>
//           {activeUsers.map((user, index) => (
//             <tr key={index}>
//               <td>{user.name}</td>
//               <td>{user.course}</td>
//               <td>{user.assignment}</td>
//               <td>{user.timeSignedIn}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default ActiveUsers;

import React from 'react';
import { getCourseById } from '../utils/courseData';
import '../styles/styles.css';

const ActiveUsers = ({ assignments = [], students = [] }) => {
  // Generate recent activity from real assignments and students, or fallback to fake data
  const generateRecentActivity = () => {
    if (!Array.isArray(assignments) || !Array.isArray(students) || assignments.length === 0 || students.length === 0) {
      // Fallback fake data
      return [
        { name: 'Student 5', course: 'Basics of Coding', assignment: 'Lesson 1 Slideshow', timeSignedIn: '10 mins' },
        { name: 'Student 9', course: 'Zoology', assignment: 'Lesson 3 Worksheet', timeSignedIn: '20 mins' },
        { name: 'Student 16', course: 'Astronomy', assignment: 'Lesson 4 Quiz', timeSignedIn: '15 mins' },
        { name: 'Student 2', course: 'Chemistry', assignment: 'Lesson 3 Slideshow', timeSignedIn: '5 mins' },
      ];
    }
    
    // Generate activity from recent assignments
    return assignments.slice(0, 4).map((assignment, index) => {
      const randomStudent = students[Math.floor(Math.random() * students.length)];
      return {
        name: randomStudent?.name || `Student ${index + 1}`,
        course: assignment.course || 'Unknown Course',
        assignment: assignment.activityTitle || assignment.title,
        timeSignedIn: `${Math.floor(Math.random() * 30) + 5} mins`
      };
    });
  };

  const activeUsers = generateRecentActivity();

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
          {activeUsers.length > 0 ? (
            activeUsers.map((user, index) => {
              // Get course display name
              const courseData = getCourseById(user.course);
              const courseName = courseData?.name || user.course;
              
              return (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{courseName}</td>
                  <td>{user.assignment}</td>
                  <td>{user.timeSignedIn}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4">No recent activity</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ActiveUsers;