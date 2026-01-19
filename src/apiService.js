const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
// const BASE_URL = 'http://localhost:3000/api'; // Default to local API for development

class ApiService {

    static async request(endpoint, method = 'GET', body = null, requiresAuth = true) {
        const url = `${BASE_URL}/${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
        };

        if (requiresAuth) {
            const token = localStorage.getItem('token');
            console.log('Using token for API request:', token);
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        console.log('Making API request to:', url, 'with method:', method, 'and body:', body);
        const response = await fetch(url, {
            method: method,
            headers,
            body: body ? JSON.stringify(body) : null,
        });

        if (!response.ok) {
            console.log('API request failed with response:', await response.json());
            throw new Error(`API request failed with status ${response.status}`);
        }
        console.log('API response received:', response);
        return response.json();
    }
    
    // User-related API calls
    // Fetch all users
    static async fetchUsers() {
        return this.request('users');
    }

    static async updateUser(userId, userData) {
        console.log('Updating user with ID:', userId, 'Data:', userData);
        return this.request(`users/id/${userId}`, 'PUT', userData);
    }

    // 2FA-related API calls
    static async get2FAQrCode(userId) {
        console.log('Fetching 2FA QR Code for user ID:', userId);
        const body = { userId };
        return this.request(`auth/2fa/setup`, 'POST', body, true);
    }

    static async verify2FA(userId, token) {
        console.log('Verifying 2FA for user ID:', userId);
        return this.request('auth/2fa/verify', 'POST', { userId, token }, true);
    }

    // Course-related API calls
    // Fetch all courses
    static async fetchCourses() {
        return this.request('courses');
    }

    // Fetch a course by ID
    static async fetchCourseById(courseId) {
        return this.request(`courses/${courseId}`);
    }

    // Add a new course
    static async addCourse(courseData) {
        return this.request('courses', 'POST', courseData);
    }

    // Update an existing course
    static async updateCourse(courseId, courseData) {
        return this.request(`courses/${courseId}`, 'PUT', courseData);
    }

    // Delete a course
    static async deleteCourse(courseId) {
        return this.request(`courses/${courseId}`, 'DELETE');
    }

    // Classroom-related API calls
    // Fetch all classrooms
    static async fetchClassrooms() {
        console.log('Fetching classrooms from API at:', process.env.REACT_APP_API_URL);
        return this.request('physical-classrooms');
    }

    static async fetchMyClassrooms(userId) {
        console.log('Fetching my classrooms for user:', userId);
        return this.request(`physical-classrooms/my-classrooms/${userId}`);
    }

    // Fetch a clssroom by ID
    static async fetchClassroomById(classroomId) {
        return this.request(`physical-classrooms/${classroomId}`);
    }

    // Add a new classroom
    static async addClassroom(classroomData) {
        return this.request('physical-classrooms', 'POST', classroomData);
    }

    // Update an existing classroom
    static async updateClassroom(classroomId, classroomData) {
        return this.request(`physical-classrooms/${classroomId}`, 'PUT', classroomData);
    }

    // Delete a classroom
    static async deleteClassroom(classroomId) {
        return this.request(`physical-classrooms/${classroomId}`, 'DELETE');
    }

    // Fetch students in a classroom
    static async fetchStudentsInClassroom(classroomId) {
        return this.request(`physical-classrooms/${classroomId}/students`);
    }

    static async enrollStudent(classroomId, userId) {
        console.log('API Call - ClassroomId:', classroomId, 'UserId:', userId, 'Type:', typeof userId);
        const requestBody = { 
            studentId: userId
        };
        console.log('Request body:', requestBody);
        return this.request(`physical-classrooms/${classroomId}/add-student`, 'POST', requestBody);
    }

    static async removeStudent(classroomId, userId) {
        const requestBody = { 
            studentId: userId
        };
        console.log('Removing student with body:', requestBody);
        return this.request(`physical-classrooms/${classroomId}/remove-student`, 'POST', requestBody);
    }

    // Fetch grades for a classroom
    static async fetchGrades(classroomId) {
        return this.request(`grade/classroom/${classroomId}`);
    }

    // Fetch worksheets for a classroom
    static async fetchWorksheets(classroomId) {
        return this.request(`worksheets/classroom/${classroomId}`);
    }
    
static async getStudentActivity(studentId) {
    if (!studentId) {
        console.warn('No studentId provided');
        return null;
    }

    return this.request(`studentresponses/student/${studentId}`, 'GET', null, true);
    
    // try {
    //     const response = await fetch(`${BASE_URL}/studentresponses/student/${studentId}`);
    //     if (response.ok) {
    //         const data = await response.json();
    //         return data?.updatedAt || null;
    //     }
    //     return null;
    // } catch (error) {
    //     console.warn(`Failed to get activity for student ${studentId}`);
    //     return null;
    // }


}

static async buildActiveUsers(students) {
    const results = await Promise.all(
        students.map(async (student) => {
            // Use both _id and id field names
            const studentId = student._id || student.id;
            const lastActivity = await this.getStudentActivity(studentId);
            
            let activityStatus = 'Never Active';
            let isActive = false;
            
            if (lastActivity) {
                const minutesAgo = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60));
                
                // Green if active within 24 hours (1440 minutes)
                if (minutesAgo <= 1440) {
                    isActive = true;
                    if (minutesAgo < 60) {
                        activityStatus = `${minutesAgo}m ago`;
                    } else {
                        activityStatus = `${Math.floor(minutesAgo / 60)}h ago`;
                    }
                } else {
                    activityStatus = `${Math.floor(minutesAgo / 1440)}d ago`;
                }
            }
            
            return {
                name: student.name,
                activityStatus,
                isActive
            };
        })
    );
    
    return results.sort((a, b) => b.isActive - a.isActive);
}

// fetch user points
static async fetchUserPoints2() {
    return this.request('points/');
}

static async fetchUserPoints(userId) {

    console.log("USER ID", userId)
    const response = await fetch(`${BASE_URL}/points/total/${userId}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    }
    });
    console.log('USER RESPONSE', response)

    if (!response.ok) {
    
    if (response.status === 404) {
        console.log("REACHED HERE")
        return {
        userId: userId,
        totalPoints: 0,
        progressData: {
            totalPoints: 0,
            courses: {}
        }
        };
        
    }
    throw new Error('Failed to fetch user points');
    }

    return response.json();
}

