import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom'; 
import { FaHome, FaUsers, FaEnvelope, FaBell, FaCog, FaChartLine } from 'react-icons/fa';
import PostModal from './post';
import PlotlyHeatmap from './heatmap';
import Popup from './popup';
import ActiveUsers from './activeUsers';
import { Line } from 'react-chartjs-2';
import Plot from 'react-plotly.js';
import '../styles/styles.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

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
  const { id: classroomId } = useParams(); 
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]); 
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [nlpMetrics, setNlpMetrics] = useState({});

  const location = useLocation();

  const isAnalyticsPage = location.pathname.includes(`/dashboard/${classroomId}`);

  const openPopup = (assignment) => {
    setSelectedAssignment(assignment);  
  };
  
  const closePopup = () => {
    setSelectedAssignment(null);
  };
  
  const metricMap = {
    "Creativity": "creativity",
    "Critical Thinking": "critical_thinking",
    "Observation": "observation",
    "Curiosity": "curiosity",
    "Problem Solving": "problem_solving"
  };
  
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/students');
        const data = await response.json();
        setStudents(data);
        // Add fake last_logged_on data for each student entry
        const studentsWithFakeData = data.map(student => ({
          ...student,
          last_logged_on: new Date(Date.now() - Math.random() * 10000000000).toISOString() 
        }));
  
        setLeaderboard(studentsWithFakeData);  // Set the updated data to leaderboard state
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
  
    fetchStudents();
  }, []);

  const fetchNlpMetrics = async (responseText) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response: responseText }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Received NLP Metrics:", data); // Debugging
  
      setNlpMetrics(data);
    } catch (error) {
      console.error("Error fetching NLP metrics:", error);
    }
  };
  

  

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/course`);
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    
    fetchClasses();
  }, []);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const assignments = [
    { name: 'Lesson 1', progress: 85 },
    { name: 'Lesson 2', progress: 60 },
    { name: 'Lesson 3', progress: 95 },
    { name: 'Lesson 4', progress: 50 },
  ];

  const renderProgressBar = (progress) => {
    return (
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}>
          {/* {progress}% */}
        </div>
      </div>
    );
  };

  
  const handleCourseSelect = (courseId) => {
    setSelectedCourse(courseId);
  
    if (selectedStudent) {
      const sampleResponse = "Studying this topic helps us think critically about space exploration.";
      fetchNlpMetrics(sampleResponse);
    }
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

  const handleStudentSelect = (studentId) => {
    setSelectedStudent(studentId);
  
    // Example response to analyze (you can change this based on real student responses)
    const sampleResponse = "Stars help us understand the nature of the universe and its origin.";
  
    fetchNlpMetrics(sampleResponse);
  };
  

  // top 5 scores
  const topStudents = [...leaderboard]
  .sort((a, b) => b.cummulative_score - a.cummulative_score)
  .slice(0, 5);


    // Fake grade data for the dot plot
  const gradeData = [10, 12, 14, 15, 18, 11, 13, 16, 17, 19, 20, 16, 18, 14, 11, 13, 17, 12, 15];

  const dotPlotData = {
    x: gradeData, // This represents the grades
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
          date: currentDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
          points: Math.floor(Math.random() * 20) + 1 // Random points between 1 and 20
        });
        currentDate.setDate(currentDate.getDate() - 1); // Go backwards in time
      }
  
      return fakeData.reverse(); // Reverse to have data in increasing date order
    };
  
    const generateSimplePrediction = (performanceData) => {
      if (performanceData.length === 0) return [];
  
      const averagePoints = performanceData.reduce((acc, curr) => acc + curr.points, 0) / performanceData.length;
      let lastPoints = performanceData[performanceData.length - 1].points;
      const predictions = [];
  
      // Generate 5 future predictions
      for (let i = 0; i < 5; i++) {
        lastPoints += Math.round(averagePoints * 0.05); // Assume 5% improvement each time
        predictions.push({ date: `2025-01-${i + 1}`, points: Math.round(lastPoints) }); // Use fixed dates for simplicity
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


      {/* Main Content */}
      <div className="content">
        <h1 className="dashboard-title">Classroom {classroomId} Analytics</h1> 
        
        {/* Dropdowns */}
        <div className="dropdown-container">
          <select 
            className="dropdown"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">Select a Student</option>
            {students.map((student) => (
              <option key={student.student_id} value={student.student_id}>
                {student.student_name}
              </option>
            ))}
          </select>
          <select 
            className="dropdown"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Select a Course</option>
            {courses.map((course) => (
              <option key={course.course_name} value={course.course_name}>
                {course.course_name}
              </option>
            ))}
          </select>
        </div>

        {(!selectedStudent && !selectedCourse) && (
          <>
        <div className="tables-container">
          {/* Active Users Section */}
          <div className="active-users">
            <ActiveUsers />
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
                      <td>{entry.cumulative_scores}</td>
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
      {/* <h2>Predictive Analysis</h2> */}
      <Line data={chartData} />
    </div>

    <h3>{selectedStudent ? `Metrics for Student: ${selectedStudent}` : "Select a Student"}</h3>



{nlpMetrics && Object.keys(nlpMetrics).length > 0 ? (
  <div className="metrics-container">
    <div className="skill-circle-container">
    {renderSkillCircle("Creativity", nlpMetrics.creativity || nlpMetrics.Creativity)}
    {renderSkillCircle("Critical Thinking", nlpMetrics["Critical Thinking"] || nlpMetrics.CriticalThinking)}
    {renderSkillCircle("Observation", nlpMetrics.observation || nlpMetrics.Observation)}
    {renderSkillCircle("Curiosity", nlpMetrics.curiosity || nlpMetrics.Curiosity)}
    {renderSkillCircle("Problem Solving", nlpMetrics["Problem Solving"] || nlpMetrics.ProblemSolving)}
    </div>
    {/* <div className="nlp-metrics">
      <h3>Skill Metrics:</h3>
      <ul>
        {Object.entries(nlpMetrics).map(([metric, value]) => (
          <li key={metric}>{metric}: {value}</li>
        ))}
      </ul>
    </div> */}

    <div className="nlp-simulator">
      <textarea
        value={selectedStudent}
        onChange={(e) => setSelectedStudent(e.target.value)}
        placeholder="Enter student's response..."
        rows={4}
        cols={50}
      />
      <button onClick={() => fetchNlpMetrics(selectedStudent)}>Submit Response</button>
    </div>


  </div>
  
) : (
  <p>Loading metrics...</p>
)}
  </div>
)}


        {/* Average Grade Distribution Dot Plot */}
        {(!selectedStudent && selectedCourse) && (
        <div className="dot-plot-container">
          {/* <h2>Average Grade Distribution</h2> */}
          <Plot
            data={[dotPlotData]}
            layout={dotPlotLayout}
          />
        </div>
        )}

{/* Display assignments with progress bars */}
{(selectedCourse && selectedStudent) && (
  <div>
    <div className="assignments-container">
      {assignments.map((assignment, index) => (
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
        <Popup isOpen={!!selectedAssignment} onClose={closePopup} assignment={selectedAssignment} />
      </div>
    </div>
  );
};

export default Dashboard;
