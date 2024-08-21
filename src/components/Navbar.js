import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/styles.css';

const Navbar = ({ classroomId }) => {
  return (
    <nav className="navbar">
      <NavLink 
        to={`/classroom/${classroomId}/students`} 
        className={({ isActive }) => (isActive ? 'active' : '')}
      >
        Students
      </NavLink>
      <NavLink 
        to={`/classroom/${classroomId}/messages`} 
        className={({ isActive }) => (isActive ? 'active' : '')}
      >
        Messages
      </NavLink>
    </nav>
  );
};

export default Navbar;