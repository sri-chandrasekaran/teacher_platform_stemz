import React, { useState, useEffect } from 'react';
import '../styles/popup.css';

const AddStudentModal = ({ isOpen, onClose, classroomId, students, onStudentAdded }) => {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch all users and filter out current students
  useEffect(() => {
    if (isOpen) {
      fetchAvailableUsers();
    }
  }, [isOpen, students]);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(availableUsers);
    } else {
      const filtered = availableUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, availableUsers]);

  const fetchAvailableUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:3000/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const allUsers = await response.json();
      
      // Filter out users who are already students in this classroom
      const currentStudentIds = students.map(student => student.id);
      const available = allUsers.filter(user => !currentStudentIds.includes(user.id));
      
      setAvailableUsers(available);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddStudent = async (user) => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:3000/api/classrooms/${classroomId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add student');
      }

      const result = await response.json();
      
      // Create student object with the user data
      const newStudent = {
        id: user.id,
        name: user.name,
        email: user.email,
        cummulative_score: 0 // Default score for new students
      };
      
      // Remove the user from available users
      setAvailableUsers(prev => prev.filter(u => u.id !== user.id));
      
      // Notify parent component that a student was added
      if (onStudentAdded) {
        onStudentAdded(newStudent);
      }
      
    } catch (error) {
      console.error('Error adding student:', error);
      setError('Failed to add student. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content add-student-modal">
        <button className="close-button" onClick={handleClose}>×</button>
        <h2>Add Students to Classroom</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Users List */}
        <div className="users-list-container">
          {isLoading ? (
            <div className="loading-message">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="no-users-message">
              {searchTerm ? 'No users match your search.' : 'No available users to add.'}
            </div>
          ) : (
            <div className="users-grid">
              {filteredUsers.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                    {user.student_id && (
                      <div className="user-id">ID: {user.student_id}</div>
                    )}
                  </div>
                  <button
                    className="add-user-btn"
                    onClick={() => handleAddStudent(user)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Adding...' : 'Add'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="cancel-btn" 
            onClick={handleClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStudentModal;
