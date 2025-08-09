import React, { useState, useEffect } from 'react';
import { call_api } from '../components/api'; 
import ApiService from '../apiService';

const PostModal = ({ onClose }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [assignmentType, setAssignmentType] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [teacherClassrooms, setTeacherClassrooms] = useState([]);

  // Fetch real physical classrooms for the logged-in teacher
  useEffect(() => {
    const fetchTeacherClassrooms = async () => {
      try {
        console.log('Fetching teacher physical classrooms...');
        
        // const response = await call_api(null, 'physical-classrooms/my-classrooms', 'GET');

      const user = JSON.parse(localStorage.getItem('login_response') || '{}').user || {};
      const userId = user._id;
      
      if (!userId) {
        console.error('No user ID found for fetching classrooms');
        return;
      }
      
      console.log('Fetching classrooms for user:', userId);

      const response = await ApiService.fetchMyClassrooms(userId);
    
        
        console.log('Physical classrooms response:', response);
        
        if (response && response.teaching && Array.isArray(response.teaching)) {
          setTeacherClassrooms(response.teaching);
          console.log('Loaded teaching classrooms:', response.teaching);
        } else {
          console.warn('No teaching classrooms found');
          setError('No physical classrooms found. Create a classroom first.');
        }
      } catch (error) {
        console.error('Error fetching physical classrooms:', error);
        setError('Failed to load classrooms. Please try again.');
      }
    };

    fetchTeacherClassrooms();
  }, []);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setError('');
    setSuccess('');
  };

  // FIXED: Real announcement creation using correct backend endpoint
  const handleAnnouncementSubmit = async () => {
    if (!message.trim()) {
      setError('Please enter an announcement message');
      return;
    }
    if (!selectedClassroom) {
      setError('Please select a physical classroom');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Creating announcement for physical classroom:', {
        physicalClassroomId: selectedClassroom,
        title: title || 'New Announcement',
        message: message.trim(),
        priority: 'medium'
      });

      const announcementData = {
        physicalClassroomId: selectedClassroom,
        title: title || 'New Announcement', 
        message: message.trim(),
        priority: 'medium'
      };

      // Use the correct notifications endpoint
      await call_api(announcementData, 'notifications/announcement', 'POST');

      setSuccess('Announcement posted successfully! All students in the classroom will be notified.');
      
      // Reset form
      setMessage('');
      setTitle('');
      
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error posting announcement:', error);
      if (error.response?.data?.message) {
        setError(`Failed to post announcement: ${error.response.data.message}`);
      } else {
        setError('Failed to post announcement. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Real assignment creation using correct backend endpoint
  const handleAssignmentSubmit = async () => {
    if (!selectedClassroom) {
      setError('Please select a physical classroom');
      return;
    }
    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }
    if (!assignmentType) {
      setError('Please select an assignment type');
      return;
    }
    if (!title.trim()) {
      setError('Please enter an assignment title');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Map courses to the enum values in your backend
      const courseKeyMap = {
        'Astronomy': 'astronomy',
        'Chemistry': 'chemistry',
        'Basics of Coding': 'basicsOfCoding',
        'Biochemistry': 'biochemistry',
        'Circuits': 'circuits',
        'Environmental Science': 'environmentalScience',
        'Psychology': 'psychology',
        'Statistics': 'statistics',
        'Zoology': 'zoology'
      };

      const courseKey = courseKeyMap[selectedCourse];
      
      if (!courseKey) {
        setError('Invalid course selection');
        return;
      }

      // Generate direct link based on your route mapping
      let directLink = '';
      if (courseKey === 'astronomy') {
        directLink = assignmentType === 'quiz' ? '/astroquiz' : 
                    assignmentType === 'video' ? '/astrovid1s' : '/astroworksheet1';
      } else if (courseKey === 'chemistry') {
        directLink = assignmentType === 'quiz' ? '/chemquiz' : '/chem1';
      } else if (courseKey === 'basicsOfCoding') {
        directLink = assignmentType === 'quiz' ? '/codingquiz' : '/coding1';
      } else {
        // Default pattern for other courses
        directLink = `/${courseKey}${assignmentType === 'quiz' ? 'quiz' : '1'}`;
      }

      const assignmentData = {
        physicalClassroomId: selectedClassroom,
        title: title.trim(),
        description: description.trim() || `Complete ${selectedCourse} ${assignmentType}`,
        course: courseKey,
        lesson: 'lesson1',
        activityType: assignmentType,
        activityTitle: `${selectedCourse} ${assignmentType}`,
        dueDate: dueDate || null,
        directLink: directLink,
        priority: 'medium'
      };

      console.log('Creating assignment:', assignmentData);

      // Use the correct assignments endpoint
      await call_api(assignmentData, 'assignments', 'POST');

      setSuccess('Assignment created successfully! Students in the classroom will be notified.');
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedCourse('');
      setAssignmentType('');
      setDueDate('');
      
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error creating assignment:', error);
      if (error.response?.data?.message) {
        setError(`Failed to create assignment: ${error.response.data.message}`);
      } else {
        setError('Failed to create assignment. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (selectedOption === 'announcement') {
      return (
        <div>
          <h3>Make an Announcement</h3>
          
          {/* Physical Classroom Selection */}
          <label>Select Physical Classroom*</label>
          <select
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
            required
          >
            <option value="">Select a Physical Classroom</option>
            {teacherClassrooms.map(classroom => (
              <option key={classroom._id} value={classroom._id}>
                {classroom.name} - Grade {classroom.gradeLevel}
              </option>
            ))}
          </select>

          {/* Title (Optional) */}
          <label>Title (Optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title..."
            style={{ width: '100%', marginBottom: '10px' }}
          />

          {/* Message */}
          <label>Message*</label>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your announcement here..." 
            rows="5" 
            style={{ width: '100%', marginBottom: '10px' }}
            required
          />

          <button 
            onClick={handleAnnouncementSubmit}
            disabled={loading}
            style={{
              margin: '10px 0',
              padding: '8px 12px',
              border: '2px solid #218838',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              backgroundColor: loading ? '#6c757d' : '#28a745',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            {loading ? 'Posting...' : 'Post Announcement'}
          </button>
        </div>
      );
    } else if (selectedOption === 'assignment') {
      return (
        <div>
          <h3>Assign a Task</h3>

          {/* Physical Classroom Selection */}
          <label>Select Physical Classroom*</label>
          <select
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
            required
          >
            <option value="">Select a Physical Classroom</option>
            {teacherClassrooms.map(classroom => (
              <option key={classroom._id} value={classroom._id}>
                {classroom.name} - Grade {classroom.gradeLevel}
              </option>
            ))}
          </select>

          {/* Assignment Title */}
          <label>Assignment Title*</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter assignment title..."
            style={{ width: '100%', marginBottom: '10px' }}
            required
          />

          {/* Course Dropdown - Updated to match backend enum */}
          <label>Course*</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
            required
          >
            <option value="">Select a Course</option>
            <option value="Astronomy">Astronomy</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Basics of Coding">Basics of Coding</option>
            <option value="Biochemistry">Biochemistry</option>
            <option value="Circuits">Circuits</option>
            <option value="Environmental Science">Environmental Science</option>
            <option value="Psychology">Psychology</option>
            <option value="Statistics">Statistics</option>
            <option value="Zoology">Zoology</option>
          </select>

          {/* Assignment Type Dropdown */}
          <label>Assignment Type*</label>
          <select
            value={assignmentType}
            onChange={(e) => setAssignmentType(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
            required
          >
            <option value="">Select Assignment Type</option>
            <option value="quiz">Quiz</option>
            <option value="worksheet">Worksheet</option>
            <option value="video">Video Lesson</option>
          </select>

          {/* Due Date */}
          <label>Due Date (Optional)</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          />

          {/* Additional Details */}
          <label>Additional Details</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            placeholder="Enter assignment description..."
            style={{ width: '100%', marginBottom: '10px' }}
          />

          <button 
            onClick={handleAssignmentSubmit}
            disabled={loading}
            style={{ 
              margin: '10px 0',
              padding: '8px 12px',
              border: '2px solid #218838',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              backgroundColor: loading ? '#6c757d' : '#28a745',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            {loading ? 'Creating...' : 'Assign Task'}
          </button>
        </div>
      );
    }
  };

  return (
    <div className="modal-overlay corner-modal">
      <div className="modal-content corner-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Create New Assignment/Announcement</h2>
        
        {/* Error/Success Messages */}
        {error && (
          <div style={{ 
            background: '#f8d7da', 
            color: '#721c24', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '10px' 
          }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ 
            background: '#d4edda', 
            color: '#155724', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '10px' 
          }}>
            {success}
          </div>
        )}

        <div className="post-options">
          <button onClick={() => handleOptionChange('announcement')}>
            Make an Announcement
          </button>
          <button onClick={() => handleOptionChange('assignment')}>
            Assign a Task
          </button>
        </div>
        
        {renderForm()}
      </div>
    </div>
  );
};

export default PostModal;