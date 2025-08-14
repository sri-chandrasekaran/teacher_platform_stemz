import React, { useState, useEffect } from 'react';
import ApiService from '../apiService';

const ActiveUsers = ({ students }) => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      if (students) {
        const studentsArray = students.students || students;
        const data = await ApiService.buildActiveUsers(studentsArray);
        setActiveUsers(data);
      }
      setLoading(false);
    };
    
    fetchActivity();
  }, [students]);

  if (loading) return <div>Loading activity...</div>;

  return (
    <div className="active-users-container">
      <h2>Active Users</h2>
      <table className="active-users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {activeUsers.slice(0, 5).map((user, index) => (
            <tr key={index}>
              <td>{user.name}</td>
              <td>
                {user.isActive ? '🟢' : '🔴'} {user.activityStatus}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActiveUsers;