import React, { useState } from "react";
import "../styles/popup.css";

const LessonBox = () => {
  const [assignments, setAssignments] = useState([
    { id: 1, name: "Lesson 1", comments: [], isEditing: false },
  ]);
  const [currentComment, setCurrentComment] = useState("");

  const handleAddCommentClick = (id) => {
    setAssignments(assignments.map((assignment) =>
      assignment.id === id ? { ...assignment, isEditing: true } : assignment
    ));
  };

  const handleCommentChange = (e) => {
    setCurrentComment(e.target.value);
  };

  const handleCommentSubmit = (id) => {
    if (currentComment.trim() === "") return;

    setAssignments(assignments.map((assignment) =>
      assignment.id === id
        ? { 
            ...assignment, 
            comments: [...assignment.comments, currentComment], 
            isEditing: false 
          }
        : assignment
    ));
    setCurrentComment(""); // Clear input
  };

  const handleReset = (id) => {
    setAssignments(assignments.map((assignment) =>
      assignment.id === id ? { ...assignment, comments: [], isEditing: false } : assignment
    ));
  };

  return (
    <div className="assignments-container">
      {assignments.map((assignment) => (
        <div className="assign-box" key={assignment.id}>
          {/* <h3>{assignment.name}</h3> */}
  
          <div className="button-container-box">
            {/* if reset button is clicked make a popup that says "are you sure you want to reset {assignment_name} progress" */}
            <button
              className="reset-button-box"
              onClick={() => handleReset(assignment.id)}
            >
              Reset
            </button> 
  
            {/* Commenting Section */}
            {!assignment.isEditing ? (
              <button
                className="add-comment-button"
                onClick={() => handleAddCommentClick(assignment.id)}
              >
                Add Comment
              </button>
            ) : (
              <div className="comment-editing">
                <textarea
                  value={currentComment}
                  onChange={handleCommentChange}
                  placeholder="Type your comment"
                />
                <button
                  className="submit-button"
                  onClick={() => handleCommentSubmit(assignment.id)}
                >
                  ✓
                </button>
              </div>
            )}
          </div>
  
          {/* Display all comments */}
          {assignment.comments.length > 0 && (
            <div className="comments-list">
              {assignment.comments.map((comment, index) => (
                <div key={index} className="comment-box">
                  {comment}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
export default LessonBox;
