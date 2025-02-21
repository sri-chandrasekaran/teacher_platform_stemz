import React, { useState } from "react";
import LessonBox from "./lessonbox";
import "../styles/popup.css";

const Popup = ({ isOpen, onClose, assignment }) => {
  const [toggle, setToggle] = useState("Slideshow");

  if (!isOpen) return null;

  const handleToggleChange = (value) => {
    setToggle(value);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <p>Progress: {assignment.progress}%</p>
        <div className="popup-progress-bar">
          <div className="popup-progress" style={{ width: `${assignment.progress}%` }}></div>
        </div>

        {/* Toggle Button */}
        <div className="toggle-container">
          <div className="toggle">
            <button
              className={toggle === "Slideshow" ? "active" : ""}
              onClick={() => handleToggleChange("Slideshow")}
            >
              Slideshow
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

        <LessonBox />
      </div>
    </div>
  );
};

export default Popup;
