import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';
import ApiService from '../apiService';
import ClassroomList from "../components/ClassroomList";
import EditClassroomModal from "../components/editclassroom";
import InviteStudentsModal from "../components/invitestudents";
import { normalizeClassroom, handleApiError } from "../utils/dataHelpers";

const GroupsPage = () => {
  const navigate = useNavigate();
  
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useState(JSON.parse(localStorage.getItem('login_response') || '{}').user || {});
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [classroomToInvite, setClassroomToInvite] = useState(null);

  const [bannerMessage, setBannerMessage] = useState("");
  const [showBanner, setShowBanner] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPhysicalClassrooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      const response = await ApiService.fetchMyClassrooms(user._id);
      console.log('Fetched classrooms:', response);
      const normalizedClassrooms = response.teaching.map(normalizeClassroom);

      setClassrooms(normalizedClassrooms);
      console.log('Normalized classrooms:', normalizedClassrooms);
    } catch (error) {
      console.error("Error fetching physical classrooms:", error);
      setClassrooms([]);
      showMessage("Failed to load classrooms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClassroom = async (classroomData) => {
    if (saving) return;
    setSaving(true);
    
    try {
      if (classroomData.id) {
        // Update existing classroom
        const updateData = {
          name: classroomData.name,
          description: classroomData.description,
          gradeLevel: classroomData.gradeLevel,
          schoolName: classroomData.schoolName,
          classroomNumber: classroomData.classroomNumber,
          maxStudents: classroomData.maxStudents,
          students: classroomData.students || []
        };

        const response = await ApiService.updateClassroom(classroomData.id, updateData);
        
        setClassrooms(prev => prev.map(classroom => 
          classroom.id === classroomData.id 
            ? normalizeClassroom(response.classroom) 
            : classroom
        ));
        
        showMessage("Classroom updated successfully!");
      } else {
        // Create new classroom
        const createData = {
          name: classroomData.name.trim(),
          description: classroomData.description?.trim() || '',
          schoolName: 'placeholder',
          gradeLevel: '1',
          academicYear: "2024-2025",
          classroomNumber: classroomData.classroomNumber?.trim() || '',
          maxStudents: classroomData.maxStudents || 30,
          teacherId: user._id,
          students: classroomData.students || []
        };

        const response = await ApiService.addClassroom(createData);
        const newClassroom = normalizeClassroom(response.classroom);
        
        setClassrooms(prev => {
          const exists = prev.some(c => c.id === newClassroom.id);
          return exists ? prev : [...prev, newClassroom];
        });
        
        showMessage("Classroom created successfully!");
      }
      
      setShowEditModal(false);
      setSelectedClassroom(null);
    } catch (error) {
      console.error("Error saving classroom:", error);
      showMessage(handleApiError(error, "Failed to save classroom."));
    } finally {
      setSaving(false);
    }
  };

  const handleAddClassroom = () => {
    if (saving) return;
    setSelectedClassroom(null);
    setShowEditModal(true);
  };

  const handleEditClassroom = (classroom) => {
    if (saving) return;
    setSelectedClassroom(classroom);
    setShowEditModal(true);
  };

  const handleDeleteClassroom = async (id) => {
    if (saving) return;
    
    try {
      await ApiService.deleteClassroom(id);
      setClassrooms(prev => prev.filter(classroom => classroom.id !== id));
      showMessage("Classroom deleted successfully.");
    } catch (error) {
      console.error("Error deleting classroom:", error);
      showMessage(handleApiError(error, "Failed to delete classroom."));
    }
  };

  const handleEnterClassroom = (id, name) => {
    navigate(`/dashboard/${id}/${encodeURIComponent(name)}`);
  };

  const handleInviteStudent = (classroom) => {
    setClassroomToInvite(classroom);
    setShowInviteModal(true);
  };

  const handleSendInvitation = async (email) => {
    try {
      setShowInviteModal(false);
      showMessage(`Invitation email sent to: ${email}`);
      await fetchPhysicalClassrooms();
    } catch (error) {
      console.error("Error sending invitation:", error);
      showMessage("Failed to send invitation.");
    }
  };

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

      {/* Edit/Create Classroom Modal */}
      {showEditModal && (
        <EditClassroomModal
          classroom={selectedClassroom}
          onSave={handleSaveClassroom}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedClassroom(null);
          }}
        />
      )}

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