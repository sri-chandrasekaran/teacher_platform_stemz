import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = ({ classroomId }) => {
  return (
    <nav className="navbar">
      <NavLink to={`/classroom/${classroomId}/students`} activeClassName="active">Students</NavLink>
      <NavLink to={`/classroom/${classroomId}/analytics`} activeClassName="active">Analytics</NavLink>
    </nav>
  );
};

export default Navbar;
