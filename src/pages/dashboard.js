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
import '../styles/styles.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

const API_BASE_URL = 'http://localhost:3000/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { classroomId, classroomName } = useParams();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [grades, setGrades] = useState([]);
  const [worksheets, setWorksheets] = useState([]);

  const location = useLocation();
  const isAnalyticsPage = location.pathname.includes(`/dashboard/${classroomId}/${classroomName}`);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/points`);
      const data = await response.json();
      setLeaderboard(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/active-users?minutes=30`);
      const data = await response.json();
      setActiveUsers(data);
    } catch (err) {
      console.error('Error fetching active users:', err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    fetchActiveUsers();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/classrooms/${classroomId}/users`);
        const data = await response.json();
        setStudents(data.students);
      } catch (err) {
        console.error('Error fetching students:', err);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/classrooms/${classroomId}/courses`);
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };

    fetchStudents();
    fetchCourses();
  }, [classroomId]);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const topStudents = leaderboard.slice(0, 5);

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
            <Link to={`/dashboard/${classroomName}/${classroomId}`}>
              <FaChartLine className={`sidebar-icon ${isAnalyticsPage ? 'active' : ''}`} />
            </Link>
          </li>
          <li>
            <Link to="/users">
              <FaUsers className={`sidebar-icon ${location.pathname === '/users' ? 'active' : ''}`} />
            </Link>
          </li>
          <li>
            <Link to="/messages">
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
              <FaCog className="sidebar-icon" />
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        <h1 className="dashboard-title">Classroom Analytics: {classroomName}</h1>

        {/* Leaderboard & Active Users */}
        <div className="tables-container">
          <div className="leaderboard">
            <h2>Leaderboard</h2>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length > 0 ? (
                  leaderboard.map((student, index) => (
                    <tr key={index}>
                      <td>{student.first_name} {student.last_name}</td>
                      <td>{student.points}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">No leaderboard data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="active-users">
            <h2>Active Users (last 30 min)</h2>
            <table className="active-users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {activeUsers.length > 0 ? (
                  activeUsers.map((user, index) => (
                    <tr key={index}>
                      <td>{user.first_name} {user.last_name}</td>
                      <td>{new Date(user.last_active).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">No active users</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Heatmap */}
        <div className="heatmap-container">
          <PlotlyHeatmap />
        </div>

        {/* Floating Button */}
        <button className="floating-button" onClick={openModal}>+</button>
        {isModalOpen && <PostModal onClose={closeModal} />}
      </div>
    </div>
  );
};

export default Dashboard;
