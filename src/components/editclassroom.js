import React, { useState, useEffect } from 'react';
import Select from 'react-select';

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
  const API_BASE_URL = 'https://core-server-nine.vercel.app/api';

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

  const handleSave = () => {
    const studentIds = selectedStudents?.map(option => option.value) || [];
    
    const saveData = {
      ...classroom,   // Maintain existing classroom data
      name,
      description,
      courses: selectedCourses.map(option => option.value),
      students: studentIds,
      teacher: selectedTeacher ? selectedTeacher.value : '',
    };
    
    onSave(saveData);
    console.log('Classroom data:', classroom);
    if (classroom){
      console.log('Updating classroom:', classroom.id);
      try {
        fetch(`${API_BASE_URL}/classrooms/${classroom.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            description,
            courses: selectedCourses.map(option => option.value),
            students: studentIds,
            teacher: selectedTeacher ? selectedTeacher.value : '',
          }),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to update classroom');
          }
          return response.json();
        })
        .then(data => {
          console.log('Classroom updated:', data);
        });
      }
      catch (error) {
        console.error('Error updating classroom:', error);
      }
    }
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
        <div className="courses-section">
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
        </div>
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
      <button className="button-save" onClick={handleSave}>Save Changes</button>
      <button className="button-cancel" onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default EditClassroomModal;
