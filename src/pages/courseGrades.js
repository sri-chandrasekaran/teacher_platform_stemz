import React from 'react';
import '../styles/styles.css';

const CourseGrades = ({ grade_data, course, students, worksheets }) => {
  if (!grade_data || !Array.isArray(grade_data)) {
    return <div>No grade data available</div>;
  }
  
  let student_grades = {}
  for (const grade of grade_data) {
    // console.log("Grade: " + grade.grade)
    // console.log("Student ID: " + grade.student_user_id)
    if (grade.student_user_id && !(grade.student_user_id in student_grades)) {
      student_grades[grade.student_user_id] = [grade.grade];
    }
    else if (grade.student_user_id) {
      student_grades[grade.student_user_id].push(grade.grade);
    }
  }

  let course_worksheets = []
  for (const worksheet of worksheets) {
    if (worksheet.course_id === course.id) {
      course_worksheets.push(worksheet);
    }
  }

  let grades_list = []
  // console.log("Student Grades: " + student_grades)
  for (const student_id in student_grades) {
    let grade = student_grades[student_id].reduce((a, b) => a + b, 0) / student_grades[student_id].length;
    let completion_percentage = (student_grades[student_id].length / course_worksheets.length) * 100;
    let student = students.find(student => student.id === student_id);
    grades_list.push({
      name: student ? student.name : "Unknown",
      grade: grade,
      completion: completion_percentage
    });
  }


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
          {grades_list.map((user, index) => (
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