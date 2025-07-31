import React, { useState, useEffect } from "react";

const EditClassroomModal = ({ classroom, onSave, onCancel }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [classroomNumber, setClassroomNumber] = useState("");
  const [maxStudents, setMaxStudents] = useState(30);

  useEffect(() => {
    if (classroom) {
      console.log("Editing classroom:", classroom);
      setName(classroom.name || "");
      setDescription(classroom.description || "");
      setSchoolName(classroom.schoolName || "");
      setGradeLevel(classroom.gradeLevel || "");
      setClassroomNumber(classroom.classroomNumber || "");
      setMaxStudents(classroom.maxStudents || 30);
    } else {
      // Reset for new classroom
      setName("");
      setDescription("");
      setSchoolName("");
      setGradeLevel("");
      setClassroomNumber("");
      setMaxStudents(30);
    }
  }, [classroom]);

  const handleSave = () => {
    // Validate required fields
    if (!name.trim()) {
      alert("Classroom name is required");
      return;
    }

    const updatedClassroom = {
      ...classroom, // Maintain existing classroom data
      name: name.trim(),
      description: description.trim(),
      schoolName: schoolName.trim(),
      gradeLevel: gradeLevel,
      classroomNumber: classroomNumber.trim(),
      maxStudents: maxStudents,
    };

    console.log("Saving classroom:", updatedClassroom);
    onSave(updatedClassroom);
  };

  return (
    <div className="modal-overlay">
      <div className="edit-classroom-form">
        <h3>
          {classroom ? "Edit Physical Classroom" : "Add Physical Classroom"}
        </h3>

        <div className="form-group">
          <label>Classroom Name*</label>
          <input
            type="text"
            placeholder="Enter classroom name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>School Name*</label>
          <input
            type="text"
            placeholder="Enter school name"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Grade Level*</label>
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            required
          >
            <option value="">Select Grade Level</option>
            <option value="K">Kindergarten</option>
            <option value="1">1st Grade</option>
            <option value="2">2nd Grade</option>
            <option value="3">3rd Grade</option>
            <option value="4">4th Grade</option>
            <option value="5">5th Grade</option>
            <option value="6">6th Grade</option>
          </select>
        </div>

        <div className="form-group">
          <label>Classroom Number (Optional)</label>
          <input
            type="text"
            placeholder="e.g., Room 101"
            value={classroomNumber}
            onChange={(e) => setClassroomNumber(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Maximum Students</label>
          <input
            type="number"
            placeholder="30"
            value={maxStudents}
            onChange={(e) => setMaxStudents(parseInt(e.target.value) || 30)}
            min="1"
            max="100"
          />
        </div>

        <div className="form-group">
          <label>Description (Optional)</label>
          <textarea
            placeholder="Enter classroom description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
          />
        </div>

        {/* Student Management Information */}
        {classroom && classroom.students && (
          <div className="classroom-info">
            <h4>Current Students: {classroom.students.length}</h4>
            <p>
              <small>
                Use the invite button (📧) to add more students to this
                classroom.
              </small>
            </p>
          </div>
        )}

        <div className="form-actions">
          <button className="button-save" onClick={handleSave}>
            {classroom ? "Update Classroom" : "Create Classroom"}
          </button>
          <button className="button-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditClassroomModal;
