import React, { useState, useEffect, useCallback } from 'react';
import '../styles/styles.css';

const API_BASE_URL = 'https://core-server-nine.vercel.app/api';

const CourseStatistics = ({ course, classroomId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log("=== CourseStatistics Debug ===");
  console.log("Course prop:", course);

  const fetchCourseAnalytics = useCallback(async () => {
    if (!course?.id && !course?.name) return;
    if (!classroomId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const courseId = (course.id || course.name).toLowerCase();
      console.log("Fetching analytics for courseId:", courseId, "classroomId:", classroomId);
      
      // Updated URL structure for classroom-specific analytics
      const url = `${API_BASE_URL}/analytics/classrooms/${classroomId}/courses/${courseId}/analytics`;
      console.log("Analytics URL:", url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Analytics response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Analytics error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Analytics data received:", data);
      
      if (data.success) {
        setAnalytics(data);
      } else {
        throw new Error(data.message || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error.message);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [course, classroomId]);

  useEffect(() => {
    if ((course?.id || course?.name) && classroomId) {
      fetchCourseAnalytics();
    } else {
      setAnalytics(null);
    }
  }, [course, classroomId, fetchCourseAnalytics]);

  if (loading) {
    return (
      <div className="course-statistics-container">
        <h3>Course Statistics</h3>
        <div className="loading-state">
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-statistics-container">
        <h3>Course Statistics</h3>
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={fetchCourseAnalytics} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-statistics-container">
        <h3>Course Statistics</h3>
        <p>Please select a course to view statistics</p>
      </div>
    );
  }

  if (!analytics || !analytics.analytics) {
    return (
      <div className="course-statistics-container">
        <h3>Course Statistics - {course.name || course.title}</h3>
        <div className="no-data">
          <p>No analytics data available for this course</p>
          <button onClick={fetchCourseAnalytics} className="retry-button">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const { overall } = analytics.analytics;

  return (
    <div className="course-statistics-container">
      <h3>Course Statistics - {course.name || course.title}</h3>
      
      <div className="statistics-grid">
        {/* Completion Rates */}
        <div className="stat-section">
          <h4>Completion Rates</h4>
          <div className="stat-item">
            <span className="stat-label">Worksheets:</span>
            <span className="stat-value">{overall.overallWorksheetCompletionRate}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Quizzes:</span>
            <span className="stat-value">{overall.overallQuizCompletionRate}%</span>
          </div>
        </div>

        {/* Average Grades */}
        <div className="stat-section">
          <h4>Average Grades</h4>
          <div className="stat-item">
            <span className="stat-label">Worksheets:</span>
            <span className={`stat-value grade ${overall.averageWorksheetGrade >= 80 ? 'good' : overall.averageWorksheetGrade >= 60 ? 'okay' : 'needs-improvement'}`}>
              {overall.averageWorksheetGrade}%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Quizzes:</span>
            <span className={`stat-value grade ${overall.averageQuizGrade >= 80 ? 'good' : overall.averageQuizGrade >= 60 ? 'okay' : 'needs-improvement'}`}>
              {overall.averageQuizGrade}%
            </span>
          </div>
        </div>

        {/* Overall Course Info */}
        <div className="stat-section">
          <h4>Course Overview</h4>
          {/* <div className="stat-item">
            <span className="stat-label">Total Students:</span>
            <span className="stat-value">{analytics.totalStudents}</span>
          </div> */}
          <div className="stat-item">
            <span className="stat-label">Total Lessons Attempted:</span>
            <span className="stat-value">{overall.totalLessons}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Submissions:</span>
            <span className="stat-value">{overall.worksheetCompletions + overall.quizCompletions}</span>
          </div>
        </div>
      </div>

      {/* Debug info */}
      <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0', fontSize: '12px' }}>
        {/* <strong>Debug Info:</strong><br/>
        Course: {(course.id || course.name).toLowerCase()}<br/>
        Students: {analytics.totalStudents}<br/> */}
        <button onClick={fetchCourseAnalytics} style={{ marginTop: '5px' }}>
          Refresh Analytics
        </button>
      </div>
    </div>
  );
};

export default CourseStatistics;