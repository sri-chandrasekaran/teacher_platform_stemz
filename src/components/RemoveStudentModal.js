import '../styles/popup.css';
import Select from 'react-select';
import ApiService from '../services/apiClient';
import React, { useState } from 'react';

const RemoveStudentModal = ({ isOpen, onClose, classroomId, student, onStudentRemoved }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRemove = async () => {
    setIsSubmitting(true);
    setError('');
    console.log('Removing student:', student, 'from classroom:', classroomId);
    try {
      await ApiService.removeStudent(classroomId, student._id);
      console.log('Student removed successfully');
      onStudentRemoved(student._id);
      onClose();
    } catch (error) {
      console.error('Error removing student:', error);
      setError('Failed to remove student. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Remove Student</h2>
        <p>Are you sure you want to remove {student.name} from this classroom?</p>
        {error && <p className="error-message">{error}</p>}
        <div className="modal-actions">
          <button onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button onClick={handleRemove} disabled={isSubmitting}>
            {isSubmitting ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RemoveStudentModal;