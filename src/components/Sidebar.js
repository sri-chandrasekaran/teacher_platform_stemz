import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaEnvelope, FaBell, FaCog, FaChartLine } from 'react-icons/fa';

// Reusable sidebar for classroom-scoped pages
// Props: classroomId (string), classroomName (string, optional)
const Sidebar = ({ classroomId }) => {
  const location = useLocation();

  const isDashboard = location.pathname.startsWith('/dashboard');
  const isUsers = location.pathname === '/users' || location.pathname.startsWith('/users/');
  const isMessages = location.pathname === '/messages' || location.pathname.startsWith('/messages/');
  const isNotifications = location.pathname === '/notifications';
  const isSettings = location.pathname.startsWith('/settings');

  const dashboardPath = classroomId ? `/dashboard/${classroomId}` : '/';
  const settingsPath = classroomId ? `/settings/${classroomId}` : '/settings';
  const usersPath = classroomId ? `/users/${classroomId}` : '/users';
  const messagesPath = classroomId ? `/messages/${classroomId}` : '/messages';
  const notificationsPath = classroomId ? `/notifications/${classroomId}` : '/notifications';

  return (
    <div className="sidebar">
      <ul className="sidebar-links">
        <li>
          <Link to="/">
            <FaHome className="sidebar-icon" />
          </Link>
        </li>
        <li>
          <Link to={dashboardPath}>
            <FaChartLine className={`sidebar-icon ${isDashboard ? 'active' : ''}`} />
          </Link>
        </li>
        <li>
          <Link to={usersPath}>
            <FaUsers className={`sidebar-icon ${isUsers ? 'active' : ''}`} />
          </Link>
        </li>
        <li>
          <Link to={messagesPath}>
            <FaEnvelope className={`sidebar-icon ${isMessages ? 'active' : ''}`} />
          </Link>
        </li>
        <li>
          <Link to={notificationsPath}>
            <FaBell className={`sidebar-icon ${isNotifications ? 'active' : ''}`} />
          </Link>
        </li>
        <li>
          <Link to={settingsPath}>
            <FaCog className={`sidebar-icon ${isSettings ? 'active' : ''}`} />
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
