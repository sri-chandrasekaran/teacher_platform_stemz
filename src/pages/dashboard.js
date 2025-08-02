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
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [chartOptions, setChartOptions] = useState([]);
  const [analyticsScores, setAnalyticsScores] = useState(null);
  const [data, setData] = useState(null);

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

useEffect(() => {
  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/portalCourses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('📚 Courses fetched:', data);
      
      // Transform the data to match what your dropdown expects
      const coursesForDropdown = data.map(course => ({
        course_id: course.courseName.toLowerCase(), // Use courseName as ID for your analytics API
        course_name: course.courseName.charAt(0).toUpperCase() + course.courseName.slice(1), // Capitalize first letter
        lessons: course.lessons
      }));
      
      setCourses(coursesForDropdown);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Fallback to mock data if API fails
      const mockCourses = [
        { course_id: "astronomy", course_name: "fallback", lessons: [] },
        { course_id: "chemistry", course_name: "fallback 2", lessons: [] },
        { course_id: "circuits", course_name: "fallback 3", lessons: [] },
        { course_id: "psychology", course_name: "fallback 4", lessons: [] },
        { course_id: "zoology", course_name: "fallback 5", lessons: [] }
      ];
      setCourses(mockCourses);
    }
  };

  fetchCourses();
}, []);
  // const mockCourses = [
  //   { course_name: "Astronomy" },
  //   { course_name: "Chemistry" },
  //   { course_name: "Circuits" },
  //   { course_name: "Psychology" },
  //   { course_name: "Zoology" }
  // ];
  
  // useEffect(() => {
  //   setCourses(mockCourses);
  // }, []);  


  const location = useLocation();

  const isAnalyticsPage = location.pathname.includes(`/dashboard/${classroomId}`);

  const openPopup = (assignment) => {
    setSelectedAssignment(assignment);  
  };
  
  const closePopup = () => {
    setSelectedAssignment(null);
  };


  // getting scores for a student for a specific course - not specific to a lesson
  const fetchStudentAnalyticsScores = async (studentId) => {
    try {
      const courseKey = selectedCourse.toLowerCase();
      // const lessonId = "lesson1";
      
      console.log(`🔍 Fetching analytics for course: ${courseKey}, student: ${studentId}`);

      const response = await fetch(`http://localhost:3000/api/teachers/analytics-scores/${courseKey}?studentId=${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('📊 Analytics Response:', data);
      
      if (data.success) {
        const studentAnalytics = data.data.find(student => 
          student.studentId === studentId
        );
        
        if (studentAnalytics) {
          setAnalyticsScores(studentAnalytics.averageScores);
          console.log('📊 Setting analytics scores:', studentAnalytics.averageScores);
        } else {
          console.log('No analytics found for student:', studentId);
          setAnalyticsScores(null);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching analytics scores:', error);
      setAnalyticsScores(null);
    }
  };

  // getting scores for a student throughout all of the courses
  const fetchStudentOverallScores = async (studentId) => {
    try {
      // Construct the URL for the endpoint
      const response = await fetch(`http://localhost:3000/api/teachers/student-overall-scores/${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      // Parse the response
      const data = await response.json();
      console.log('📊 Overall Scores Response:', data);
  
      if (data.success) {
        // The data will contain the overall average scores
        setAnalyticsScores(data.averageScores);
        console.log('📊 Setting overall scores:', data.averageScores);
      } else {
        console.log('No overall scores found for student:', studentId);
        setAnalyticsScores(null);
      }
    } catch (error) {
      console.error('❌ Error fetching overall scores:', error);
      setAnalyticsScores(null);
    }
  };

  useEffect(() => {
    const fetchStudentsInClassroom = async () => {
      try {
        console.log(`🔍 Fetching students for classroom: ${classroomId}`);
        const response = await fetch(`http://localhost:3000/api/physical-classrooms/${classroomId}/students`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
  
        const data = await response.json();
        console.log('👥 Students API Response:', data);
        console.log('👥 Data type:', typeof data);
        console.log('👥 Is array:', Array.isArray(data));
  
        if (response.ok && data) {
          const studentsArray = Array.isArray(data) ? data : (data.students || data.data || []);
          console.log('👥 Students array:', studentsArray);
          
          if (!Array.isArray(studentsArray)) {
            console.error('❌ Expected array but got:', typeof studentsArray);
            return;
          }
  
          const studentsForComponent = studentsArray.map(user => ({
            student_id: user._id || user.id || user.userId,
            student_name: user.name || user.username || `${user.firstName} ${user.lastName}`,
            cummulative_score: user.cummulative_score || 0,
            last_logged_on: user.last_logged_on || user.lastLogin || new Date().toISOString()
          }));
  
          setStudents(studentsForComponent);
          setLeaderboard(studentsForComponent);
          console.log('✅ Students loaded:', studentsForComponent.length);
        } else {
          console.error('❌ Failed to fetch students:', data);
        }
      } catch (error) {
        console.error('❌ Error fetching students:', error);
      }
    };
  
    if (classroomId) {
      fetchStudentsInClassroom();
    }
  }, [classroomId]);

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


      // setChartData({
      //   labels: fullData.map((_, i) =>
      //     i < originalScores.length ? `Quiz ${i + 1}` : `Prediction ${i - originalScores.length + 1}`
      //   ),
      //   datasets: [
      //     {
      //       label: "Score",
      //       data: fullData,
      //       fill: false,
      //       tension: 0.3,
      //       segment: {
      //         borderColor: (ctx) => {
      //           const index = ctx.p0DataIndex;
      //           const nextIndex = ctx.p1DataIndex;
      
      //           // Color original scores in blue, predicted in red
      //           if (index < originalScores.length - 1 && nextIndex < originalScores.length) {
      //             return "rgba(54, 162, 235, 1)"; // blue
      //           } else {
      //             return "rgba(255, 99, 132, 1)"; // red
      //           }
      //         },
      //       },
      //       borderWidth: 2,
      //     },
      //   ],
      // });

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
      // fetchNlpMetrics(sampleResponse);
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
    // fetchNlpMetrics(sampleResponse);

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

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedStudent) {
        setAnalyticsScores(null);
        setAnalyticsLoading(false);
        return;
      }

      setAnalyticsLoading(true);
  

    try {
      if (selectedCourse) {
        // When both student and course are selected, use the course-specific endpoint
        await fetchStudentAnalyticsScores(selectedStudent);
      } else {
        // When only student is selected, use the overall scores endpoint
        await fetchStudentOverallScores(selectedStudent);
      }
    } finally {
      // Set loading to false when done (whether success or error)
      setAnalyticsLoading(false);
    }
  };
  
    fetchData();
  }, [selectedStudent, selectedCourse]);
  

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
            onChange={handleStudentSelect}
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
              <option key={course.course_id} value={course.course_id}>
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
    <h2>Temporary NLP Analytics this should be overall across all courses</h2>
    <h3>{selectedStudent ? `Metrics for Student: ${selectedStudent}` : "Select a Student"}</h3>

    {analyticsScores ? (
      <div className="metrics-container">
        {renderSkillCircle("Creativity", analyticsScores.Creativity || 0)}
        {renderSkillCircle("Critical Thinking", analyticsScores["Critical Thinking"] || 0)}
        {renderSkillCircle("Observation", analyticsScores.Observation || 0)}
        {renderSkillCircle("Curiosity", analyticsScores.Curiosity || 0)}
        {renderSkillCircle("Problem Solving", analyticsScores["Problem Solving"] || 0)}
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
    <h2>NLP specific for the course</h2>
    <h3>{selectedStudent ? `Metrics for Student: ${selectedStudent}` : "Select a Student"}</h3>

    {analyticsScores ? (
      <div className="metrics-container">
        {renderSkillCircle("Creativity", analyticsScores.Creativity || 0)}
        {renderSkillCircle("Critical Thinking", analyticsScores["Critical Thinking"] || 0)}
        {renderSkillCircle("Observation", analyticsScores.Observation || 0)}
        {renderSkillCircle("Curiosity", analyticsScores.Curiosity || 0)}
        {renderSkillCircle("Problem Solving", analyticsScores["Problem Solving"] || 0)}
      </div>
    ) : (
      <p>Loading metrics...</p>
    )}
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