static async buildLeaderBoard(classroomResponse) {
    try {
        console.log('Building leaderboard for classroom:', classroomResponse.name);
        const userPoints2 = await this.fetchUserPoints2();
        console.log('entire classroom response', userPoints2)
    
    
        if (classroomResponse.studentIds.length === 0) {
            console.log('No students found in classroom');
            return [];
        }
    
        // Get points for each student
        const leaderboardPromises = classroomResponse.studentIds.map(async (student) => {
        try {
            // Fetch user points for this student
            const userPoints = await this.fetchUserPoints(student._id);
            console.log("Points for user", userPoints)
            
            return {
                id: student._id,
                name: student.name,
                email: student.email,
                totalPoints: userPoints?.totalPoints || 0,
                progressData: userPoints?.progressData || {}
            };
        } catch (error) {
            console.warn(`Failed to fetch points for student ${student.name}:`, error);
            // Return student with 0 points if fetching fails
            return {
            id: student._id,
            name: student.name,
            email: student.email,
            totalPoints: 0,
            progressData: {}
            };
        }
        });
    
        const studentsWithPoints = await Promise.all(leaderboardPromises);
    
        // Check if all students have 0 points
        const allPointsAreZero = studentsWithPoints.every(student => student.totalPoints === 0);
    
        var currentRank = 0;
        var lastPointTotal =  null;
        // Sort by total points (highest first) and add rankings
        const rankedLeaderboard = studentsWithPoints
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((student, index) => {
            if (lastPointTotal !== student.totalPoints) {
                currentRank = index + 1;
                lastPointTotal = student.totalPoints;
            }
            return {
                ...student,
                rank: allPointsAreZero ? "-" : currentRank,
                isTop3: allPointsAreZero ? false : currentRank < 3,
            }
        });
    
        console.log('Leaderboard created successfully:', rankedLeaderboard);
        return rankedLeaderboard;
    
    } catch (error) {
        console.error('Error building simple leaderboard:', error);
        throw new Error('Failed to build leaderboard');
    }
    }

    // Send email notification
    static async sendEmailNotification(recipient, subject, message) {
        return this.request('notifications/email', 'POST', { recipient, subject, message });
    }

    static async sendEmailInvite(userId, recipientEmail, classroomId, classroomName) {
        console.log('Sending email invite for user:', userId, 'to:', recipientEmail, 'for classroom:', classroomId);
        if (!userId || !recipientEmail || !classroomId || !classroomName) {
            throw new Error('User ID, recipient email, classroom ID, and classroom name are required to send an invite');
        }

        const inviteUrl = `${BASE_URL}/classroom/${classroomId}/add-student`;
        return this.request('notifications/email/invite', 'POST', { userId, recipientEmail, classroomName, inviteUrl });
    }

    static async fetchNotifications() {
        return this.request('notifs');
    }
}

export default ApiService;