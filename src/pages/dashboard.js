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
import ApiService from '../apiService';

const API_BASE_URL = 'https://core-server-nine.vercel.app/api';
// const API_BASE_URL = 'http://localhost:3000/api';


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
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [nlpMetrics, setNlpMetrics] = useState({});
  const [studentResponse, setStudentResponse] = useState('');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [chartOptions, setChartOptions] = useState([]);
  const [analyticsScores, setAnalyticsScores] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [performanceData, setPerformanceData] = useState([]);
  const [predictions, setPredictions] = useState([]);

  const location = useLocation();

  const isAnalyticsPage = location.pathname.includes(`/dashboard/${classroomId}`);

  const [grades, setGrades] = useState([]);
  const [worksheets, setWorksheets] = useState([])

  const QuizPredictionInline = ({ studentId, API_BASE_URL }) => {
    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    const fetchPredictions = async () => {
      if (!studentId) {
        setError('No student selected');
        return;
      }
  
      setLoading(true);
      setError(null);
      
      try {
        console.log(`🔄 Fetching predictions for student: ${studentId}`);
        console.log(`🔗 API URL: ${API_BASE_URL}/teachers/quiz-predictions/student/${studentId}`);
        
        const response = await fetch(`${API_BASE_URL}/teachers/quiz-predictions/student/${studentId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`📡 Response status: ${response.status}`);
        
        const data = await response.json();
        console.log('📊 Response data:', data);
        
        if (!response.ok) {
          throw new Error(data.message || `Server error: ${response.status}`);
        }
        
        // Check if response has success field
        if (data.success === false) {
          throw new Error(data.message || 'API returned unsuccessful response');
        }
        
        setPredictions(data);
        
      } catch (err) {
        console.error('❌ Prediction error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      if (studentId) {
        fetchPredictions();
      } else {
        setPredictions(null);
        setError(null);
      }
    }, [studentId, API_BASE_URL]);
  
    if (!studentId) {
      return (
        <div className="predictive-analysis">
          <h2>Performance Prediction</h2>
          <p>Please select a student to view predictions.</p>
        </div>
      );
    }
  
    if (loading) {
      return (
        <div className="predictive-analysis">
          <h2>Performance Prediction</h2>
          <div className="loading-placeholder">
            <p>Loading predictions...</p>
          </div>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="predictive-analysis">
          <h2>Performance Prediction</h2>
          <div className="error-message" style={{ 
            color: 'red', 
            padding: '20px', 
            backgroundColor: '#ffebee',
            borderRadius: '4px',
            border: '1px solid #e57373'
          }}>
            <p><strong>Error:</strong> {error}</p>
            <button 
              onClick={fetchPredictions} 
              style={{ 
                marginTop: '10px', 
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
  
    if (!predictions) {
      return (
        <div className="predictive-analysis">
          <h2>Performance Prediction</h2>
          <p>No prediction data available.</p>
        </div>
      );
    }
  
    // Validate predictions data structure
    if (!predictions.chartData || !Array.isArray(predictions.chartData)) {
      return (
        <div className="predictive-analysis">
          <h2>Performance Prediction</h2>
          <div className="error-message" style={{ color: 'orange', padding: '20px' }}>
            <p>Invalid prediction data format received.</p>
            <details>
              <summary>Debug Info</summary>
              <pre>{JSON.stringify(predictions, null, 2)}</pre>
            </details>
          </div>
        </div>
      );
    }
  
    // Convert predictions data to chart format
    const chartData = {
      labels: predictions.chartData.map(item => item.quiz),
      datasets: [
        {
          label: 'Quiz Scores',
          data: predictions.chartData.map(item => item.score),
          fill: false,
          tension: 0.3,
          segment: {
            borderColor: (ctx) => {
              const dataPoint = predictions.chartData[ctx.p0DataIndex];
              return dataPoint?.type === 'Predicted' 
                ? 'rgba(255, 99, 132, 1)' 
                : 'rgba(54, 162, 235, 1)';
            },
          },
          borderWidth: 2,
          pointBackgroundColor: (ctx) => {
            const dataPoint = predictions.chartData[ctx.dataIndex];
            return dataPoint?.type === 'Predicted' ? '#ff6384' : '#36a2eb';
          }
        },
      ],
    };
  
    const chartOptions = {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `Quiz Predictions for ${predictions.studentName || 'Student'}`,
        },
        legend: {
          display: true,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Score (%)'
          }
        }
      }
    };
  
    const predictedAverage = predictions.predictions?.average_future_score;
  
    return (
      <div className="predictive-analysis">
        <h2>Performance Prediction</h2>
        
        {/* Warning for at-risk students */}
        {predictions.predictions?.warning && (
          <div style={{ 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffeaa7', 
            color: '#856404', 
            padding: '10px', 
            marginBottom: '15px',
            borderRadius: '4px'
          }}>
            ⚠️ Student may need additional support (predicted average: {predictedAverage?.toFixed(1)}%)
          </div>
        )}
        
        {/* Chart */}
        <Line data={chartData} options={chartOptions} />
        
        {/* Summary stats */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
          <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
            <strong>Predicted Average</strong>
            <div style={{ fontSize: '1.5em', color: '#1976d2' }}>
              {predictedAverage ? predictedAverage.toFixed(1) : 'N/A'}%
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f3e5f5', borderRadius: '4px' }}>
            <strong>Completed Quizzes</strong>
            <div style={{ fontSize: '1.5em', color: '#7b1fa2' }}>
              {predictions.completedQuizzes || 0}
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
            <strong>Remaining Quizzes</strong>
            <div style={{ fontSize: '1.5em', color: '#388e3c' }}>
              {predictions.predictions?.predicted_scores?.length || 0}
            </div>
          </div>
        </div>
        <h5>Note: These percentages are based on points received.</h5>
      </div>
    );
  };

  // getting scores for a student for a specific course - not specific to a lesson
  const fetchStudentAnalyticsScores = async (studentId) => {
    try {
      const courseKey = selectedCourse.toLowerCase();
      // const lessonId = "lesson1";
      
      console.log(`🔍 Fetching analytics for course: ${courseKey}, student: ${studentId}`);

      const response = await fetch(`${API_BASE_URL}/teachers/analytics-scores/${courseKey}?studentId=${studentId}`, {
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
      const response = await fetch(`${API_BASE_URL}/teachers/student-overall-scores/${studentId}`, {
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
    fetchPredictedPerformance();
  }, []);

useEffect(() => {
  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
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

  const openPopup = (assignment) => {
    setSelectedAssignment(assignment);  
  };
  
  const closePopup = () => {
    setSelectedAssignment(null);
  };
useEffect(() => {
  const fetchStudents = async () => {
    if (!classroomId) return;
    
    try {
      console.log(`🔍 Fetching students for classroom: ${classroomId}`);
      
      // Use your ApiService method which works correctly
      const data = await ApiService.fetchStudentsInClassroom(classroomId);
      console.log('👥 Students API Response:', data);
      
      // Extract students array from the response
      const studentsArray = Array.isArray(data) ? data : (data.students || data.data || []);
      console.log('👥 Students array:', studentsArray);
      
      if (Array.isArray(studentsArray)) {
        // Transform the data for your component
        const studentsWithFakeData = studentsArray.map(student => ({
          id: student._id || student.id,
          name: student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim(),
          email: student.email,
          cummulative_score: student.cummulative_score || 0,
          last_logged_on: student.last_logged_on || new Date(Date.now() - Math.random() * 10000000000).toISOString()
        }));
        
        setStudents(studentsWithFakeData);
        setLeaderboard(studentsWithFakeData);
        console.log('✅ Students loaded:', studentsWithFakeData.length);
        console.log('✅ Students data:', studentsWithFakeData);
      } else {
        console.error('❌ Expected array but got:', typeof studentsArray);
        setStudents([]);
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      setStudents([]);
      setLeaderboard([]);
    }
  };

  fetchStudents();
}, [classroomId]);

    const fetchGrades = async () => {
      try {
        const data_grades = await ApiService.fetchGrades(classroomId);
        setGrades(data_grades);
        
        const data_worksheets = await ApiService.fetchWorksheets(classroomId);
        setWorksheets(data_worksheets);
      } catch (error) {
        console.error('Error fetching grades:', error);
      }
    };

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
    } catch (error) {
      console.error("Error fetching predicted performance:", error);
    }
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

      const classroomResponse = await ApiService.fetchClassroomById(classroomId);
      
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

  const handleCourseSelect = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
  
    if (selectedStudent) {
      const sampleResponse = "Studying this topic helps us think critically about space exploration.";
      // fetchNlpMetrics(sampleResponse);
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

  const handleStudentSelect = async (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);

    const futureData = await fetchPredictedPerformance(studentId);
    if (futureData) {
    setPerformanceData(futureData.historical);
    setPredictions(futureData.predicted);
  }
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

  useEffect(() => {
    const fetchData = async () => {
      // No student = no fetch
      if (!selectedStudent) {
        setAnalyticsScores(null);
        return;
      }
  
      setAnalyticsLoading(true);
  
      try {
        if (selectedCourse && selectedCourse.trim() !== "") {
          console.log("📌 Fetching course-specific analytics");
          await fetchStudentAnalyticsScores(selectedStudent);
        } else {
          console.log("📌 Fetching OVERALL analytics across all courses");
          await fetchStudentOverallScores(selectedStudent);
        }
      } finally {
        setAnalyticsLoading(false);
      }
    };
  
    fetchData();
  }, [selectedStudent, selectedCourse]);
  

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
  
      // Generate 5 future predictions
      for (let i = 0; i < 5; i++) {
        lastPoints += Math.round(averagePoints * 0.05); // Assume 5% improvement each time
        predictions.push({ date: `2025-01-${i + 1}`, points: Math.round(lastPoints) }); // Use fixed dates for simplicity
      }
  
      return predictions;
    };
  
    // Prepare chart data
    const currentPerformanceData = generateFakeData();
    const currentPredictions = generateSimplePrediction(currentPerformanceData);


    /*
      So, for the future, there should be actual data populated that I will query from in
      order to make the analytics, this is just dummy data I can use for now
    */
      const generateStudentData = function(weeks = 4) {
        // Array to hold all data points
        const timeSeriesData = [];
        
        // Generate data across multiple weeks
        for (let week = 1; week <= weeks; week++) {
          // Create a date object for this week
          const date = new Date();
          date.setDate(date.getDate() - ((weeks - week) * 7)); // Go back by weeks
          const dateString = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
          
          // For each student
          for (let student = 1; student <= 5; student++) {
            // For each assignment
            for (let assignment = 1; assignment <= 4; assignment++) {
              const randomScore = Math.floor(Math.random() * 100) + 1;
              
              // Add a data point with all relevant dimensions
              timeSeriesData.push({
                studentId: `Student ${student}`,
                assignmentId: assignment,
                week: week,
                date: dateString,
                score: randomScore
              });
            }
          }
        }
        
        return timeSeriesData;
      };
       

    //now create different analytics over weekly data analyze trends over time
    //filter out the dates per week
    // First, generate our sample data
const studentData = generateStudentData(4); // 4 weeks of data

// 1. Group by time periods (weeks)
const groupByWeek = () => {
  const weeklyData = {};
  
  studentData.forEach(item => {
    if (!weeklyData[item.week]) {
      weeklyData[item.week] = [];
    }
    weeklyData[item.week].push(item);
  });
  
  return weeklyData;
};

// 2. Calculate aggregates
const calculateAggregates = () => {
  const weeklyAggregates = {};
  const groupedData = groupByWeek();
  
  // For each week
  Object.keys(groupedData).forEach(week => {
    const weekData = groupedData[week];
    const scores = weekData.map(item => item.score);
    
    weeklyAggregates[week] = {
      average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      min: Math.min(...scores),
      max: Math.max(...scores),
      count: scores.length,
      date: weekData[0].date // Use date from first item in the week
    };
  });
  
  return weeklyAggregates;
};

// Compare values across time (week-over-week changes)
const calculateTrends = () => {
  const aggregates = calculateAggregates();
  const trends = {};
  
 
  for (let week = 2; week <= Object.keys(aggregates).length; week++) {
    const currentWeek = aggregates[week];
    const previousWeek = aggregates[week - 1];
    
    trends[week] = {
      averageChange: currentWeek.average - previousWeek.average,
      percentChange: ((currentWeek.average - previousWeek.average) / previousWeek.average) * 100,
      improvementCount: studentData.filter(item => 
        item.week === week && 
        studentData.some(prevItem => 
          prevItem.week === (week - 1) && 
          prevItem.studentId === item.studentId && 
          prevItem.assignmentId === item.assignmentId && 
          item.score > prevItem.score
        )
      ).length
    };
  }
  
  return trends;
};

// Studnet specific trends
const getStudentTrend = (studentId) => {
  const studentScores = studentData
    .filter(item => item.studentId === studentId)
    .sort((a, b) => a.week - b.week);
  
  const weeklyAverages = {};
  
  studentScores.forEach(item => {
    if (!weeklyAverages[item.week]) {
      weeklyAverages[item.week] = {
        scores: [],
        date: item.date
      };
    }
    weeklyAverages[item.week].scores.push(item.score);
  });
  
  // Calculate averages for scores for each week
  Object.keys(weeklyAverages).forEach(week => {
    const scores = weeklyAverages[week].scores;
    weeklyAverages[week].average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  });
  
  return weeklyAverages;
};

// Example usage:
console.log("Weekly grouped data:", groupByWeek());
console.log("Weekly aggregates:", calculateAggregates());
console.log("Week-over-week trends:", calculateTrends());
    

  
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
            <ActiveUsers students={students} />
          </div>

          {/* Leaderboard Section */}
          <div className="leaderboard">
            <h2>Top 5 Leaderboard</h2>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Last Logged On</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.length > 0 ? (
                  topStudents.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.name}</td>
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
        </>
        )}


      {(selectedStudent && !selectedCourse) && (
        <div className="student-specific-section">
            {/* <Line data={chartData} options={chartOptions}/> */}
            <div className="predictive-analysis">
            <QuizPredictionInline 
              studentId={selectedStudent}
              API_BASE_URL={API_BASE_URL}
            />
    </div>
          <h2>NLP Analysis Across Courses</h2>
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
                  {/* <Plot data={[dotPlotData]} layout={dotPlotLayout} /> */}
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
            <Popup 
              isOpen={true} 
              onClose={() => {}} 
              student={selectedStudent} 
              course={selectedCourse} 
            />

            <br></br>
            <div className="skill-development">
                <h2>Average NLP Scores for {selectedCourse}</h2>
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
        {/* <Popup isOpen={!!selectedAssignment} onClose={closePopup} student={selectedStudent} course={selectedCourse} /> */}
      </div>
    </div>
  );
};
export default Dashboard;