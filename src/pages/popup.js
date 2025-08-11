import React, { useState, useEffect } from "react";
import "../styles/popup.css";
import { getUserCourseProgress } from "../services/progressService";

const Popup = ({ isOpen, onClose, student, course }) => {
  const [toggle, setToggle] = useState("Lesson");
  const [selectedLesson, setSelectedLesson] = useState(1);
  const [progress, setProgress] = useState(0);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      if (course && student) {
        setLoading(true);
        try {
          const data = await getUserCourseProgress(course, student);
          console.log("Progress data:", data);
          
          if (data && data.completion_percentage !== undefined) {
            setProgress(data.completion_percentage);
            setProgressData(data);
            console.log("Progress", data.completion_percentage);
            console.log("Completed assignments", data.completed_assignments_list);
            console.log("Total assignments", data.available_assignments);
          } else {
            console.warn("No completion_percentage found in response:", data);
            setProgress(0);
            setProgressData(null);
          }
        } catch (error) {
          console.error("Error fetching progress:", error);
          setProgress(0);
          setProgressData(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProgress();
  }, [student, course]);

  if (!isOpen) return null;

  const handleToggleChange = (value) => {
    setToggle(value);
  };

  const handleLessonClick = (lessonNumber) => {
    setSelectedLesson(lessonNumber);
    setToggle("Lesson"); // Reset to lesson tab when switching lessons
  };


  // Helper function to get assignments for current tab
  const getAssignmentsForTab = () => {
    if (!progressData) return [];

    const { completed_assignments_list = [], available_assignments = {}, breakdown = {} } = progressData;
    
    // Create a map of completed assignments for quick lookup
    const completedMap = new Map();
    completed_assignments_list.forEach(assignment => {
      const key = `${assignment.assignment_type}_${assignment.assignment_number}`;
      completedMap.set(key, assignment);
    });

    // Get assignments based on current tab
    let assignments = [];
    const tabKey = toggle.toLowerCase();
    const lessonNumber = selectedLesson.toString();
    
    // if (tabKey === 'lesson') {
    //   assignments = available_assignments.lessons || [];
    // } else if (tabKey === 'worksheet') {
    //   assignments = available_assignments.worksheets || [];
    // } else if (tabKey === 'quiz') {
    //   assignments = available_assignments.quiz ? ['1'] : []; // Quiz is boolean, treat as single assignment
    // }
    let hasAssignment = false;
    if (tabKey === 'lesson') {
      hasAssignment = available_assignments.lessons?.includes(lessonNumber) || false;
    } else if (tabKey === 'worksheet') {
      hasAssignment = available_assignments.worksheets?.includes(lessonNumber) || false;
    } else if (tabKey === 'quiz') {
      // hasAssignment = available_assignments.quiz === false;
      hasAssignment = available_assignments.quizzes?.includes(lessonNumber) || false;
    }

    if (!hasAssignment) {
      return []; // No assignment of this type for this lesson
    }


    // // Map assignments with completion status
    // return assignments.map(assignmentNumber => {
    //   const key = `${tabKey}_${assignmentNumber}`;
    //   const isCompleted = completedMap.has(key);
    //   const completedData = completedMap.get(key) || null;
      
    //   return {
    //     id: key,
    //     name: `${toggle} ${assignmentNumber}`,
    //     number: assignmentNumber,
    //     type: tabKey,
    //     isCompleted,
    //     completedData
    //   };
    // });

    const key = `${tabKey}_${selectedLesson}`;
    const isCompleted = completedMap.has(key);
    const completedData = completedMap.get(key) || null;
    
    return [{
      id: key,
      name: `${toggle} ${selectedLesson}`,
      number: selectedLesson,
      type: tabKey,
      isCompleted,
      completedData
    }];
  };

  // Helper function to render assignment status
  const renderAssignmentStatus = (assignment) => {
    const statusClass = assignment.isCompleted ? 'completed' : 'incomplete';
    const statusText = assignment.isCompleted ? '✓ Completed' : '○ Incomplete';
    
    return (
      <div key={assignment.id} className={`assignment-item ${statusClass}`}>
        <div className="assignment-header">
          <h4>{assignment.name}</h4>
          <span className={`status-badge ${statusClass}`}>
            {statusText}
          </span>
        </div>
        
        <p className="assignment-description">
          {assignment.type === 'lesson' && 'Interactive lesson with multimedia content'}
          {assignment.type === 'worksheet' && 'Practice exercises and activities'}
          {assignment.type === 'quiz' && 'Assessment to test understanding'}
        </p>

        {assignment.type === 'lesson' && assignment.isCompleted && (
          <div className="student-responses">
            <h5>Student Responses to Big Picture Questions:</h5>
            <p className="note">Student response data from MongoDB would be displayed here</p>
          </div>
        )}
        
        {assignment.isCompleted && assignment.completedData && (
          <div className="completion-details">
            <p className="completion-date">
              Completed: {new Date(assignment.completedData.completed_at).toLocaleDateString()}
            </p>
            {assignment.completedData.score && (
              <p className="completion-score">Score: {assignment.completedData.score}%</p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Helper function to render tab content
  const renderTabContent = () => {
    if (loading) {
      return <div className="loading">Loading assignments...</div>;
    }

    if (!progressData) {
      return <div className="no-data">No progress data available</div>;
    }

    const tabAssignments = getAssignmentsForTab();
    const tabKey = toggle.toLowerCase();
    const breakdown = progressData.breakdown || {};
    const tabBreakdown = breakdown[tabKey] || {};
    
    if (tabAssignments.length === 0) {
      return (
        <div className="no-assignments">
          <p>No {toggle.toLowerCase()} assignments available for this course.</p>
        </div>
      );
    }

    const completedCount = tabBreakdown.completed || tabAssignments.filter(a => a.isCompleted).length;
    const totalCount = tabBreakdown.total || tabAssignments.length;

    return (
      <div className="assignments-container">
        <div className="assignments-summary">
          <h3>{toggle} Assignments</h3>
          <p className="summary-text">
            {completedCount} of {totalCount} assignments completed 
            ({Math.round((completedCount / totalCount) * 100)}%)
          </p>
        </div>
        
        <div className="assignments-list">
          {tabAssignments.map(renderAssignmentStatus)}
        </div>
      </div>
    );
  };

  const renderLessonBoxes = () => {
    if (!progressData || !progressData.available_assignments) return null;
    
    const lessons = progressData.available_assignments.lessons || [];
    
    return (
      <div className="lesson-boxes">
        {lessons.map(lessonNumber => (
          <div 
            key={lessonNumber}
            className={`lesson-box ${selectedLesson == lessonNumber ? 'selected' : ''}`}
            onClick={() => handleLessonClick(parseInt(lessonNumber))}
          >
            <h4>Lesson {lessonNumber}</h4>
            <div className="lesson-progress-indicator"></div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        
        <div className="popup-header">
          <h2>Student Progress</h2>
          <p className="overall-progress">Overall Progress: {progress}%</p>
          <div className="popup-progress-bar">
            <div className="popup-progress" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {renderLessonBoxes()}

        {/* Toggle Button */}
        <div className="toggle-container">
          <div className="toggle">
            <button
              className={toggle === "Lesson" ? "active" : ""}
              onClick={() => handleToggleChange("Lesson")}
            >
              Lesson
            </button>
            <button
              className={toggle === "Worksheet" ? "active" : ""}
              onClick={() => handleToggleChange("Worksheet")}
            >
              Worksheet
            </button>
            <button
              className={toggle === "Quiz" ? "active" : ""}
              onClick={() => handleToggleChange("Quiz")}
            >
              Quiz
            </button>
            <div className={`toggle-indicator ${toggle}`} />
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Popup;
