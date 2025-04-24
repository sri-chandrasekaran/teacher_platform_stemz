import React, { useState, useEffect } from 'react'; 
import { useParams, Link, useLocation } from 'react-router-dom'; 
import { FaHome, FaUsers, FaEnvelope, FaBell, FaCog, FaChartLine } from 'react-icons/fa';
import PostModal from './post';
import '../styles/users.css';

const Users = () => {
  const { id: classroomId } = useParams(); 
  const [isModalOpen, setModalOpen] = useState(false);
  const [students, setStudents] = useState([]); 

  const location = useLocation();

  const isAnalyticsPage = location.pathname.includes(`/dashboard/${classroomId}`);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // Fetch students when the component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/students'); 
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error); 
      }
    };
    
    fetchStudents();
  }, []); 

  return (
    <div className="dashboard">
      <div className="sidebar">
        <ul className="sidebar-links">
          <li>
            <Link to="/">
              <FaHome className="sidebar-icon" />
            </Link>
          </li>
          <li>
            <Link to={`/dashboard/${classroomId}`}>
              <FaChartLine className={`sidebar-icon ${isAnalyticsPage ? 'active' : ''}`} />
            </Link>
          </li>
          <li>
            <Link to="/users">
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

      <div className="users-list">
        {students.length > 0 ? (
          <table className="student-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Current Scores</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.student_id}>
                  <td>{student.student_id}</td>
                  <td>{student.student_name}</td>
                  <td>
                    <a href={`mailto:${student.student_email}`} className="email-link">
                      <FaEnvelope />
                    </a>
                  </td>
                  <td>{student.cumulative_scores}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Loading students...</p>
        )}
      </div>
    </div>
  );
};

export default Users;
