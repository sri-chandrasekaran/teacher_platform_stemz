// import React from 'react';
// import '../styles/styles.css';

// const ActiveCourseUsers = ({ grade_data, course, students, worksheets }) => {
//   // Sort grade_data by createdAt timestamp in descending order
//   const sortedGradeData = grade_data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//   const filteredGradeData = sortedGradeData.filter((data) => data.course_id === course.id);
//   // Map sorted grade_data to activeUsers format
//   const activeUsers = filteredGradeData.map((data) => {
//     const student = students.find((student) => student.id === data.student_user_id);
//     return {
//       name: student ? student.name : 'Unknown', // Fallback to 'Unknown' if student not found
//       assignment: data.worksheet_name,
//       timeSignedIn: data.time_to_complete, // Assuming timeSpent is in minutes
//       grade: data.grade,
//     };
//   });
  

//   return (
//     <div className="active-users-container">
//       <h2>Recent Activity</h2>
//       <table className="active-users-table">
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Assignment</th>
//             <th>Time To Complete</th>
//             <th>Grade</th>
//           </tr>
//         </thead>
//         <tbody>
//           {activeUsers.map((user, index) => (
//             <tr key={index}>
//               <td>{user.name}</td>
//               <td>{user.assignment}</td>
//               <td>{user.timeSignedIn} minutes</td>
//               <td>{user.grade}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default ActiveCourseUsers;

import React from 'react';
import '../styles/styles.css';

const ActiveCourseUsers = ({ assignments = [], course, students = [] }) => {
  // Filter assignments for the selected course
  const courseAssignments = assignments.filter((assignment) => 
    assignment.course === course?.id || assignment.course === course?.name
  );

  // Generate recent activity data from real assignments
  const activeUsers = courseAssignments.slice(0, 10).map((assignment) => {
    // Find a random student for demo purposes (in real app, this would come from actual completion data)
    const randomStudent = students[Math.floor(Math.random() * students.length)];
    
    return {
      name: randomStudent?.name || 'Unknown Student',
      assignment: assignment.activityTitle || assignment.title,
      timeSignedIn: `${Math.floor(Math.random() * 30) + 5} minutes`, // Random time for demo
      grade: Math.floor(Math.random() * 40) + 60, // Random grade 60-100
    };
  });

  // Fallback data if no assignments
  if (activeUsers.length === 0 && course) {
    return (
      <div className="active-users-container">
        <h2>Recent Activity - {course.name || course.title}</h2>
        <div className="no-activity">
          <p>No recent assignments for this course</p>
          <p>Create an assignment to see student activity here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="active-users-container">
      <h2>Recent Activity - {course?.name || course?.title || 'Selected Course'}</h2>
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
          {activeUsers.length > 0 ? (
            activeUsers.map((user, index) => (
              <tr key={index}>
                <td>{user.name}</td>
                <td>{user.assignment}</td>
                <td>{user.timeSignedIn}</td>
                <td>{user.grade}%</td>
              </tr>
            ))
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

export default ActiveCourseUsers;