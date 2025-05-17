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
  const [studentResponse, setStudentResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [chartOptions, setChartOptions] = useState([]);

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Predicted Scores",
        data: [],
        fill: false,
        borderColor: "rgba(75,192,192,1)",
      },
    ],
  });

  useEffect(() => {
    fetchPredictedPerformance();
  }, []);


  const location = useLocation();

  const isAnalyticsPage = location.pathname.includes(`/dashboard/${classroomId}`);

  const openPopup = (assignment) => {
    setSelectedAssignment(assignment);  
  };
  
  const closePopup = () => {
    setSelectedAssignment(null);
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
    if (!responseText.trim()) {
      console.error("No response text provided");
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ responses: responseText }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Received NLP Metrics:", data);
  
      setNlpMetrics(data);
    } catch (error) {
      console.error("Error fetching NLP metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log(nlpMetrics)  

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

  const fetchPredictedPerformance = async () => {
    try {
      const originalScores = [82, 90]
      const response = await fetch("http://127.0.0.1:5000/predict-future-performance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scores: [82, 90] }),
      });
      const data = await response.json();
  
      if (!data || !Array.isArray(data.predicted_scores)) {
        console.error("Invalid response format:", data);
        return;
      }

      const fullData = [...originalScores, ...data.predicted_scores];
      const labels = [
        ...originalScores.map((_, i) => `Quiz ${i + 1}`),
        ...data.predicted_scores.map((_, i) => `Prediction ${i + 1}`),
      ];


      setChartData({
        labels: fullData.map((_, i) =>
          i < originalScores.length ? `Quiz ${i + 1}` : `Prediction ${i - originalScores.length + 1}`
        ),
        datasets: [
          {
            label: "Score",
            data: fullData,
            fill: false,
            tension: 0.3,
            segment: {
              borderColor: (ctx) => {
                const index = ctx.p0DataIndex;
                const nextIndex = ctx.p1DataIndex;
      
                // Color original scores in blue, predicted in red
                if (index < originalScores.length - 1 && nextIndex < originalScores.length) {
                  return "rgba(54, 162, 235, 1)"; // blue
                } else {
                  return "rgba(255, 99, 132, 1)"; // red
                }
              },
            },
            borderWidth: 2,
          },
        ],
      });

      setChartOptions({
        responsive: true,
  plugins: {
    legend: {
      labels: {
        generateLabels: (chart) => {
          return [
            {
              text: "Original Scores",
              strokeStyle: "rgba(54, 162, 235, 1)", // blue
              fillStyle: "rgba(54, 162, 235, 1)",
              lineWidth: 2,
              hidden: false,
              datasetIndex: 0,
            },
            {
              text: "Predicted Scores",
              strokeStyle: "rgba(255, 99, 132, 1)", // red
              fillStyle: "rgba(255, 99, 132, 1)",
              lineWidth: 2,
              hidden: false,
              datasetIndex: 0,
            },
          ];
        },
      },
    },
  },
  scales: {
    y: {
      min: 60,
      max: 100,
      title: {
        display: true,
        text: "Score",
      },
    },
  },
      });
    } catch (error) {
      console.error("Error fetching prediction:", error);
    }
  };
  

  useEffect(() => {
    if (selectedStudent && !selectedCourse) {
      fetchPredictedPerformance([85, 90]);
    }
  }, [selectedStudent, selectedCourse]);

  
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

  const handleCourseSelect = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
  
    if (selectedStudent) {
      const sampleResponse = "Studying this topic helps us think critically about space exploration.";
      fetchNlpMetrics(sampleResponse);
    }
  };
  

  const renderSkillCircle = (label, value) => {
    const percentage = (value / 20) * 100;
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


  const handleStudentSelect = async (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
  
    const sampleResponse = "Stars help us understand the nature of the universe and its origin.";
    setStudentResponse(sampleResponse);
    fetchNlpMetrics(sampleResponse);

    const futureData = await fetchPredictedPerformance(studentId);
    if (futureData) {
    setPerformanceData(futureData.historical);
    setPredictions(futureData.predicted);
  }
  };
  

  // top 5 scores
  const topStudents = [...leaderboard]
  .sort((a, b) => b.cummulative_score - a.cummulative_score)
  .slice(0, 5);


    // Fake grade data for the dot plot
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


      {(selectedStudent && !selectedCourse) && (
          <div className="student-specific-section">
            {/* Predictive Analysis Section */}
            <div className="predictive-analysis">
              <h2>Performance Prediction</h2>
              <Line data={chartData} options={chartOptions}/>
            </div>
            <h3>{selectedStudent ? `Metrics for Student: ${selectedStudent}` : "Select a Student"}</h3>

            {nlpMetrics && Object.keys(nlpMetrics).length > 0 ? (
              <div className="metrics-container">
                {renderSkillCircle("Creativity", nlpMetrics.creativity || 0)}
                {renderSkillCircle("Critical Thinking", nlpMetrics.critical_thinking || 0)}
                {renderSkillCircle("Observation", nlpMetrics.observation || 0)}
                {renderSkillCircle("Curiosity", nlpMetrics.curiosity || 0)}
                {renderSkillCircle("Problem Solving", nlpMetrics.problem_solving || 0)}
              </div>
            ) : (
              <p>Loading metrics...</p>
            )}
            <div className="nlp-simulator">
        <h3>Response Analysis</h3>
        <textarea
          value={studentResponse}
          onChange={(e) => setStudentResponse(e.target.value)}
          placeholder="Enter student's response for analysis..."
          rows={4}
          cols={50}
          aria-label="Student response input"
        />
        <button 
          onClick={() => fetchNlpMetrics(studentResponse)}
          disabled={isLoading || !studentResponse.trim()}
        >
          {isLoading ? 'Processing...' : 'Analyze Response'}
        </button>
      </div>
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

