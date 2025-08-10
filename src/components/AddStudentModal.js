import React, { useState, useEffect } from 'react';
import '../styles/popup.css';
import Select from 'react-select';
import ApiService from '../apiService';

const AddStudentModal = ({ isOpen, onClose, classroomId, students, onStudentAdded }) => {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);

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
      const allUsers = await ApiService.fetchUsers();

      // Filter out users who are already students in this classroom
      // const currentStudentIds = students.map(student => student.id);
      const currentStudentIds = students.map(student => student.id || student._id);
      const available = allUsers.filter(user => !currentStudentIds.includes(user._id));
      console.log('Available users:', available);
      console.log('Current students:', students);
      console.log('Current student IDs:', currentStudentIds);
      console.log('All users:', allUsers);
      
      setAvailableUsers(available);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (selectedStudents.length === 0) {
      setError('Please select at least one student to add.');
      return;
    }
    console.log('Selected students:', selectedStudents);
    // selectedStudents.forEach(user => {
    //   handleAddStudent(user.value);
    // });

    selectedStudents.forEach(selectedOption => {
      // Find the full user object from availableUsers using the selected ID
      const fullUser = availableUsers.find(user => user._id === selectedOption.value);
      if (fullUser) {
        handleAddStudent(fullUser); // Pass the full user object
      }
    });


    setSelectedStudents([]);
    setSearchTerm('');
    onClose();
  };

  const handleAddStudent = async (user) => {
    setIsSubmitting(true);
    setError('');
    console.log('Adding student:', user, 'to classroom:', classroomId);
    try {
      // Enroll student in the classroom
      const result = await ApiService.enrollStudent(classroomId, user._id);
      console.log('Enrollment result:', result);

      // Create student object with the user data
      const newStudent = {
        id: user._id,
        name: user.name,
        email: user.email,
        cummulative_score: 0 // Default score for new students
      };

      // Email notification for enrollment
      const emailResponse = await ApiService.sendEmailNotification(
        user.email,
        'Enrollment Confirmation',
        `You have been enrolled in the classroom with ID: ${classroomId}. Welcome!`
      );
      console.log('Email notification response:', emailResponse);

      if (!emailResponse.ok) {
        throw new Error('Failed to send email notification');
      }

      // Remove the user from available users
      setAvailableUsers(prev => prev.filter(u => u._id !== user._id));
      
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
    <div className="modal-overlay"
    style={{minHeight: '400px', height: 'auto', maxHeight: '600px'}}>
      <div className="modal-content add-student-modal">
        <button className="close-button" onClick={handleClose}>×</button>
        <h2>Add Students to Classroom</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div
          className="users-list-container"
          style={{ minHeight: '350px', height: 'auto', maxHeight: '500px' }}
        >
          <Select
            isMulti
            closeMenuOnSelect={false}
            options={availableUsers.map(user => ({
              value: user._id,
              label: `${user.name} (${user.email})`
            }))}
            value={selectedStudents}
            onChange={setSelectedStudents}
            placeholder="Select students..."
            />
        </div>

        <div className="modal-footer">
          <button className="button-save" onClick={handleSave}>Save Changes</button>
          <button className="button-cancel" onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddStudentModal;
