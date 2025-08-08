import React, { useState, useEffect } from "react";
import Select from 'react-select';
import ApiService from '../apiService';

const EditClassroomModal = ({ classroom, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [courseOptions, setCourseOptions] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [schoolName, setSchoolName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [classroomNumber, setClassroomNumber] = useState('');
  const [maxStudents, setMaxStudents] = useState(30);
  const [studentIds, setStudentIds] = useState([]);
  const [saveData, setSaveData] = useState({});

  const API_BASE_URL = 'https://core-server-nine.vercel.app/api';
  // const API_BASE_URL = 'https://localhost:3000/api';

  const checkCourse = (course) => {
    console.log('Checking course:', course);
    console.log('Current classroom:', classroom);
    console.log('Selected courses:', selectedCourses);
    if (!classroom) return true;
    return !selectedCourses.some(selected => selected.value === course._id);
  }

  const checkStudent = (student) => {
    if (!classroom) return true;
    return !classroom.users.students.includes(student._id) && student._id !== selectedTeacher?._id;
  }
  const checkTeacher = (teacher) => {
    if (!classroom) return true;
    return !classroom.users.teacher.id === teacher._id;
  }

  useEffect(() => {
    if (classroom) {
      console.log('Editing classroom:', classroom);
      setName(classroom.name || '');
      setDescription(classroom.description || '');
    }

    const fetchCoursesAndStudents = async () => {
      try {
        const responseCourses = await fetch(`${API_BASE_URL}/course`);
        const responseUsers = await fetch(`${API_BASE_URL}/users`);
        const fetchedCourses = await responseCourses.json();
        const fetchedUsers = await responseUsers.json();

        // Transform data for react-select
        const courseOptionsMap = fetchedCourses
          .map(course => ({
            value: course._id,
            label: course.name,
          }));

        const studentOptionsMap = fetchedUsers
          .filter(user => user.role === "student")
          .map(user => ({
            value: user._id,
            label: user.name,
          }));

        const teacherOptionsMap = fetchedUsers
          .filter(user => user.role === "teacher")
          .map(user => ({
            value: user._id,
            label: user.name,
          }));

        // Set options for react-select
        setCourseOptions(courseOptionsMap);
        setStudentOptions(studentOptionsMap);
        setTeacherOptions(teacherOptionsMap);
      } catch (error) {
        console.error('Error fetching courses or students:', error);
      }
    };
    
    fetchCoursesAndStudents();
  }, [classroom]);

  const handleSave = async () => {
    const studentIds = selectedStudents.map(s => s.value);

    const savePayload = {
      ...classroom,
      name: name.trim(),
      description: description.trim(),
      courses: selectedCourses.map(option => option.value),
      students: studentIds,           // <-- pass IDs here
      teacher: selectedTeacher ? selectedTeacher.value : '',
      schoolName: schoolName.trim(),
      gradeLevel,
      classroomNumber: classroomNumber.trim(),
      maxStudents,
    };

    console.log('Saving classroom data:', savePayload);
  
    onSave(savePayload);
    
    console.log('Classroom data:', classroom);
    if (classroom){
      console.log('Updating classroom:', classroom.id);
      try {
        let response = await ApiService.updateClassroom(classroom.id, {
          name,
          description
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
