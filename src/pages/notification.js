import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaEnvelope, FaBell, FaCog, FaChartLine } from 'react-icons/fa';
import '../styles/styles.css';

const Notifications = () => {
  const { id: classroomId } = useParams();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null); 

  const isAnalyticsPage = location.pathname.includes(`/dashboard/${classroomId}`);


    // Fetch notifications on component load
    useEffect(() => {
      const fetchNotifications = async () => {
        try {
          const response = await fetch('http://localhost:3000/api/notifs');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setNotifications(
            data.map(notifs => ({
              id: notifs.student_id,
              student: notifs.student_name,
              assignment: notifs.assignment,
              score: notifs.score_in_percent,
            }))
          );
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };
  
      fetchNotifications();
    }, []);
    
  // filter notifications to show only medium and bad scores
  const filteredNotifications = notifications.filter(
    (n) => (n.score >= 60 && n.score < 80) || n.score < 60
  );

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
        <h1 className="dashboard-title">Notifications</h1>
        {/* <div className="notifications-container">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${
                notification.score < 60 ? 'failure-card' : 'medium-card'
              }`}
              onClick={() => setSelectedNotification(notification)} // Open side window
            >
              <h3 className="notification-title">{notification.student}</h3>
              <p className="notification-text">
                {notification.score < 60
                  ? `scored below 60% on ${notification.assignment}`
                  : `scored ${notification.score}% on ${notification.assignment}`}
              </p>
            </div>
          ))}
        </div> */}
        <div className="notifications-container">
  {filteredNotifications.map((notification) => (
    <div
      key={notification.id}
      className={`notification-card ${
        notification.score < 60 ? 'failure-card' : 'medium-card'
      }`}
    >
      <button
        className="remove-button"
        onClick={() => setNotifications(notifications.filter((n) => n.id !== notification.id))}
      >
        X
      </button>
      <h3 className="notification-title">{notification.student}</h3>
      <p className="notification-text">
        {notification.student} scored {notification.score}% on {notification.assignment}.
      </p>
    </div>
  ))}
</div>




        {/* Side Window */}
        {selectedNotification && (
          <div className="side-window">
          <button className="close-button" onClick={() => setSelectedNotification(null)}>
            X
          </button>
          <h3>{selectedNotification.student}</h3>
          <p>
            {selectedNotification.student} scored {selectedNotification.score}% on{' '}
            {selectedNotification.assignment}.
          </p>
          <button
            className="message-student-button"
            onClick={() => {
              window.location.href = `/messages?student=${selectedNotification.student}&message=${encodeURIComponent(
                `You scored ${selectedNotification.score} on ${selectedNotification.assignment}. Let's schedule a time to chat about the content.`
              )}`;
            }}
          >
            Message Student
          </button>

        </div>
        
        )}
      </div>
    </div>
  );
};

export default Notifications;
