import React, { useState, useEffect } from "react";
import Select from 'react-select';
import apiClient from '../services/apiClient';
import physicalClassroomService from '../services/physicalClassroomService';

const EditClassroomModal = ({ classroom, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [schoolName, setSchoolName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [classroomNumber, setClassroomNumber] = useState('');
  const [maxStudents, setMaxStudents] = useState(50);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [studentToEnroll, setStudentToEnroll] = useState(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const classroomId = classroom?.id || classroom?._id;

  useEffect(() => {
    if (classroom) {
      console.log('Editing classroom:', classroom);
      setName(classroom.name || '');
      setDescription(classroom.description || '');
      setSchoolName(classroom.schoolName || '');
      setGradeLevel(classroom.gradeLevel || '');
      setClassroomNumber(classroom.classroomNumber || '');
      setMaxStudents(classroom.maxStudents ?? 50);
    }

    const fetchCoursesAndStudents = async () => {
      try {
        const fetchedCourses = await apiClient.fetchCourses();
        const fetchedUsers = await apiClient.fetchUsers();

        const studentOptionsMap = fetchedUsers
          .filter(user => user.role === "student")
          .map(user => ({
            value: user._id,
            label: user.name || user.email || user._id,
          }));

        setStudentOptions(studentOptionsMap);
      } catch (error) {
        console.error('Error fetching courses or students:', error);
      }
    };

    fetchCoursesAndStudents();
  }, [classroom]);

  useEffect(() => {
    if (!classroomId) return;

    const fetchEnrolled = async () => {
      setStudentsLoading(true);
      setEnrollError('');
      try {
        const res = await physicalClassroomService.getClassroomStudents(classroomId);
        const list = Array.isArray(res) ? res : (res?.students || []);
        setEnrolledStudents(list.map(s => ({
          id: s._id || s.id,
          _id: s._id || s.id,
          name: s.name || s.email || s._id || 'Student',
          email: s.email || '',
        })));
      } catch (err) {
        console.error('Error fetching classroom students:', err);
        setEnrollError('Failed to load students');
        setEnrolledStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchEnrolled();
  }, [classroomId]);

  const handleEnroll = async () => {
    if (!studentToEnroll || !classroomId) return;
    setActionLoading(true);
    setEnrollError('');
    try {
      await physicalClassroomService.addStudent(classroomId, studentToEnroll.value);
      setEnrolledStudents(prev => [...prev, {
        id: studentToEnroll.value,
        _id: studentToEnroll.value,
        name: studentToEnroll.label,
        email: '',
      }]);
      setStudentToEnroll(null);
    } catch (err) {
      setEnrollError(err.message || 'Failed to enroll student');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnenroll = async (studentId) => {
    if (!classroomId) return;
    setActionLoading(true);
    setEnrollError('');
    try {
      await physicalClassroomService.removeStudent(classroomId, studentId);
      setEnrolledStudents(prev => prev.filter(s => (s.id || s._id) !== studentId));
    } catch (err) {
      setEnrollError(err.message || 'Failed to unenroll student');
    } finally {
      setActionLoading(false);
    }
  };

  const enrollDropdownOptions = studentOptions.filter(
    opt => !enrolledStudents.some(s => (s.id || s._id) === opt.value)
  );

  const handleSave = async () => {
    const studentIds = selectedStudents.map(s => s.value);
    
    console.log('Classroom data:', classroom);
    if (classroom){
      const id = classroom.id || classroom._id;
      console.log('Updating classroom:', id);
      try {
        let response = await apiClient.updateClassroom(id, {
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
      ...classroom,
      name: name.trim(),
      description: description.trim(),
      schoolName: schoolName.trim(),
      students: enrolledStudents.length ? enrolledStudents : studentIds,
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

        {/* Students: Enroll / Unenroll */}
        {classroom && (
          <div className="form-group students-enroll-section">
            <label>Students</label>
            {enrollError && (
              <div className="enroll-error" style={{ color: '#c00', marginBottom: 8 }}>{enrollError}</div>
            )}
            {studentsLoading ? (
              <p className="students-loading">Loading students...</p>
            ) : (
              <>
                <div className="enrolled-list" style={{ marginBottom: 12 }}>
                  <strong>Enrolled ({enrolledStudents.length})</strong>
                  {enrolledStudents.length === 0 ? (
                    <p style={{ margin: '8px 0', color: '#666' }}>No students enrolled yet.</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0' }}>
                      {enrolledStudents.map((s) => (
                        <li
                          key={s.id || s._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 0',
                            borderBottom: '1px solid #eee',
                          }}
                        >
                          <span>{s.name}{s.email ? ` (${s.email})` : ''}</span>
                          <button
                            type="button"
                            className="button-cancel"
                            onClick={() => handleUnenroll(s.id || s._id)}
                            disabled={actionLoading}
                            style={{ marginLeft: 8, padding: '4px 10px', fontSize: 12 }}
                          >
                            Unenroll
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="enroll-dropdown" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 200, flex: 1 }}>
                    <Select
                      placeholder="Select student to enroll..."
                      options={enrollDropdownOptions}
                      value={studentToEnroll}
                      onChange={setStudentToEnroll}
                      isClearable
                      isDisabled={actionLoading || enrollDropdownOptions.length === 0}
                    />
                  </div>
                  <button
                    type="button"
                    className="button-save"
                    onClick={handleEnroll}
                    disabled={!studentToEnroll || actionLoading}
                    style={{ padding: '8px 16px' }}
                  >
                    {actionLoading ? '...' : 'Enroll'}
                  </button>
                </div>
                {enrollDropdownOptions.length === 0 && studentOptions.length > 0 && (
                  <p style={{ margin: '4px 0', fontSize: 12, color: '#666' }}>All available students are already enrolled.</p>
                )}
              </>
            )}
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
