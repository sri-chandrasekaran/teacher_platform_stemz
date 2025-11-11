import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import ClassroomList from "../components/ClassroomList";
import EditClassroomModal from "../components/editclassroom";
import InviteStudentsModal from "../components/invitestudents";
import { call_api } from "../components/api";
import { normalizeClassroom, handleApiError } from "../utils/dataHelpers";
import "../styles/styles.css";

const GroupsPage = () => {
  const navigate = useNavigate();
  
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [classroomToInvite, setClassroomToInvite] = useState(null);

  const [bannerMessage, setBannerMessage] = useState("");
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    fetchPhysicalClassrooms();
  }, []);

  const showMessage = (message) => {
    setBannerMessage(message);
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 3000);
  };


  const fetchPhysicalClassrooms = async () => {
    try {
      setLoading(true);
      console.log('Fetching classrooms...');
      
      const response = await call_api(null, "physical-classrooms/my-classrooms", "GET");
      console.log('Classrooms response:', response);
  
      // Handle both teaching and enrolled classrooms
      const teachingClassrooms = response.teaching || [];
      const enrolledClassrooms = response.enrolled || [];
      
      // Combine both arrays - you might want to add a flag to distinguish them
      const allClassrooms = [
        ...teachingClassrooms.map(classroom => ({
          ...normalizeClassroom(classroom),
          role: 'teacher'
        })),
        ...enrolledClassrooms.map(classroom => ({
          ...normalizeClassroom(classroom),
          role: 'student'
        }))
      ];
  
      console.log('All classrooms:', allClassrooms);
      setClassrooms(allClassrooms);
      
    } catch (error) {
      console.error("Error fetching physical classrooms:", error);
      setClassrooms([]);
      showMessage("Failed to load classrooms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Handle both create and edit in the same function

const handleSaveClassroom = async (classroomData) => {
  try {
    console.log('Saving classroom:', classroomData);

    if (classroomData.id) {
      // EDITING existing classroom
      console.log('Updating existing classroom:', classroomData.id);
      
      const updateData = {
        name: classroomData.name,
        description: classroomData.description,
        gradeLevel: classroomData.gradeLevel,
        schoolName: classroomData.schoolName,
        classroomNumber: classroomData.classroomNumber,
        maxStudents: classroomData.maxStudents
      };

      const response = await call_api(updateData, `physical-classrooms/${classroomData.id}`, "PUT");
      console.log('Update response:', response);

      // Update local state
      setClassrooms(prev => prev.map(classroom => 
        classroom.id === classroomData.id 
          ? normalizeClassroom(response.classroom) 
          : classroom
      ));
      
      showMessage("Classroom updated successfully!");
      
    } else {
      // CREATING new classroom
      console.log('Creating new classroom');
      
      // Get the current user's ID from localStorage or your auth system
      const currentUserId = localStorage.getItem('userId') || ''; // Adjust based on how you store user info
      
      const createData = {
        name: classroomData.name.trim(),
        description: classroomData.description?.trim() || '',
        schoolName: classroomData.schoolName.trim(),
        gradeLevel: classroomData.gradeLevel,
        academicYear: "2024-2025",
        classroomNumber: classroomData.classroomNumber?.trim() || '',
        maxStudents: classroomData.maxStudents || 30,
        teacherId: currentUserId  // ADD THIS - required by backend
      };

      console.log('Create payload:', createData);
      const response = await call_api(createData, "physical-classrooms", "POST");
      console.log('Create response:', response);

      const newClassroom = normalizeClassroom(response.classroom);
      setClassrooms(prev => [...prev, newClassroom]);
      
      showMessage("Physical classroom created successfully!");
    }
    
    setShowEditModal(false);
    setSelectedClassroom(null);
    
  } catch (error) {
    console.error("Error saving classroom:", error);
    showMessage(handleApiError(error, "Failed to save classroom."));
  }
};

  // Handle creating new classroom
  const handleAddClassroom = () => {
    console.log('Adding new classroom');
    setSelectedClassroom(null);  // null = new classroom
    setShowEditModal(true);
  };

  // Handle editing existing classroom
  const handleEditClassroom = (classroom) => {
    console.log('Editing classroom:', classroom);
    setSelectedClassroom(classroom);
    setShowEditModal(true);
  };

  // Handle deleting classroom
  const handleDeleteClassroom = async (id) => {
    try {
      console.log('Deleting classroom:', id);
      await call_api(null, `physical-classrooms/${id}`, "DELETE");
      setClassrooms(prev => prev.filter(classroom => classroom.id !== id));
      showMessage("Classroom deleted successfully.");
    } catch (error) {
      console.error("Error deleting classroom:", error);
      showMessage(handleApiError(error, "Failed to delete classroom."));
    }
  };

  // Handle entering classroom
  const handleEnterClassroom = (id, name) => {
    console.log('Navigating to classroom:', id, name);
    navigate(`/dashboard/${id}/${encodeURIComponent(name)}`);
  };

  // Handle student invitation
  const handleInviteStudent = (classroom) => {
    console.log('Inviting student to:', classroom);
    setClassroomToInvite(classroom);
    setShowInviteModal(true);
  };

  const handleSendInvitation = async (email) => {
    try {
      console.log('Sending invitation to:', email);
      setShowInviteModal(false);
      showMessage(`Invitation email sent to: ${email}`);
      
      // Refresh classroom data to get updated student count
      await fetchPhysicalClassrooms();
    } catch (error) {
      console.error("Error sending invitation:", error);
      showMessage("Failed to send invitation.");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="classroom-list-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your physical classrooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="classroom-list-container">
      {showBanner && <div className="confirmation-banner">{bannerMessage}</div>}

      <div className="page-container">
        <div className="page-heading-container">
          <h2 className="page-heading">Your Classrooms</h2>
        </div>
        <div className="classroom-list-scroll">
          <ClassroomList
            classrooms={classrooms}
            onEnter={handleEnterClassroom}
            onDelete={handleDeleteClassroom}
            onEdit={handleEditClassroom}
            onInvite={handleInviteStudent}
            onAddClassroom={handleAddClassroom}
            onSave={handleSaveClassroom}
          />
        </div>
      </div>



      {/* Invite Students Modal */}
      {showInviteModal && classroomToInvite && (
        <InviteStudentsModal
          classroom={classroomToInvite}
          onInvite={handleSendInvitation}
          onCancel={() => {
            setShowInviteModal(false);
            setClassroomToInvite(null);
          }}
        />
      )}
    </div>
  );
};

export default GroupsPage;