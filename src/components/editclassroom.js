import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import ApiService from '../apiService';
import { response } from 'express';

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

    try {
      const fetchCoursesAndStudents = async () => {
        const fetchedCourses = await ApiService.fetchCourses();
        const fetchedStudents = await ApiService.fetchUsers();

        // console.log('Fetched courses:', fetchedCourses);
        // console.log('Fetched students:', fetchedStudents);

        // Transform data for react-select
        const courseOptionsMap = fetchedCourses
          // .filter(checkCourse)
          .map(course => ({
            value: course._id,
            label: course.name,
          }));

        const studentOptionsMap = fetchedStudents
          // .filter(checkStudent)
          .map(student => ({
            value: student._id,
            label: student.name,
          }));

        const teacherOptionsMap = fetchedStudents
          // .filter(checkTeacher)
          .map(student => ({
            value: student._id,
            label: student.name,
          }));

        // console.log('Course options map:', courseOptionsMap);
        // console.log('Student options map:', studentOptionsMap);
        // console.log('Teacher options map:', teacherOptionsMap);
        // Set options for react-select
        setCourseOptions(courseOptionsMap);
        setStudentOptions(studentOptionsMap);
        setTeacherOptions(teacherOptionsMap);
        // console.log('Course options:', courseOptions);
        // console.log('Student options:', studentOptions);
        // console.log('Teacher options:', teacherOptions);
      };
      // Fetch existing data if editing a classroom
      // if (classroom) {
      //   fetchExistingData();
      // }
      fetchCoursesAndStudents();



    } catch (error) {
      console.error('Error fetching courses or students:', error);
    }
  }, [classroom]);

  const handleSave = () => {
    onSave({
      ...classroom,
      name,
      description,
      courses: selectedCourses.map(option => option.value),
      students: selectedStudents.map(option => option.value),
      teacher: selectedTeacher ? selectedTeacher.value : '',
    });
    console.log('Classroom saved:', {
      name,
      description,
      courses: selectedCourses.map(option => option.value),
      students: selectedStudents.map(option => option.value),
      teacher: selectedTeacher ? selectedTeacher.value : '',
    });
    console.log('Classroom data:', classroom);
    if (classroom){
      console.log('Updating classroom:', classroom.id);
      try {
        response = ApiService.updateClassroom(classroom.id, {
          name,
          description
      });
        console.log('Classroom updated:', response);
      } catch (error) {
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
    <div className="edit-classroom-form">
      <h3>Edit Classroom</h3>
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
