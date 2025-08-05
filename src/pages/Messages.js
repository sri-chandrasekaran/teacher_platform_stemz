import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaHome, FaUsers, FaEnvelope, FaBell, FaCog, FaChartLine, FaPlusCircle } from 'react-icons/fa';
import { call_api } from '../components/api';
import { normalizeClassroom, handleApiError } from '../utils/dataHelpers';
import '../styles/styles.css';
import ApiService from '../apiService';

const MessagingPage = () => {
  const { classroomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [groupChats, setGroupChats] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // FIXED: Fetch real classrooms and students on component load
  useEffect(() => {
    fetchTeacherClassrooms();
  }, []);

  useEffect(() => {
    if (selectedClassroom) {
      fetchClassroomStudents(selectedClassroom);
    }
  }, [selectedClassroom]);

  const fetchTeacherClassrooms = async () => {
    try {
      setLoading(true);
      console.log('Fetching teacher classrooms for messaging...');
      
      const response = await call_api(null, 'physical-classrooms/my-classrooms', 'GET');
      console.log('Teacher classrooms response:', response);
      
      if (response && response.teaching && Array.isArray(response.teaching)) {
        const normalizedClassrooms = response.teaching.map(classroom => normalizeClassroom(classroom));
        setClassrooms(normalizedClassrooms);
        
        // Auto-select first classroom or the one from URL
        if (classroomId) {
          const foundClassroom = normalizedClassrooms.find(c => c.id === classroomId);
          if (foundClassroom) {
            setSelectedClassroom(classroomId);
          }
        } else if (normalizedClassrooms.length > 0) {
          setSelectedClassroom(normalizedClassrooms[0].id);
        }
      } else {
        setClassrooms([]);
      }
    } catch (error) {
      console.error('Error fetching teacher classrooms:', error);
      setError(handleApiError(error, 'Failed to load classrooms'));
    } finally {
      setLoading(false);
    }
  };

  const fetchClassroomStudents = async (classroomId) => {
    try {
      console.log('Fetching students for messaging from classroom:', classroomId);
      
      const response = await call_api(null, `physical-classrooms/${classroomId}/students`, 'GET');
      console.log('Classroom students for messaging:', response);
      
      if (response && response.students && Array.isArray(response.students)) {
        const studentNames = response.students.map(student => student.name).filter(Boolean);
        setStudents(studentNames);
        console.log('Set students for messaging:', studentNames);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching classroom students for messaging:', error);
      setStudents([]);
    }
  };

  const handleClassroomChange = (e) => {
    const newClassroomId = e.target.value;
    setSelectedClassroom(newClassroomId);
    setSelectedStudent(''); // Reset selected student when classroom changes
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    if (!messages[student]) {
      setMessages({ ...messages, [student]: [] });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    setMessages({
      ...messages,
      [selectedStudent]: [...(messages[selectedStudent] || []), newMessage],
    });
    setNewMessage('');
  };

  const handleSendAnnouncement = async () => {
    if (newMessage.trim() === '' || !selectedClassroom) {
      setError('Please enter an announcement message and select a classroom.');
      return;
    }

    try {
      const announcementData = {
        physicalClassroomId: selectedClassroom,
        title: 'New Announcement',
        message: newMessage.trim(),
        priority: 'medium'
      };

      console.log('Sending announcement:', announcementData);

      await call_api(announcementData, 'notifications/announcement', 'POST');
      
      setAnnouncements([...announcements, newMessage]);
      setNewMessage('');
      setError('');
      
      // Show success message
      alert('Announcement sent successfully to all students in the classroom!');
      
    } catch (error) {
      console.error('Error sending announcement:', error);
      setError(handleApiError(error, 'Failed to send announcement'));
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      selectedStudent === 'announcement' ? handleSendAnnouncement() : handleSendMessage();
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      setError('Group name cannot be empty.');
      return;
    }
    if (groupChats.includes(groupName)) {
      setError('A group with this name already exists.');
      return;
    }
    setGroupChats([...groupChats, groupName]);
    setMessages({ ...messages, [groupName]: [] });
    setShowCreateGroup(false);
    setSelectedStudents([]);
    setGroupName('');
    setSelectedStudent(groupName);
    setError('');
  };

  const handleCheckboxChange = (student) => {
    setSelectedStudents(selectedStudents.includes(student)
      ? selectedStudents.filter(s => s !== student)
      : [...selectedStudents, student]);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="messaging-page">
        <div className="sidebar">
          <ul className="sidebar-links">
            <li><Link to="/"><FaHome className="sidebar-icon" /></Link></li>
            <li><Link to={`/dashboard/${classroomId || ''}`}><FaChartLine className="sidebar-icon" /></Link></li>
            <li><Link to="/users"><FaUsers className="sidebar-icon" /></Link></li>
            <li><Link to="/messages"><FaEnvelope className="sidebar-icon active" /></Link></li>
            <li><Link to="/notifications"><FaBell className="sidebar-icon" /></Link></li>
            <li><Link to="/settings"><FaCog className="sidebar-icon" /></Link></li>
          </ul>
        </div>
        <div className="content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading messaging interface...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messaging-page">
      {/* Sidebar */}
      <div className="sidebar">
        <ul className="sidebar-links">
          <li><Link to="/"><FaHome className="sidebar-icon" /></Link></li>
          <li><Link to={`/dashboard/${classroomId || ''}`}><FaChartLine className={`sidebar-icon ${location.pathname.includes('/dashboard/') ? 'active' : ''}`} /></Link></li>
          <li><Link to="/users"><FaUsers className={`sidebar-icon ${location.pathname === '/users' ? 'active' : ''}`} /></Link></li>
          <li><Link to="/messages"><FaEnvelope className={`sidebar-icon ${location.pathname === '/messages' ? 'active' : ''}`} /></Link></li>
          <li><Link to="/notifications"><FaBell className={`sidebar-icon ${location.pathname === '/notifications' ? 'active' : ''}`} /></Link></li>
          <li><Link to="/settings"><FaCog className={`sidebar-icon ${location.pathname === '/settings' ? 'active' : ''}`} /></Link></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        <h1 className="page-title">Messaging Center</h1>
        
        {/* Classroom Selector */}
        <div className="classroom-selector">
          <label htmlFor="classroom-select">Select Classroom:</label>
          <select 
            id="classroom-select"
            value={selectedClassroom}
            onChange={handleClassroomChange}
            className="classroom-select"
          >
            <option value="">Choose a classroom...</option>
            {classrooms.map(classroom => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name} - Grade {classroom.gradeLevel}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="chat-container">
          {/* Student List */}
          <div className="student-list">
            <div className={`student-item ${selectedStudent === 'announcement' ? 'selected' : ''}`} 
                 onClick={() => setSelectedStudent('announcement')}>
              📢 Make an Announcement
            </div>
            
            {selectedClassroom && students.length > 0 ? (
              students.map((student) => (
                <div key={student} 
                     className={`student-item ${selectedStudent === student ? 'selected' : ''}`} 
                     onClick={() => handleStudentSelect(student)}>
                  👤 {student}
                </div>
              ))
            ) : (
              <div className="no-students-message">
                {selectedClassroom ? 'No students in this classroom' : 'Select a classroom to see students'}
              </div>
            )}
            
            {groupChats.map((group) => (
              <div key={group} 
                   className={`student-item ${selectedStudent === group ? 'selected' : ''}`} 
                   onClick={() => handleStudentSelect(group)}>
                👥 {group}
              </div>
            ))}
            
            <div className="student-item create-group" onClick={() => setShowCreateGroup(true)}>
              ➕ Create a Study Group
            </div>
          </div>

          {/* Create Group Modal */}
          {showCreateGroup && (
            <div className="create-group-modal">
              <div className="modal-content">
                <h3>Create a Study Group</h3>
                <input
                  type="text"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="group-name-input"
                />
                {error && <div className="error-message">{error}</div>}
                <h4>Select students for the group</h4>
                <div className="checkbox-container">
                  {students.map((student) => (
                    <label key={student}>
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student)}
                        onChange={() => handleCheckboxChange(student)}
                      />
                      {student}
                    </label>
                  ))}
                </div>
                <div className="modal-buttons">
                  <button className="create-button" onClick={handleCreateGroup}>Create Group</button>
                  <button className="cancel-button" onClick={() => setShowCreateGroup(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Chat Area */}
          <div className="chat-area">
            <div className="chat-history">
              {selectedStudent === 'announcement' ? (
                <>
                  <div className="announcement-info">
                    <h3>📢 Classroom Announcements</h3>
                    {selectedClassroom ? (
                      <p>Send announcements to all students in the selected classroom</p>
                    ) : (
                      <p>⚠️ Please select a classroom first</p>
                    )}
                  </div>
                  {announcements.length > 0 ? (
                    announcements.map((announcement, index) => (
                      <div key={index} className="announcement-message">
                        <strong>Announcement:</strong> {announcement}
                      </div>
                    ))
                  ) : (
                    <div className="announcement-placeholder">
                      What would you like to announce to your students?
                    </div>
                  )}
                </>
              ) : selectedStudent && messages[selectedStudent] ? (
                messages[selectedStudent].map((msg, index) => (
                  <div key={index} className="chat-message">You: {msg}</div>
                ))
              ) : selectedStudent ? (
                <div className="chat-placeholder">
                  Start a conversation with {selectedStudent}
                </div>
              ) : (
                <div className="chat-placeholder">
                  Select a student or announcement option to start messaging
                </div>
              )}
            </div>
            
            {selectedStudent && selectedClassroom && (
              <div className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    selectedStudent === 'announcement' 
                      ? 'Type your announcement...' 
                      : `Message ${selectedStudent}...`
                  }
                />
                <button onClick={selectedStudent === 'announcement' ? handleSendAnnouncement : handleSendMessage}>
                  {selectedStudent === 'announcement' ? '📢 Send Announcement' : '💬 Send Message'}
                </button>
              </div>
            )}
            
            {selectedStudent && !selectedClassroom && (
              <div className="no-classroom-warning">
                ⚠️ Please select a classroom to send messages
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;

// import React, { useState, useEffect } from 'react';
// import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
// import { FaHome, FaUsers, FaEnvelope, FaBell, FaCog, FaChartLine, FaPlusCircle } from 'react-icons/fa';
// import '../styles/styles.css';

// const MessagingPage = () => {
//   const { classroomId } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [selectedStudent, setSelectedStudent] = useState('');
//   const [messages, setMessages] = useState({});
//   const [newMessage, setNewMessage] = useState('');
//   const [announcements, setAnnouncements] = useState([]);
//   const [showCreateGroup, setShowCreateGroup] = useState(false);
//   const [selectedStudents, setSelectedStudents] = useState([]);
//   const [groupChats, setGroupChats] = useState([]);
//   const [groupName, setGroupName] = useState('');
//   const [error, setError] = useState('');
//   const [students, setStudents] = useState([]); // State for students

//   // Fetch students on component load
//   useEffect(() => {
//     const fetchStudents = async () => {
//       try {
//         const response = await fetch('http://localhost:3000/api/students');
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         setStudents(data.map(student => student.student_name)); // Adjust based on your API response structure
//       } catch (error) {
//         console.error('Error fetching students:', error);
//       }
//     };
  
//     fetchStudents();
//   }, []);
  

//   const handleStudentSelect = (student) => {
//     setSelectedStudent(student);
//     if (!messages[student]) {
//       setMessages({ ...messages, [student]: [] });
//     }
//   };

//   const handleSendMessage = () => {
//     if (newMessage.trim() === '') return;
//     setMessages({
//       ...messages,
//       [selectedStudent]: [...messages[selectedStudent], newMessage],
//     });
//     setNewMessage('');
//   };

//   const handleSendAnnouncement = () => {
//     if (newMessage.trim() === '') return;
//     setAnnouncements([...announcements, newMessage]);
//     setNewMessage('');
//   };

//   const handleKeyDown = (event) => {
//     if (event.key === 'Enter') {
//       event.preventDefault();
//       selectedStudent === 'announcement' ? handleSendAnnouncement() : handleSendMessage();
//     }
//   };

//   const handleCreateGroup = () => {
//     if (!groupName.trim()) {
//       setError('Group name cannot be empty.');
//       return;
//     }
//     if (groupChats.includes(groupName)) {
//       setError('A group with this name already exists.');
//       return;
//     }
//     setGroupChats([...groupChats, groupName]);
//     setMessages({ ...messages, [groupName]: [] });
//     setShowCreateGroup(false);
//     setSelectedStudents([]);
//     setGroupName('');
//     setSelectedStudent(groupName);
//     setError('');
//   };

//   const handleCheckboxChange = (student) => {
//     setSelectedStudents(selectedStudents.includes(student)
//       ? selectedStudents.filter(s => s !== student)
//       : [...selectedStudents, student]);
//   };

//   return (
//     <div className="messaging-page">
//       {/* Sidebar */}
//       <div className="sidebar">
//         <ul className="sidebar-links">
//           <li><Link to="/"><FaHome className="sidebar-icon" /></Link></li>
//           <li><Link to={`/dashboard/${classroomId}`}><FaChartLine className={`sidebar-icon ${location.pathname === `/dashboard/${classroomId}` ? 'active' : ''}`} /></Link></li>
//           <li><Link to="/users"><FaUsers className={`sidebar-icon ${location.pathname === '/users' ? 'active' : ''}`} /></Link></li>
//           <li><Link to="/messages"><FaEnvelope className={`sidebar-icon ${location.pathname === '/messages' ? 'active' : ''}`} /></Link></li>
//           <li><Link to="/notifications"><FaBell className={`sidebar-icon ${location.pathname === '/notifications' ? 'active' : ''}`} /></Link></li>
//           <li><Link to="/settings"><FaCog className={`sidebar-icon ${location.pathname === '/settings' ? 'active' : ''}`} /></Link></li>
//         </ul>
//       </div>

//       {/* Main Content */}
//       <div className="content">
//         <div className="chat-container">
//           {/* Student List */}
//           <div className="student-list">
//             <div className={`student-item ${selectedStudent === 'announcement' ? 'selected' : ''}`} onClick={() => setSelectedStudent('announcement')}>Make an Announcement</div>
//             {students.map((student) => (
//               <div key={student} className={`student-item ${selectedStudent === student ? 'selected' : ''}`} onClick={() => handleStudentSelect(student)}>{student}</div>
//             ))}
//             {groupChats.map((group) => (
//               <div key={group} className={`student-item ${selectedStudent === group ? 'selected' : ''}`} onClick={() => handleStudentSelect(group)}>{group}</div>
//             ))}
//             <div className="student-item create-group" onClick={() => setShowCreateGroup(true)}>Create a Study Group</div>
//           </div>

//           {/* Create Group Modal */}
//           {showCreateGroup && (
//             <div className="create-group-modal">
//               <div className="modal-content">
//                 <h3>Create a Study Group</h3>
//                 <input
//                   type="text"
//                   placeholder="Enter group name"
//                   value={groupName}
//                   onChange={(e) => setGroupName(e.target.value)}
//                   className="group-name-input"
//                 />
//                 {error && <div className="error-message">{error}</div>}
//                 <h4>Select students for the group</h4>
//                 <div className="checkbox-container">
//                   {students.map((student) => (
//                     <label key={student}>
//                       <input
//                         type="checkbox"
//                         checked={selectedStudents.includes(student)}
//                         onChange={() => handleCheckboxChange(student)}
//                       />
//                       {student}
//                     </label>
//                   ))}
//                 </div>
//                 <div className="modal-buttons">
//                   <button className="create-button" onClick={handleCreateGroup}>Create Group</button>
//                   <button className="cancel-button" onClick={() => setShowCreateGroup(false)}>Cancel</button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Chat Area */}
//           <div className="chat-area">
//             <div className="chat-history">
//               {selectedStudent === 'announcement' ? (
//                 announcements.length > 0 ? (
//                   announcements.map((announcement, index) => (
//                     <div key={index} className="announcement-message">Announcement: {announcement}</div>
//                   ))
//                 ) : (
//                   <div className="announcement-placeholder">What would you like to announce?</div>
//                 )
//               ) : selectedStudent && messages[selectedStudent] ? (
//                 messages[selectedStudent].map((msg, index) => (
//                   <div key={index} className="chat-message">{msg}</div>
//                 ))
//               ) : (
//                 'Select a student to start messaging'
//               )}
//             </div>
//             {selectedStudent && (
//               <div className="chat-input">
//                 <input
//                   type="text"
//                   value={newMessage}
//                   onChange={(e) => setNewMessage(e.target.value)}
//                   onKeyDown={handleKeyDown}
//                   placeholder={selectedStudent === 'announcement' ? 'Type your announcement...' : 'Type your message...'}
//                 />
//                 <button onClick={selectedStudent === 'announcement' ? handleSendAnnouncement : handleSendMessage}>Send</button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MessagingPage;
