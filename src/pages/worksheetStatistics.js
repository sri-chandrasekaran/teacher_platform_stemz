import React from 'react';
import '../styles/styles.css';

const WorksheetStatistics = ({ grade_data, course }) => {
  // Filter grade_data for the selected course
  const filteredGradeData = grade_data.filter((data) => data.course_id === course.id);

  // Group data by worksheet_name and calculate statistics
  const worksheetStats = {};
  for (const grade of filteredGradeData) {
    const worksheetName = grade.worksheet_name;

    if (!worksheetStats[worksheetName]) {
      worksheetStats[worksheetName] = {
        grades: [],
        times: [],
      };
    }

    worksheetStats[worksheetName].grades.push(grade.grade);
    worksheetStats[worksheetName].times.push(grade.time_to_complete);
  }

  // Calculate statistics for each worksheet
  const statistics = Object.entries(worksheetStats).map(([worksheetName, data]) => {
    const grades = data.grades;
    const times = data.times;

    return {
      worksheetName,
      averageGrade: (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2),
      highGrade: Math.max(...grades),
      lowGrade: Math.min(...grades),
      averageTime: (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2),
    };
  });

  return (
    <div className="active-users-container">
      <h2>Worksheet Statistics</h2>
      <table className="active-users-table">
        <thead>
          <tr>
            <th>Assignment</th>
            <th>Average Grade</th>
            <th>High Grade</th>
            <th>Low Grade</th>
            <th>Average Time to Complete</th>
          </tr>
        </thead>
        <tbody>
          {statistics.map((stat, index) => (
            <tr key={index}>
              <td>{stat.worksheetName}</td>
              <td>{stat.averageGrade}</td>
              <td>{stat.highGrade}</td>
              <td>{stat.lowGrade}</td>
              <td>{stat.averageTime} minutes</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorksheetStatistics;