import React, { useState, useEffect } from 'react';
import { FaHome, FaUsers, FaEnvelope, FaBell, FaCog, FaChartLine, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { call_api } from '../components/api'; 
import { normalizeClassroom, handleApiError } from '../utils/dataHelpers';
import ApiService from '../apiService';

const TeacherNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, quiz_failures, announcements
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('all');

  useEffect(() => {
    fetchClassrooms();
    fetchNotifications();
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [selectedClassroom, filter]);

  // FIXED: Fetch real physical classrooms
  const fetchClassrooms = async () => {
    try {
      // const response = await call_api(null, 'physical-classrooms/my-classrooms', 'GET');
      const user = JSON.parse(localStorage.getItem('login_response') || '{}').user || {};
      const userId = user._id;
      
      if (!userId) {
        console.error('No user ID found for fetching classrooms');
        return;
      }
      
      console.log('Fetching classrooms for user:', userId);

      const response = await ApiService.fetchMyClassrooms(userId);
    
      if (response?.teaching) {
        const normalizedClassrooms = response.teaching.map(classroom => normalizeClassroom(classroom));
        setClassrooms(normalizedClassrooms);
      }
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    }
  };

  // FIXED: Fetch real quiz failure notifications and announcements
  // const fetchNotifications = async () => {
  //   try {
  //     setLoading(true);
      
  //     let endpoint = 'notifications/teacher-notifications';
  //     if (filter === 'all') {
  //       endpoint = 'notifications/all-teacher-notifications';
  //     }

  //     const params = {};
      
  //     if (selectedClassroom !== 'all') {
  //       params.classroomId = selectedClassroom;
  //     }
      
  //     if (filter !== 'all') {
  //       params.type = filter;
  //     }

  //     // Build query string
  //     const queryString = Object.keys(params).length > 0 
  //       ? '?' + Object.keys(params).map(key => `${key}=${params[key]}`).join('&')
  //       : '';

  //     const response = await call_api(null, endpoint + queryString, 'GET');
      
  //     console.log('Fetched notifications:', response);
      
  //     if (Array.isArray(response)) {
  //       setNotifications(response);
  //     } else {
  //       setNotifications([]);
  //     }
      
  //   } catch (error) {
  //     console.error('Error fetching notifications:', error);
  //     // Set empty array on error
  //     setNotifications([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // REPLACE this function in TeacherNotifications.js

const fetchNotifications = async () => {
  try {
    setLoading(true);
    
    // Get user ID from localStorage
    const loginResponse = localStorage.getItem('login_response');
    if (!loginResponse) {
      console.error('No login response found');
      setNotifications([]);
      return;
    }

    const userData = JSON.parse(loginResponse);
    const teacherId = userData.user?._id;
    
    if (!teacherId) {
      console.error('No teacher ID found in login response');
      console.log('Login response structure:', userData);
      setNotifications([]);
      return;
    }

    let endpoint = 'notifications/all-teacher-notifications';
    if (filter === 'all') {
      endpoint = 'notifications/all-teacher-notifications';
    }

    const params = { teacherId }; // Always include teacherId
    
    if (selectedClassroom !== 'all') {
      params.classroomId = selectedClassroom;
    }
    
    if (filter !== 'all') {
      params.type = filter;
    }

    // Build query string
    const queryString = '?' + Object.keys(params).map(key => `${key}=${params[key]}`).join('&');

    console.log('Making API call to:', endpoint + queryString);
    console.log('Teacher ID:', teacherId);

    const response = await call_api(null, endpoint + queryString, 'GET');
    
    console.log('API Response:', response);
    
    if (Array.isArray(response)) {
      setNotifications(response);
    } else if (response && Array.isArray(response.data)) {
      setNotifications(response.data);
    } else {
      console.log('Unexpected response format:', typeof response);
      setNotifications([]);
    }
    
  } catch (error) {
    console.error('Error fetching notifications:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    setNotifications([]);
  } finally {
    setLoading(false);
  }
};

  // FIXED: Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await call_api(null, `notifications/read/${notificationId}`, 'POST');
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // FIXED: Dismiss notification
  const dismissNotification = async (notificationId) => {
    try {
      await call_api(null, `notifications/dismiss/${notificationId}`, 'POST');
      
      // Remove from local state
      setNotifications(prev => 
        prev.filter(notif => notif._id !== notificationId)
      );
      
      if (selectedNotification && selectedNotification._id === notificationId) {
        setSelectedNotification(null);
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'quiz_failure':
        return <FaExclamationTriangle className="notification-icon failure" />;
      case 'announcement':
        return <FaBell className="notification-icon announcement" />;
      default:
        return <FaBell className="notification-icon" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'quiz_failures') return notification.type === 'quiz_failure';
    if (filter === 'announcements') return notification.type === 'announcement';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const failureCount = notifications.filter(n => n.type === 'quiz_failure').length;


      <div className="filter-buttons">
      <button 
        className={filter === 'all' ? 'active' : ''}
        onClick={() => setFilter('all')}
      >
        All Notifications
      </button>
      <button 
        className={filter === 'quiz_failures' ? 'active' : ''}
        onClick={() => setFilter('quiz_failures')}
      >
        Quiz Failures
      </button>
      <button 
        className={filter === 'announcements' ? 'active' : ''}
        onClick={() => setFilter('announcements')}
      >
        My Announcements
      </button>
    </div>

  if (loading) {
    return (
      <div className="dashboard">
        <div className="sidebar">
          <ul className="sidebar-links">
            <li><Link to="/"><FaHome className="sidebar-icon" /></Link></li>
            <li><Link to="/dashboard"><FaChartLine className="sidebar-icon" /></Link></li>
            <li><Link to="/users"><FaUsers className="sidebar-icon" /></Link></li>
            <li><Link to="/messages"><FaEnvelope className="sidebar-icon" /></Link></li>
            <li><Link to="/notifications"><FaBell className="sidebar-icon active" /></Link></li>
            <li><Link to="/settings"><FaCog className="sidebar-icon" /></Link></li>
          </ul>
        </div>
        <div className="content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <ul className="sidebar-links">
          <li><Link to="/"><FaHome className="sidebar-icon" /></Link></li>
          <li><Link to="/dashboard"><FaChartLine className="sidebar-icon" /></Link></li>
          <li><Link to="/users"><FaUsers className="sidebar-icon" /></Link></li>
          <li><Link to="/messages"><FaEnvelope className="sidebar-icon" /></Link></li>
          <li><Link to="/notifications"><FaBell className="sidebar-icon active" /></Link></li>
          <li><Link to="/settings"><FaCog className="sidebar-icon" /></Link></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        <div className="notifications-header">
          <h1 className="dashboard-title">Teacher Notification Center</h1>
          
          <div className="notification-stats">
            <div className="stat-badge">
              <span className="stat-number">{unreadCount}</span>
              <span className="stat-label">Unread</span>
            </div>
            <div className="stat-badge failure">
              <span className="stat-number">{failureCount}</span>
              <span className="stat-label">Quiz Failures</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="notification-filters">
          <select 
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Classrooms</option>
            {classrooms.map(classroom => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name}
              </option>
            ))}
          </select>

          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All Notifications
            </button>
            <button 
              className={filter === 'quiz_failures' ? 'active' : ''}
              onClick={() => setFilter('quiz_failures')}
            >
              Quiz Failures
            </button>
            <button 
              className={filter === 'announcements' ? 'active' : ''}
              onClick={() => setFilter('announcements')}
            >
              My Announcements
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="notifications-container">
          {filteredNotifications.length === 0 ? (
            <div className="empty-notifications">
              <FaCheckCircle className="empty-icon" />
              <h3>No notifications found</h3>
              <p>
                {filter === 'quiz_failures' 
                  ? 'No quiz failures to review - great job!'
                  : 'All caught up! No new notifications.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => {
                  setSelectedNotification(notification);
                  if (!notification.isRead) {
                    markAsRead(notification._id);
                  }
                }}
              >
                <div className="notification-content">
                  {getNotificationIcon(notification.type)}
                  
                  <div className="notification-details">
                    <h3 className="notification-title">
                      {notification.title || 'Notification'}
                    </h3>
                    
                    <p className="notification-text">
                      {notification.message}
                    </p>
                    
                    <div className="notification-meta">
                      <span className="notification-time">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className="dismiss-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissNotification(notification._id);
                  }}
                  title="Dismiss notification"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherNotifications;