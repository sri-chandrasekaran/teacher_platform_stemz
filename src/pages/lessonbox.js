import React, { useState, useEffect } from "react";
import "../styles/popup.css";

const LessonBox = () => {
  // const [assignments, setAssignments] = useState([
  //   { id: 1, name: "Lesson 1", comments: [], isEditing: false },
  // ]);
  const [assignments, setAssignments] = useState("")
  const [currentComment, setCurrentComment] = useState("");

  const userEmail = "student@example.com"; 

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/worksheet/${userEmail}/Lesson1`);
        if (!res.ok) throw new Error("Failed to fetch progress");
        const data = await res.json();
        setAssignments([{ id: 1, name: "Lesson 1", comments: data.progress.comments || [], isEditing: false }]);
      } catch (err) {
        console.error(err.message);
        // If progress doesn't exist yet, initialize it
        setAssignments([{ id: 1, name: "Lesson 1", comments: [], isEditing: false }]);
      }
    };
    fetchProgress();
  }, []);


  const handleAddCommentClick = (id) => {
    setAssignments(assignments.map((assignment) =>
      assignment.id === id ? { ...assignment, isEditing: true } : assignment
    ));
  };

  const handleCommentChange = (e) => {
    setCurrentComment(e.target.value);
  };

  const handleCommentSubmit = async (id) => {
    if (currentComment.trim() === "") return;

    const updatedAssignments = assignments.map((assignment) =>
      assignment.id === id
        ? {
            ...assignment,
            comments: [...assignment.comments, currentComment],
            isEditing: false,
          }
        : assignment
    );

    setAssignments(updatedAssignments);

    const updatedAssignment = updatedAssignments.find(a => a.id === id);

    try {
      await fetch("http://localhost:4000/api/worksheet/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          worksheetId: updatedAssignment.name,
          progress: { comments: updatedAssignment.comments },
        }),
      });
    } catch (err) {
      console.error("Failed to update progress:", err.message);
    }

    setCurrentComment("");
  };


  const handleReset = async (id) => {
    const updatedAssignments = assignments.map((assignment) =>
      assignment.id === id ? { ...assignment, comments: [], isEditing: false } : assignment
    );

    setAssignments(updatedAssignments);

    const resetAssignment = updatedAssignments.find(a => a.id === id);

    try {
      await fetch("http://localhost:4000/api/worksheet/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          worksheetId: resetAssignment.name,
          progress: { comments: [] },
        }),
      });
    } catch (err) {
      console.error("Failed to reset progress:", err.message);
    }
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
