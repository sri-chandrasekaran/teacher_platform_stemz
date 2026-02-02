import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaHome, FaUsers, FaEnvelope, FaBell, FaCog, FaChartLine } from 'react-icons/fa';
import { normalizeClassroom, handleApiError } from '../utils/dataHelpers';
import '../styles/styles.css';
import '../styles/messages.css';
import studyGroupService from '../services/studyGroupService';
import messageService from '../services/messageService';
import physicalClassroomService from '../services/physicalClassroomService';
import apiClient from '../services/apiClient';
import Sidebar from '../components/Sidebar';

const MessagingPage = () => {
  const { classroomId } = useParams();
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const fetchTeacherClassrooms = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get current user from localStorage
      const user = JSON.parse(localStorage.getItem('login_response') || '{}').user || {};
      if (!user._id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const response = await physicalClassroomService.getUserClassrooms(user._id);
      
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
  }, [classroomId]);

  useEffect(() => {
    fetchTeacherClassrooms();
  }, [fetchTeacherClassrooms]);

  useEffect(() => {
    if (selectedClassroom) {
      fetchClassroomStudents(selectedClassroom);
      fetchStudyGroups(selectedClassroom);
    }
  }, [selectedClassroom]);

  const fetchClassroomStudents = async (classroomId) => {
    try {
      const response = await physicalClassroomService.getClassroomStudents(classroomId);
      
      if (response && response.students && Array.isArray(response.students)) {
        setStudents(response.students);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching classroom students for messaging:', error);
      setStudents([]);
    }
  };

  const fetchStudyGroups = async (classroomId) => {
    try {
      const groups = await studyGroupService.getStudyGroupsByClassroomId(classroomId);
      setStudyGroups(Array.isArray(groups) ? groups : []);
    } catch (error) {
      console.error('Error fetching study groups:', error);
      setStudyGroups([]);
    }
  };

  const handleClassroomChange = (e) => {
    const newClassroomId = e.target.value;
    setSelectedClassroom(newClassroomId);
    setSelectedStudent(''); // Reset selected student when classroom changes
  };

  const handleStudentSelect = async (student) => {
    setSelectedStudent(student);
    
    // Fetch messages when selecting a student or group
    await fetchMessages(student);
  };

  const fetchMessages = async (recipientOrGroupId) => {
    if (!recipientOrGroupId || recipientOrGroupId === 'announcement') return;

    setMessagesLoading(true);
    try {
      // Check if this is a study group by looking in studyGroups array
      const isStudyGroup = studyGroups.some(group => group._id === recipientOrGroupId);

      let fetchedMessages = [];

      if (isStudyGroup) {
        // Fetch study group messages (pull history)
        console.debug('[Messages] Pulling study group history for group:', recipientOrGroupId);
        fetchedMessages = await messageService.getGroupMessages(recipientOrGroupId);
        console.debug('[Messages] Study group history received:', fetchedMessages.length, 'messages');
      } else {
        // Fetch direct messages
        console.log('Fetching direct messages with:', recipientOrGroupId);
        fetchedMessages = await messageService.getDirectMessages(recipientOrGroupId);
      }

      // Update messages state (functional update to avoid stale closure)
      setMessages(prev => ({
        ...prev,
        [recipientOrGroupId]: fetchedMessages
      }));

    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
      setMessages(prev => ({
        ...prev,
        [recipientOrGroupId]: []
      }));
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !selectedStudent) return;

    try {
      // Check if this is a study group
      const isStudyGroup = studyGroups.some(group => group._id === selectedStudent);
      
      let sentMessage;

      if (isStudyGroup) {
        // Send to study group
        console.log('Sending message to study group:', selectedStudent);
        sentMessage = await messageService.postGroupMessage(selectedStudent, {
          content: newMessage.trim()
        });
      } else {
        // Send direct message
        console.log('Sending direct message to:', selectedStudent);
        sentMessage = await messageService.sendDirectMessage(
          selectedStudent,
          newMessage.trim(),
          selectedClassroom
        );
      }

      // Update local state with the sent message (functional update to avoid stale closure)
      setMessages(prev => ({
        ...prev,
        [selectedStudent]: [...(prev[selectedStudent] || []), sentMessage],
      }));

      setNewMessage('');
      setError('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError(handleApiError(error, 'Failed to send message'));
    }
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

      await apiClient.post('api/notifications/announcement', announcementData);
      
      setAnnouncements([...announcements, newMessage]);
      setNewMessage('');
      setError('');
      setSuccess('Announcement sent successfully to all students in the classroom!');
      
      setTimeout(() => setSuccess(''), 3000);
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

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Group name cannot be empty.');
      return;
    }
    if (!selectedClassroom) {
      setError('Please select a classroom first.');
      return;
    }
    if (selectedStudents.length === 0) {
      setError('Please select at least one student.');
      return;
    }

    try {
      // Get student IDs from selected students
      const memberUserIds = students
        .filter(student => selectedStudents.includes(student.name || student._id))
        .map(student => student._id);

      if (memberUserIds.length === 0) {
        setError('Could not find selected students.');
        return;
      }

      const studyGroupData = {
        classroomId: selectedClassroom,
        name: groupName.trim(),
        memberUserIds: memberUserIds
      };

      const newGroup = await studyGroupService.createStudyGroup(studyGroupData);
      
      setStudyGroups([...studyGroups, newGroup]);
      setMessages({ ...messages, [newGroup._id]: [] });
      setShowCreateGroup(false);
      setSelectedStudents([]);
      setGroupName('');
      setError('');
      setSuccess('Study group created successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating study group:', error);
      setError(error.message || 'Failed to create study group');
    }
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
      <Sidebar classroomId={classroomId} />

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

        {success && (
          <div className="success-message">
            {success}
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
              students.map((student) => {
                const studentName = student.name || student.email || student._id;
                const studentId = student._id || student;
                return (
                  <div key={studentId} 
                       className={`student-item ${selectedStudent === studentId ? 'selected' : ''}`} 
                       onClick={() => handleStudentSelect(studentId)}>
                    👤 {studentName}
                  </div>
                );
              })
            ) : (
              <div className="no-students-message">
                {selectedClassroom ? 'No students in this classroom' : 'Select a classroom to see students'}
              </div>
            )}
            
            {studyGroups.map((group) => (
              <div key={group._id} 
                   className={`student-item ${selectedStudent === group._id ? 'selected' : ''}`} 
                   onClick={() => handleStudentSelect(group._id)}>
                👥 {group.name} ({group.memberUserIds?.length || 0} members)
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
                  {students.map((student) => {
                    const studentName = student.name || student.email || student._id;
                    const studentId = student._id || student;
                    return (
                      <label key={studentId}>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(studentName)}
                          onChange={() => handleCheckboxChange(studentName)}
                        />
                        {studentName}
                      </label>
                    );
                  })}
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
              ) : selectedStudent && Array.isArray(messages[selectedStudent]) && messages[selectedStudent].length > 0 ? (
                messages[selectedStudent].map((msg, index) => {
                  // Check if msg is a string (old local state) or object (from API)
                  const isApiMessage = typeof msg === 'object';
                  const currentUser = JSON.parse(localStorage.getItem('login_response') || '{}').user || {};
                  const isOwnMessage = isApiMessage ? msg.senderUserId === currentUser._id : true;
                  
                  return (
                    <div 
                      key={isApiMessage ? msg._id : index} 
                      className={`chat-message ${isOwnMessage ? 'own-message' : 'other-message'}`}
                    >
                      {isApiMessage ? (
                        <>
                          <div className="message-sender">
                            {isOwnMessage ? 'You' : (msg.senderName || 'Student')}
                          </div>
                          <div className="message-content">{msg.content}</div>
                          <div className="message-timestamp">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </div>
                        </>
                      ) : (
                        `You: ${msg}`
                      )}
                    </div>
                  );
                })
              ) : selectedStudent ? (
                <div className="chat-placeholder">
                  {messagesLoading
                    ? 'Loading messages...'
                    : messages[selectedStudent] && messages[selectedStudent].length === 0
                      ? 'No messages yet. Start the conversation!'
                      : (() => {
                          const name = studyGroups.find(g => g._id === selectedStudent)?.name || students.find(s => (s._id || s) === selectedStudent)?.name || selectedStudent;
                          return `Start a conversation with ${name}`;
                        })()}
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
