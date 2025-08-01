const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
// const BASE_URL = 'http://localhost:3000/api'; // Default to local API for development

class ApiService {
    // User-related API calls
    // Fetch all users
    static async fetchUsers() {
        const response = await fetch(`${BASE_URL}/users`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
        });
        
        if (!response.ok) {
        throw new Error('Failed to fetch users');
        }
        
        return response.json();
    }

    // Course-related API calls
    // Fetch all courses
    static async fetchCourses() {
        const response = await fetch(`${BASE_URL}/courses`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
        });

        if (!response.ok) {
        throw new Error('Failed to fetch courses');
        }

        return response.json();
    }

    // Fetch a course by ID
    static async fetchCourseById(courseId) {
        const response = await fetch(`${BASE_URL}/courses/${courseId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
        });

        if (!response.ok) {
        throw new Error('Failed to fetch course');
        }

        return response.json();
    }

    // Add a new course
    static async addCourse(courseData) {
        const response = await fetch(`${BASE_URL}/courses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
        });

        if (!response.ok) {
        throw new Error('Failed to add course');
        }

        return response.json();
    }

    // Update an existing course
    static async updateCourse(courseId, courseData) {
        const response = await fetch(`${BASE_URL}/courses/${courseId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
        });

        if (!response.ok) {
            throw new Error('Failed to update course');
        }

        return response.json();
    }

    // Delete a course
    static async deleteCourse(courseId) {
        const response = await fetch(`${BASE_URL}/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
        });

        if (!response.ok) {
        throw new Error('Failed to delete course');
        }

        return response.json();
    }

    // Classroom-related API calls
    // Fetch all classrooms
    static async fetchClassrooms() {
        const response = await fetch(`${BASE_URL}/classrooms`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
        });

        if (!response.ok) {
        throw new Error('Failed to fetch classrooms');
        }

        return response.json();
    }

    // Fetch a clssroom by ID
    static async fetchClassroomById(classroomId) {
        const response = await fetch(`${BASE_URL}/classrooms/${classroomId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
        });

        if (!response.ok) {
        throw new Error('Failed to fetch classroom');
        }

        return response.json();
    }

    // Add a new classroom
    static async addClassroom(classroomData) {
        const response = await fetch(`${BASE_URL}/classrooms`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(classroomData),
        });

        if (!response.ok) {
        throw new Error('Failed to add classroom');
        }

        return response.json();
    }

    // Update an existing classroom
    static async updateClassroom(classroomId, classroomData) {
        const response = await fetch(`${BASE_URL}/classrooms/${classroomId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(classroomData),
        });

        if (!response.ok) {
        throw new Error('Failed to update classroom');
        }

        return response.json();
    }

    // Delete a classroom
    static async deleteClassroom(classroomId) {
        const response = await fetch(`${BASE_URL}/classrooms/${classroomId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
        });

        if (!response.ok) {
        throw new Error('Failed to delete classroom');
        }

        return response.json();
    }

    // Fetch students in a classroom
    static async fetchStudentsInClassroom(classroomId) {
        const response = await fetch(`${BASE_URL}/classrooms/${classroomId}/students`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
        });

        if (!response.ok) {
        throw new Error('Failed to fetch students in classroom');
        }

        return response.json();
    }

    // Enroll a student in a classroom
    static async enrollStudent(classroomId, userId) {
        const response = await fetch(`${BASE_URL}/classrooms/${classroomId}/enroll`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId }),
        });

        if (!response.ok) {
        throw new Error('Failed to enroll student');
        }

        return response.json();
    }

    // Fetch grades for a classroom
    static async fetchGrades(classroomId) {
        const response = await fetch(`${BASE_URL}/grade/classroom/${classroomId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch grades');
        }

        return response.json();
    }

    // Fetch worksheets for a classroom
    static async fetchWorksheets(classroomId) {
        const response = await fetch(`${BASE_URL}/worksheets/classroom/${classroomId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch worksheets');
        }

        return response.json();
    }

    // Send email notification
    static async sendEmailNotification(recipient, subject, message) {
        const response = await fetch(`${BASE_URL}/notifications/email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipient, subject, message }),
        });

        if (!response.ok) {
        throw new Error('Failed to send email notification');
        }

        return response.json();
    }

    static async fetchNotifications() {
        const response = await fetch(`${BASE_URL}/notifs`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch notifications');
        }

        return response.json();
    }
}

export default ApiService;