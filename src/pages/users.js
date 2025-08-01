import React, { useState, useEffect } from 'react'; 
import { useParams, Link, useLocation } from 'react-router-dom'; 
import { FaHome, FaUsers, FaEnvelope, FaBell, FaCog, FaChartLine } from 'react-icons/fa';
import AddStudentModal from '../components/AddStudentModal';
import '../styles/users.css';
import { Api } from '@mui/icons-material';

const API_BASE_URL = 'http://localhost:3000/api';

const Users = () => {
  const { classroomId } = useParams(); 
  const [isModalOpen, setModalOpen] = useState(false);
  const [students, setStudents] = useState([]); 
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [worksheets, setWorksheets] = useState([]);
  const [cumulative_grades, setCumulativeGrades] = useState({});

  const location = useLocation();

  const isAnalyticsPage = location.pathname.includes(`/users/${classroomId}`);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // Function to handle when a new student is added
  const handleStudentAdded = (newStudent) => {
    setStudents(prev => [...prev, newStudent]);
  };

  // Fetch students when the component mounts
  useEffect(() => {
      const fetchStudents = async () => {
        try {
          const data = await ApiService.fetchUsersInClassroom(classroomId);
          setStudents(data["students"]);
          // // Add fake last_logged_on data for each student entry
          // const studentsWithFakeData = Array.isArray(students) ? students.map(student => ({
          //   ...student,
          //   last_logged_on: new Date(Date.now() - Math.random() * 10000000000).toISOString() 
          // })) : [];
    
          // setLeaderboard(studentsWithFakeData);  // Set the updated data to leaderboard state
        } catch (error) {
          console.error('Error fetching students:', error);
        }
      };

    const fetchCourses = async () => {
      try {
        const response = await fetch(API_BASE_URL + `/classrooms/${classroomId}/courses`);
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        const fakeCourses = [
          { course_name: "Fun with Coding" },
          { course_name: "Adventures in Scratch" },
          { course_name: "Building Websites for Beginners" },
          { course_name: "Exploring Robots and AI" },
          { course_name: "Introduction to Computers" },
          { course_name: "Staying Safe Online" },
          { course_name: "Making Your First Mobile App" },
          { course_name: "Creating Simple Video Games" },
          { course_name: "Clouds and the Internet" },
          { course_name: "Money and Technology" }
        ];        
        setCourses(fakeCourses);
      }
    };

    const fetchGrades = async () => {
      try {
        // Fetch grades for the classroom
        const data_grades = await ApiService.fetchGrades(classroomId);
        setGrades(data_grades);

        const data_worksheets = await ApiService.fetchWorksheets(classroomId);
        setWorksheets(data_worksheets);
        let student_grades = {};
        for (const grade of data_grades) {
          if (grade.student_user_id && !(grade.student_user_id in student_grades)) {
            student_grades[grade.student_user_id] = [grade.grade];
          } else if (grade.student_user_id) {
            student_grades[grade.student_user_id].push(grade.grade);
          }
        }
        
      } catch (error) {
        console.error('Error fetching grades:', error);
      }
    };
      fetchStudents();
      fetchCourses();
      fetchGrades();
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
        <button className="add-student-btn" onClick={openModal}>
          Add Student
        </button>
        <AddStudentModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          classroomId={classroomId}
          students={students}
          onStudentAdded={handleStudentAdded}
        />
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
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>
                    <a href={`mailto:${student.email}`} className="email-link">
                      <FaEnvelope />
                    </a>
                  </td>
                  <td>{student.cummulative_score}</td>
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
