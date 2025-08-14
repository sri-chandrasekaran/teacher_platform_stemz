const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
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

static async fetchUserPoints2() {
    const response = await fetch(`${BASE_URL}/points/`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    }
    });
    return response.json();
}

    //fetch the points for all users
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

    // Sort by total points (highest first) and add rankings
    const rankedLeaderboard = studentsWithPoints
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((student, index) => ({
        ...student,
        rank: allPointsAreZero ? "-" : index + 1,
        isTop3: allPointsAreZero ? false : index < 3,
    }));

    console.log('Leaderboard created successfully:', rankedLeaderboard);
    return rankedLeaderboard;

} catch (error) {
    console.error('Error building simple leaderboard:', error);
    throw new Error('Failed to build leaderboard');
}
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
        console.log('Fetching classrooms from API at:', process.env.REACT_APP_API_URL);
        const response = await fetch(`${BASE_URL}/physical-classrooms`, {
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

    static async fetchMyClassrooms(userId) {
        console.log('Fetching my classrooms for user:', userId);
        if (!userId) {
            throw new Error('User ID is required to fetch classrooms');
        }
        const response = await fetch(`${BASE_URL}/physical-classrooms/my-classrooms/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
        });
    
        if (!response.ok) {
        throw new Error('Failed to fetch my classrooms');
        }
    
        return response.json();
    }

    // Fetch a clssroom by ID
    static async fetchClassroomById(classroomId) {
        const response = await fetch(`${BASE_URL}/physical-classrooms/${classroomId}`, {
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
        const response = await fetch(`${BASE_URL}/physical-classrooms`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(classroomData),
        });

        if (!response.ok) {
            console.error('Failed to add classroom:', response);
            throw new Error('Failed to add classroom');
        }

        return response.json();
    }

    // Update an existing classroom
    static async updateClassroom(classroomId, classroomData) {
        const response = await fetch(`${BASE_URL}/physical-classrooms/${classroomId}`, {
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
        const response = await fetch(`${BASE_URL}/physical-classrooms/${classroomId}`, {
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
        const response = await fetch(`${BASE_URL}/physical-classrooms/${classroomId}/students`, {
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

    static async enrollStudent(classroomId, userId) {
        console.log('API Call - ClassroomId:', classroomId, 'UserId:', userId, 'Type:', typeof userId);
        
        // Try wrapping the ID in an ObjectId-like structure
        const requestBody = { 
            studentId: userId
        };
        console.log('Request body:', requestBody);
        
        const response = await fetch(`${BASE_URL}/physical-classrooms/${classroomId}/add-student`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
    
        console.log('Response status:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error response:', errorText);
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

    static async buildActiveUsers(classroomResponse) {
        
    try {
        console.log('Building active users dashboard for classroom:', classroomResponse.name);

        if (classroomResponse.studentIds.length === 0) {
            console.log('No students found in classroom');
            return [];
        }

        // Fetch worksheets once for the entire classroom
        const classroomWorksheets = await this.fetchWorksheetActivity(classroomResponse._id);
        console.log("worksheet activity", classroomWorksheets)

        // Get activity data for each student
        const activeUsersPromises = classroomResponse.studentIds.map(async (student) => {
            try {
                // Fetch student responses and user points for this student
                const [studentResponses, userPoints] = await Promise.all([
                    this.fetchStudentResponses(student._id),
                    this.fetchUserPoints(student._id)
                ]);

                // Collect all timestamps from the three sources
                const timestamps = [];

                // Add timestamps from student responses (filter by studentId)
                if (studentResponses && Array.isArray(studentResponses)) {
                    const studentSpecificResponses = studentResponses.filter(response => 
                        response.studentId === student._id
                    );
                    studentSpecificResponses.forEach(response => {
                        if (response.updatedAt) {
                            timestamps.push(new Date(response.updatedAt));
                        }
                    });
                }

                // Add timestamps from worksheets (filter by student email)
                if (classroomWorksheets && Array.isArray(classroomWorksheets)) {
                    const studentWorksheets = classroomWorksheets.filter(worksheet => 
                        worksheet.userEmail === student.email
                    );
                    studentWorksheets.forEach(worksheet => {
                        if (worksheet.updatedAt) {
                            timestamps.push(new Date(worksheet.updatedAt));
                        }
                    });
                }

                // Add timestamp from user points (this is already student-specific)
                if (userPoints && userPoints.updatedAt) {
                    timestamps.push(new Date(userPoints.updatedAt));
                }

                // Find the most recent timestamp
                let lastActivityTime = null;
                if (timestamps.length > 0) {
                    lastActivityTime = new Date(Math.max(...timestamps));
                }

                // Calculate activity status
                const currentTime = new Date();
                let activityStatus = 'Never Active';
                let minutesAgo = 0;
                let isActive = false;

                if (lastActivityTime) {
                    minutesAgo = Math.floor((currentTime - lastActivityTime) / (1000 * 60));
                    
                    if (minutesAgo <= 10) {
                        activityStatus = 'Active';
                        isActive = true;
                    } else {
                        activityStatus = `Last Active ${minutesAgo} minutes ago`;
                    }
                }

                return {
                    id: student._id,
                    name: student.name,
                    email: student.email,
                    lastActivityTime: lastActivityTime ? lastActivityTime.toISOString() : null,
                    activityStatus: activityStatus,
                    isActive: isActive,
                    minutesSinceLastActivity: lastActivityTime ? minutesAgo : null
                };

            } catch (error) {
                console.warn(`Failed to fetch activity data for student ${student.name}:`, error);
                // Return student with no activity if fetching fails
                return {
                    id: student._id,
                    name: student.name,
                    email: student.email,
                    lastActivityTime: null,
                    activityStatus: 'Data Unavailable',
                    isActive: false,
                    minutesSinceLastActivity: null
                };
            }
        });

        const activeUsersData = await Promise.all(activeUsersPromises);

        // Sort by activity status (active users first, then by most recent activity)
        const sortedActiveUsers = activeUsersData.sort((a, b) => {
            // Active users first
            if (a.isActive && !b.isActive) return -1;
            if (!a.isActive && b.isActive) return 1;
            
            // If both are active or both inactive, sort by most recent activity
            if (a.lastActivityTime && b.lastActivityTime) {
                return new Date(b.lastActivityTime) - new Date(a.lastActivityTime);
            }
            
            // Put users with activity data before those without
            if (a.lastActivityTime && !b.lastActivityTime) return -1;
            if (!a.lastActivityTime && b.lastActivityTime) return 1;
            
            // If neither has activity data, sort alphabetically
            return a.name.localeCompare(b.name);
        });

        console.log('Active users dashboard created successfully:', sortedActiveUsers);
        return sortedActiveUsers;

    } catch (error) {
        console.error('Error building active users dashboard:', error);
        throw new Error('Failed to build active users dashboard');
    }
}

// Optional: Helper function to get worksheet data for a classroom (if needed for activity tracking)
static async fetchWorksheetActivity(classroomId) {
    try {
        const worksheets = await this.fetchWorksheets(classroomId);
        return worksheets.filter(worksheet => worksheet.updatedAt);
    } catch (error) {
        console.warn('Failed to fetch worksheet activity:', error);
        return [];
    }
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

    static async fetchStudentResponses(studentId) {
        const response = await fetch(`${BASE_URL}/studentresponses/${studentId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch student responses');
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