import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom'; 
import { FaHome, FaUsers, FaEnvelope, FaBell, FaCog, FaChartLine } from 'react-icons/fa';
import PostModal from './post';
import PlotlyHeatmap from './heatmap';
import Popup from './popup';
import ActiveUsers from './activeUsers';
import ActiveCourseUsers from './activeCourseUsers';
import CourseGrades from './courseGrades';
import GradeCurve from './gradeCurve';
import WorksheetStatistics from './worksheetStatistics';
import { Line } from 'react-chartjs-2';
import Plot from 'react-plotly.js';
import { call_api } from '../components/api';
import { courseList, getCourseById } from '../utils/courseData';
import { normalizeClassroom, normalizeAssignment, generateFakeLeaderboard, handleApiError } from '../utils/dataHelpers';
import '../styles/styles.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

const API_BASE_URL = 'https://core-server-nine.vercel.app/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { classroomId, classroomName } = useParams();
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [classroom, setClassroom] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]); 
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const location = useLocation();

  const isAnalyticsPage = location.pathname.includes(`/dashboard/${classroomId}`);

  const openPopup = (assignment) => {
    setSelectedAssignment(assignment);  
  };
  
  const closePopup = () => {
    setSelectedAssignment(null);
  };
  
  // FIXED: Fetch real data from APIs
  useEffect(() => {
    if (classroomId) {
      fetchClassroomData();
    }
  }, [classroomId]);

  const fetchClassroomData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data for classroom:', classroomId);

      // Fetch classroom details
      const classroomResponse = await call_api(
        null,
        `physical-classrooms/${classroomId}`,
        'GET'
      );
      
      console.log('Classroom response:', classroomResponse);
      const normalizedClassroom = normalizeClassroom(classroomResponse);
      setClassroom(normalizedClassroom);
      setStudents(normalizedClassroom.students || []);

      // Generate fake leaderboard from students (until real user points are integrated)
      const fakeLeaderboard = generateFakeLeaderboard(normalizedClassroom.students || []);
      setLeaderboard(fakeLeaderboard);

      // Fetch assignments for this classroom
      try {
        const assignmentsResponse = await call_api(
          null,
          `assignments/classroom/${classroomId}`,
          'GET'
        );
        
        console.log('Assignments response:', assignmentsResponse);
        const normalizedAssignments = Array.isArray(assignmentsResponse) 
          ? assignmentsResponse.map(assignment => normalizeAssignment(assignment))
          : [];
        setAssignments(normalizedAssignments);
      } catch (assignmentError) {
        console.error('Error fetching assignments:', assignmentError);
        setAssignments([]);
      }

    } catch (error) {
      console.error('Error fetching classroom data:', error);
      setError(handleApiError(error, 'Failed to load classroom data'));
    } finally {
      setLoading(false);
    }
  };

  // Track selected student changes
  useEffect(() => {
    if (selectedStudent) {
      console.log("Selected student changed to:", selectedStudent);
      // You can add any logic here that needs to run when selectedStudent changes
    }
  }, [selectedStudent]);

  // Track selected course changes
  useEffect(() => {
    if (selectedCourse) {
      console.log("Selected course changed to:", selectedCourse);
      // You can add any logic here that needs to run when selectedStudent changes
    }
  }, [selectedStudent]);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // Generate assignment progress for display
  const generateAssignmentProgress = () => {
    return [
      { name: 'Lesson 1', progress: 85 },
      { name: 'Lesson 2', progress: 60 },
      { name: 'Lesson 3', progress: 95 },
      { name: 'Lesson 4', progress: 50 },
    ];
  };

  const assignmentProgress = generateAssignmentProgress();

  const renderProgressBar = (progress) => {
    return (
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}>
          {/* {progress}% */}
        </div>
      </div>
    );
  };

  const skillMetrics = {
    Creativity: 18,
    Curiosity: 15,
    CriticalThinking: 17,
    Observation: 14,
    ProblemSolving: 16,
  };

  const renderSkillCircle = (label, value) => {
    const percentage = (value / 20) * 100; // Assuming max score is 20
    return (
      <div className="skill-circle">
        <div
          className="outer-circle"
          style={{
            background: `conic-gradient(#4CAF50 ${percentage}%, #f0f0f0 ${percentage}%)`,
          }}
        >
          <div className="inner-circle">{value}/20</div>
        </div>
        <p>{label}</p>
      </div>
    );
  };

  // top 5 scores
  const topStudents = leaderboard
    .sort((a, b) => b.cummulative_score - a.cummulative_score) 
    .slice(0, 5);

  // Fake grade data for the dot plot (TODO: replace with real data)
  const gradeData = [10, 12, 14, 15, 18, 11, 13, 16, 17, 19, 20, 16, 18, 14, 11, 13, 17, 12, 15];

  const dotPlotData = {
    x: gradeData,
    type: 'scatter',
    mode: 'markers',
    marker: {
      color: 'rgba(75, 192, 192, 1)',
      size: 12,
    },
  };

  const dotPlotLayout = {
    title: 'Average Grade Distribution',
    xaxis: { title: 'Grades' },
    yaxis: { title: 'Frequency' },
    showlegend: false,
  };

  // Generate fake historical data for predictive analysis
  const generateFakeData = () => {
    const fakeData = [];
    let currentDate = new Date();

    for (let i = 0; i < 10; i++) {
      fakeData.push({
        date: currentDate.toISOString().split('T')[0],
        points: Math.floor(Math.random() * 20) + 1
      });
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return fakeData.reverse();
  };

  const generateSimplePrediction = (performanceData) => {
    if (performanceData.length === 0) return [];

    const averagePoints = performanceData.reduce((acc, curr) => acc + curr.points, 0) / performanceData.length;
    let lastPoints = performanceData[performanceData.length - 1].points;
    const predictions = [];

    for (let i = 0; i < 5; i++) {
      lastPoints += Math.round(averagePoints * 0.05);
      predictions.push({ date: `2025-01-${i + 1}`, points: Math.round(lastPoints) });
    }

    return predictions;
  };

  // Prepare chart data
  const performanceData = generateFakeData();
  const predictions = generateSimplePrediction(performanceData);

  const chartData = {
    labels: [
      ...performanceData.map(entry => entry.date),
      ...predictions.map(entry => entry.date)
    ],
    datasets: [
      {
        label: 'Historical Performance',
        data: performanceData.map(entry => entry.points),
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
      },
      {
        label: 'Predicted Performance',
        data: predictions.map(entry => entry.points),
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: false,
        borderDash: [5, 5],
      }
    ]
  };

  // Show loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading classroom data...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Classroom</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <ul className="sidebar-links">
          <li>
            <Link to="/">
              <FaHome className="sidebar-icon" />
            </Link>
          </li>
          <li>
            <Link to={`/dashboard/${classroomId}/${encodeURIComponent(classroomName || '')}`}>
              <FaChartLine className={`sidebar-icon ${isAnalyticsPage ? 'active' : ''}`} />
            </Link>
          </li>
          <li>
            <Link to={`/users/${classroomId}`}>
              <FaUsers className={`sidebar-icon ${location.pathname === '/users' ? 'active' : ''}`} />
            </Link>
          </li>
          <li>
            <Link to={`/messages`}>
              <FaEnvelope className={`sidebar-icon ${location.pathname === '/messages' ? 'active' : ''}`} />
            </Link>
          </li>
          <li>
            <Link to="/notifications">
              <FaBell className={`sidebar-icon ${location.pathname === '/notifications' ? 'active' : ''}`} />
            </Link>
          </li>
          <li>
            <Link to="/settings">
              <FaCog className={`sidebar-icon ${location.pathname === '/settings' ? 'active' : ''}`} />
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        <h1 className="dashboard-title">
          Classroom Analytics: {classroomName || classroom?.name || 'Unknown Classroom'}
        </h1> 
        
        {/* Dropdowns */}
        <div className="dropdown-container">
          <select 
            className="dropdown"
            value={selectedStudent}
            onChange={(e) => {
              const newValue = e.target.value;
              console.log("selected student", newValue);
              setSelectedStudent(newValue); 
              
            }}
          >
            <option value="">Select a Student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
          <select 
            className="dropdown"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Select a Course</option>
            {courseList.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        {(!selectedStudent && !selectedCourse) && (
          <>
            <div className="tables-container">
              {/* Active Users Section */}
              <div className="active-users">
                <ActiveUsers assignments={assignments} students={students} />
              </div>

              {/* Leaderboard Section */}
              <div className="leaderboard">
                <h2>Top 5 Leaderboard</h2>
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th>Last Logged On</th>
                      <th>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStudents.length > 0 ? (
                      topStudents.map((entry) => (
                        <tr key={entry.student_id}>
                          <td>{entry.student_id}</td>
                          <td>{entry.student_name}</td>
                          <td>{new Date(entry.last_logged_on).toLocaleDateString()}</td>
                          <td>{entry.cummulative_score}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4">No leaderboard data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Engagement Heatmap */}
            <div className="heatmap-container">
              <PlotlyHeatmap />
            </div>
          </>
        )}

        {/* Predictive Analysis and Skill Development Section */}
        {(selectedStudent && !selectedCourse) && (
          <div className="student-specific-section">
            {/* Predictive Analysis Section */}
            <div className="predictive-analysis">
              <Line data={chartData} />
            </div>

            {/* Skill Development Analysis Section */}
            <div className="skill-development">
              <h2>Skill Development Analysis</h2>
              <div className="skill-circles">
                {Object.entries(skillMetrics).map(([label, value]) => 
                  renderSkillCircle(label, value)
                )}
              </div>
            </div>
          </div>
        )}

        {/* Course-specific data */}
        {!selectedStudent && selectedCourse && (
          <div className="tables-wrapper">
            <div className="tables-container">
              {/* Recent activity in a course */}
              <div className="active-course-users">
                <ActiveCourseUsers
                  assignments={assignments.filter(a => a.course === selectedCourse)}
                  course={getCourseById(selectedCourse)}
                  students={students}
                />
              </div>

              {/* Grade Curve and Worksheet Statistics */}
              <div className="grade-and-statistics">
                {/* Histogram/Gaussian plot */}
                <div className="dot-plot-container">
                  <Plot data={[dotPlotData]} layout={dotPlotLayout} />
                </div>

                {/* Worksheet statistics placeholder */}
                <div className="worksheet-statistics-container">
                  <h3>Assignment Statistics</h3>
                  <p>Assignments for {getCourseById(selectedCourse)?.name}: {assignments.filter(a => a.course === selectedCourse).length}</p>
                </div>
              </div>
            </div>

            {/* Grades table containing all grades for a course */}
            
            {/* Course assignments table */}
            <div className="extra-table-container">
              <CourseGrades
                assignments={assignments.filter(a => a.course === selectedCourse)}
                course={getCourseById(selectedCourse)}
                students={students}
              />
            </div>
          </div>
        )}

        {/* Display assignments with progress bars */}
        {(selectedCourse && selectedStudent) && (
          <div>
            <div className="assignments-container">
              {assignmentProgress.map((assignment, index) => (
                <div key={index} className="assignment-box" onClick={() => openPopup(assignment)}> 
                  <div className="assignment-header">
                    <h3>{assignment.name}</h3>
                  </div>
                  {renderProgressBar(assignment.progress)}
                </div>
              ))}
            </div>
            
            <div className="skill-development">
              {/* <h2>Skill Development Analysis</h2> */}
              {/* <div className="skill-circles">
                {Object.entries(skillMetrics).map(([label, value]) => 
                  renderSkillCircle(label, value)
                )}
              </div> */}
            </div>
          </div>
        )}

        <button
          className="floating-button"
          onClick={openModal}
        >
          +
        </button>
        {isModalOpen && <PostModal onClose={closeModal} />}
        <Popup isOpen={!!selectedAssignment} onClose={closePopup} student={selectedStudent} course={selectedCourse} />
      </div>
    </div>
  );
};

export default Dashboard;