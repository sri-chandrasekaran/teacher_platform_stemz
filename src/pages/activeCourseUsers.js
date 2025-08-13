import React, { useState, useEffect } from 'react';
import '../styles/styles.css';

const API_BASE_URL = 'https://core-server-nine.vercel.app/api';

const ActiveCourseUsers = ({ course, classroomId }) => {
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add debug logging
  console.log("=== ActiveCourseUsers Debug ===");
  console.log("Course prop received:", course);
  console.log("Course type:", typeof course);
  console.log("Course keys:", course ? Object.keys(course) : 'null');
  console.log("Course stringified:", JSON.stringify(course, null, 2));
  console.log("ClassroomId prop received:", classroomId);

  useEffect(() => {
    console.log("useEffect triggered, course:", course, "classroomId:", classroomId);
    
    if ((course?.id || course?.name) && classroomId) {
      console.log("Course and classroom available, fetching activity");
      fetchRecentActivity();
    } else {
      console.log("Missing course or classroom ID, clearing activity");
      setRecentActivity([]);
    }
  }, [course, classroomId]);

  const fetchRecentActivity = async () => {
    console.log("=== fetchRecentActivity called ===");
    console.log("Course in fetch:", course);
    console.log("ClassroomId in fetch:", classroomId);
    
    if (!course?.id && !course?.name) {
      console.log("No course id or name, returning early");
      return;
    }

    if (!classroomId) {
      console.log("No classroomId, returning early");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const courseId = (course.id || course.name).toLowerCase();
      console.log("Using courseId:", courseId);
      console.log("Using classroomId:", classroomId);
      
      // Updated URL structure for classroom-specific analytics
      const url = `${API_BASE_URL}/analytics/classrooms/${classroomId}/courses/${courseId}/recent-activity?limit=5`;
      console.log("Making request to:", url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response body:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Response data:", data);
      
      if (data.success) {
        console.log("Setting recent activity:", data.recentActivity);
        setRecentActivity(data.recentActivity || []);
      } else {
        throw new Error(data.message || 'Failed to fetch recent activity');
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setError(error.message);
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  // Add manual refresh button for testing
  const handleManualRefresh = () => {
    console.log("Manual refresh clicked");
    fetchRecentActivity();
  };

  // Loading state
  if (loading) {
    return (
      <div className="active-users-container">
        <h2>Recent Activity - {course?.name || course?.title || 'Loading...'}</h2>
        <div className="loading-state">
          <p>Loading recent activity...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="active-users-container">
        <h2>Recent Activity - {course?.name || course?.title || 'Selected Course'}</h2>
        <div className="error-state">
          <p>Error loading activity: {error}</p>
          <button onClick={fetchRecentActivity} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No course selected
  if (!course) {
    return (
      <div className="active-users-container">
        <h2>Recent Activity</h2>
        <div className="no-course">
          <p>Please select a course to view recent activity</p>
          {/* <p>Debug: Course prop is null/undefined</p> */}
        </div>
      </div>
    );
  }

  // Show debug info in the component
  // const courseId = course.id || course.name;

  return (
    <div className="active-users-container">
      <h2>Recent Activity - {course?.name || course?.title || 'Selected Course'}</h2>
      

      {recentActivity.length === 0 ? (
        <div className="no-activity">
          <p>No recent activity for this course</p>
          <p>Students haven't completed any assignments yet</p>
        </div>
      ) : (
        <table className="active-users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Assignment</th>
              {/* <th>Time To Complete</th> */}
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.map((activity, index) => (
              <tr key={index}>
                <td>{activity.name}</td>
                <td>{activity.assignment}</td>
                {/* <td>{activity.timeSignedIn}</td> */}
                <td className={`grade ${activity.grade >= 80 ? 'good' : activity.grade >= 60 ? 'okay' : 'needs-improvement'}`}>
                  {activity.grade}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ActiveCourseUsers;