// Helper functions to normalize data between frontend and backend

// Convert backend _id to frontend id format
export const normalizeId = (obj) => {
    if (!obj) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => normalizeId(item));
    }
    
    if (typeof obj === 'object' && obj._id) {
      const { _id, ...rest } = obj;
      return { id: _id, ...rest };
    }
    
    return obj;
  };
  
  // Convert frontend id to backend _id format  
  export const denormalizeId = (obj) => {
    if (!obj) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => denormalizeId(item));
    }
    
    if (typeof obj === 'object' && obj.id) {
      const { id, ...rest } = obj;
      return { _id: id, ...rest };
    }
    
    return obj;
  };
  
  // Normalize physical classroom data for frontend
  export const normalizeClassroom = (classroom) => {
    if (!classroom) return null;
    
    return {
      id: classroom._id,
      name: classroom.name,
      description: classroom.description || 'No description provided',
      teacherId: classroom.teacherId?._id || classroom.teacherId,
      teacherName: classroom.teacherId?.name || '',
      // FIXED: Changed from studentIds to students
      students: Array.isArray(classroom.students) 
        ? classroom.students.map(student => ({
            id: student._id || student,
            name: student.name || '',
            email: student.email || ''
          }))
        : [],
      schoolName: classroom.schoolName || '',
      gradeLevel: classroom.gradeLevel || '',
      classroomNumber: classroom.classroomNumber || '',
      maxStudents: classroom.maxStudents || 30,
      // FIXED: Changed from studentIds?.length to students?.length
      studentCount: classroom.students?.length || 0,
      isActive: classroom.isActive !== undefined ? classroom.isActive : true,
      createdAt: classroom.createdAt,
      updatedAt: classroom.updatedAt,
      academicYear: classroom.academicYear || ''
    };
  };
  
  // Normalize assignment data
  export const normalizeAssignment = (assignment) => {
    if (!assignment) return null;
    
    return {
      id: assignment._id,
      title: assignment.title,
      description: assignment.description,
      course: assignment.course,
      lesson: assignment.lesson,
      activityType: assignment.activityType,
      activityTitle: assignment.activityTitle,
      dueDate: assignment.dueDate,
      directLink: assignment.directLink,
      priority: assignment.priority,
      physicalClassroomId: assignment.physicalClassroomId?._id || assignment.physicalClassroomId,
      physicalClassroomName: assignment.physicalClassroomId?.name || '',
      teacherId: assignment.teacherId?._id || assignment.teacherId,
      teacherName: assignment.teacherId?.name || '',
      isActive: assignment.isActive,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt
    };
  };
  
  // Generate fake leaderboard data from students (for now)
  export const generateFakeLeaderboard = (students) => {
    if (!Array.isArray(students)) return [];
    
    return students.map(student => ({
      student_id: student.id || student._id,
      student_name: student.name,
      last_logged_on: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      cummulative_score: Math.floor(Math.random() * 100) + 50 // Random score 50-150
    }));
  };
  
  // Generate recent activity from assignments
  export const generateRecentActivity = (assignments, students) => {
    if (!Array.isArray(assignments) || !Array.isArray(students)) {
      // Fallback fake data
      return [
        { name: 'Student 5', course: 'Basics of Coding', assignment: 'Lesson 1 Slideshow', timeSignedIn: '10 mins' },
        { name: 'Student 9', course: 'Zoology', assignment: 'Lesson 3 Worksheet', timeSignedIn: '20 mins' },
        { name: 'Student 16', course: 'Astronomy', assignment: 'Lesson 4 Quiz', timeSignedIn: '15 mins' },
        { name: 'Student 2', course: 'Chemistry', assignment: 'Lesson 3 Slideshow', timeSignedIn: '5 mins' },
      ];
    }
    
    // Generate activity from recent assignments
    return assignments.slice(0, 4).map((assignment, index) => {
      const randomStudent = students[Math.floor(Math.random() * students.length)];
      return {
        name: randomStudent?.name || `Student ${index + 1}`,
        course: assignment.course || 'Unknown Course',
        assignment: assignment.activityTitle || assignment.title,
        timeSignedIn: `${Math.floor(Math.random() * 30) + 5} mins`
      };
    });
  };
  
  // Error handler for API calls
  export const handleApiError = (error, fallbackMessage = 'An error occurred') => {
    console.error('API Error:', error);
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return fallbackMessage;
  };