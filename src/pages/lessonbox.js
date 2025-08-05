import React, { useState, useEffect } from "react";
import "../styles/popup.css";

const LessonBox = () => {
  const [assignments, setAssignments] = useState([]);
  const [currentComment, setCurrentComment] = useState("");

  const userEmail = "student@example.com"; 

  const conceptNameLookup = {
    A: "What is Astronomy?",
    B: "Solar System",
    C: "The Sun",
    D: "Nuclear Fusion",
    E: "Terrestrial Planets",
    F: "Gas Giant Planets",
    G: "Asteroid Belt",
    H: "Dwarf Planets",
    I: "Oort Cloud and Comets",
    J: "Earth (and how it compares to others)",
    K: "Stars",
    L: "Moon",
    M: "Space Exploration and Astronauts",
    N: "Constellation and the Night Sky",
    O: "Black Holes and Other Celestial Objects",
    P: "Gravity",
    Q: "Technological Advancements",
    R: "What is a Galaxy?",
    S: "The Milky Way",
    T: "Nuclear Fusion (duplicate)",
    U: "Dark Matter and Dark Energy",
    V: "Space Race",
    W: "The Universe",
    X: "The Big Bang Theory"
  };
  
  const [showHelpUI, setShowHelpUI] = useState(false);
  const [conceptInput, setConceptInput] = useState("");
  const [selectedConcepts, setSelectedConcepts] = useState([]);
  const [filteredConcepts, setFilteredConcepts] = useState(Object.entries(conceptNameLookup));
  const [generatedHelp, setGeneratedHelp] = useState([]);
  const [activeBox, setActiveBox] = useState(null);


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
      await fetch("https://core-server-nine.vercel.app/api/worksheet/update", {
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
          <button
            className="add-comment-button"
            onClick={() => {
              setActiveBox(activeBox === "comment" ? null : "comment");
              setAssignments(assignments.map(a => ({
                ...a,
                isEditing: a.id === assignment.id // only this assignment is editing
              })));
              setSelectedConcepts([]);
              setConceptInput("");
              setFilteredConcepts(Object.entries(conceptNameLookup));
              setGeneratedHelp([]);
            }}
          >
            Add Comment
          </button>

          <button
            className="generate-help-button"
            onClick={() => {
              if (activeBox === "help") {
                setSelectedConcepts([]);
                setConceptInput("");
                setFilteredConcepts(Object.entries(conceptNameLookup));
                setGeneratedHelp([]);
                setActiveBox(null);
              } else {
                setActiveBox("help");
                setAssignments(assignments.map(a => ({ ...a, isEditing: false })));
                setCurrentComment("");
              }
            }}
          >
            {activeBox === "help" ? "Cancel Help" : "Generate Help"}
          </button>

          <button
            className="reset-button-box"
            onClick={() => handleReset(assignment.id)}
          >
            Reset
          </button>
        </div>

        {activeBox === "comment" && assignment.isEditing && (
          <div className="comment-ui-box">
            <h4>Add Comment</h4>
            <textarea
              className="comment-textarea"
              value={currentComment}
              onChange={handleCommentChange}
              placeholder="Write your comment for the student here..."
            />
            <div className="comment-button-group">
              <button
                className="submit-button"
                onClick={() => handleCommentSubmit(assignment.id)}
              >
                Submit
              </button>
              <button
                className="cancel-button"
                onClick={() => {
                  setAssignments(assignments.map(a =>
                    a.id === assignment.id ? { ...a, isEditing: false } : a
                  ));
                  setCurrentComment("");
                  setActiveBox(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

          {activeBox === "help" && (
  <div className="help-ui-box">
    <h4>Generate Help for Student</h4>

    {/* Selected Concepts as Chips */}
    <div className="selected-concepts">
      {selectedConcepts.map((tag) => (
        <span key={tag} className="concept-chip">
          {conceptNameLookup[tag]}
          <button
            onClick={() =>
              setSelectedConcepts((prev) => prev.filter((t) => t !== tag))
            }
          >
            ✕
          </button>
        </span>
      ))}
    </div>

    {/* Type-to-Search Input */}
    <input
      type="text"
      placeholder="Type to add a concept..."
      value={conceptInput}
      onChange={(e) => {
        const val = e.target.value;
        setConceptInput(val);
        const filtered = Object.entries(conceptNameLookup).filter(
          ([tag, name]) =>
            name.toLowerCase().includes(val.toLowerCase()) ||
            tag.toLowerCase() === val.toLowerCase()
        );
        setFilteredConcepts(filtered);
      }}
    />

    {/* Search Results */}
    {conceptInput && (
      <ul className="concept-suggestions">
        {filteredConcepts.slice(0, 5).map(([tag, name]) => (
          <li
            key={tag}
            onClick={() => {
              if (!selectedConcepts.includes(tag)) {
                setSelectedConcepts((prev) => [...prev, tag]);
              }
              setConceptInput("");
              setFilteredConcepts(Object.entries(conceptNameLookup));
            }}
          >
            {name}
          </li>
        ))}
      </ul>
    )}

    {/* Generate Button */}
    <button
      onClick={async () => {
        const res = await fetch("http://localhost:4000/api/genai", { // replace with the real endpoint
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: userEmail,
            questionText: "What do you think stars are made of?", // make this dynamic with all the questions
            tags: selectedConcepts,
            gradeBand: "K-2",
            outputType: "explanation"
          }),
        });
        const data = await res.json();
        setGeneratedHelp(data);
      }}
    >
      Generate Help
    </button>

    {/* Display Results */}
    {generatedHelp.length > 0 && (
      <div className="ai-help-output">
        <h5>Generated Help:</h5>
        {generatedHelp.map((item, index) => (
          <div key={index} className="ai-help-box">
            <strong>{item.concept}:</strong> {item.response}
          </div>
        ))}
      </div>
    )}
  </div>
)}

  
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
