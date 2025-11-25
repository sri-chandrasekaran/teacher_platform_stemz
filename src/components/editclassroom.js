import React, { useState, useEffect } from "react";
import Select from 'react-select';
import apiClient from '../services/apiClient';

const EditClassroomModal = ({ classroom, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [schoolName, setSchoolName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [classroomNumber, setClassroomNumber] = useState('');
  const [maxStudents, setMaxStudents] = useState(50);

  useEffect(() => {
    if (classroom) {
      console.log('Editing classroom:', classroom);
      setName(classroom.name || '');
      setDescription(classroom.description || '');
    }

    const fetchCoursesAndStudents = async () => {
      try {
        const fetchedCourses = await apiClient.fetchCourses();
        const fetchedUsers = await apiClient.fetchUsers();

        // Transform data for react-select
        const studentOptionsMap = fetchedUsers
          .filter(user => user.role === "student")
          .map(user => ({
            value: user._id,
            label: user.name,
          }));

        // Set options for react-select
        setStudentOptions(studentOptionsMap);
      } catch (error) {
        console.error('Error fetching courses or students:', error);
      }
    };
    
    fetchCoursesAndStudents();
  }, [classroom]);

  const handleSave = async () => {
    const studentIds = selectedStudents.map(s => s.value);
    
    console.log('Classroom data:', classroom);
    if (classroom){
      console.log('Updating classroom:', classroom.id);
      try {
        let response = await apiClient.updateClassroom(classroom.id, {
          name,
          description,
          students: studentIds
      });
        console.log('Classroom updated:', response);
      } catch (error) {
        console.error('Error updating classroom:', error);
      }
    }
    
    const updatedClassroom = {
      ...classroom, // Maintain existing classroom data
      name: name.trim(),
      description: description.trim(),
      schoolName: schoolName.trim(),
      students: studentIds,
      gradeLevel: gradeLevel,
      classroomNumber: classroomNumber.trim(),
      maxStudents: maxStudents,
    };

    console.log("Saving classroom:", updatedClassroom);
    onSave(updatedClassroom);
  };

  if (!classroom) {
    return (
      <div className="edit-classroom-form">
        <h3>{classroom ? 'Edit Classroom' : 'Add Classroom'}</h3>
        <input
          type="text"
          placeholder="Classroom Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          placeholder="Classroom Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {/* <div className="courses-section">
          <h4>Courses</h4>
          <Select
            isMulti
            closeMenuOnSelect={false}
            options={courseOptions}
            value={selectedCourses}
            onChange={setSelectedCourses}
            placeholder="Select courses..."
          />
        </div>
        <div className="students-section">
          <h4>Teacher</h4>
          <Select
            options={teacherOptions}
            value={selectedTeacher}
            onChange={setSelectedTeacher}
            placeholder="Select a teacher..."
            isClearable
          />
        </div> */}
        <div className="teacher-section">
          <h4>Students</h4>
          <Select
            isMulti
            closeMenuOnSelect={false}
            options={studentOptions}
            value={selectedStudents}
            onChange={setSelectedStudents}
            placeholder="Select students..."
          />
        </div>
        <button className="button-save" onClick={handleSave}>Save Changes</button>
        <button className="button-cancel" onClick={onCancel}>Cancel</button>
      </div>
    );
  }
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
            placeholder="50"
            value={maxStudents}
            onChange={(e) => setMaxStudents(parseInt(e.target.value) || 50)}
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
