import { buildApiUrl, getTimeout, getBaseUrl } from '../config/api';

// Standard headers for all API requests
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Standard timeout for requests
const DEFAULT_TIMEOUT = getTimeout();
const BASE_URL = getBaseUrl();

/**
 * Standardized API client for making HTTP requests
 * Includes both generic HTTP methods and business logic methods
 */
class ApiClient {
  constructor() {
    this.baseHeaders = DEFAULT_HEADERS;
    this.timeout = DEFAULT_TIMEOUT;
  }

  /**
   * Add custom headers to the request
   * @param {Object} headers - Additional headers to include
   */
  setHeaders(headers) {
    this.baseHeaders = { ...this.baseHeaders, ...headers };
  }

  /**
   * Set authorization token
   * @param {string} token - Bearer token
   */
  setAuthToken(token) {
    if (token) {
      this.baseHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.baseHeaders['Authorization'];
    }
  }

  /**
   * Clear authorization token
   */
  clearAuthToken() {
    delete this.baseHeaders['Authorization'];
    localStorage.removeItem('token');
    localStorage.removeItem('login_response');
  }

  /**
   * Create a timeout promise
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise} - Promise that rejects after timeout
   */
  createTimeoutPromise(timeout) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    });
  }

  /**
   * Make a generic API request
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} body - Request body
   * @param {boolean} requiresAuth - Whether auth token is required
   * @returns {Promise<Object>} - Response data
   */
  async request(endpoint, method = 'GET', body = null, requiresAuth = true) {
    const url = `${BASE_URL}/api/${endpoint}`;
    const headers = { ...this.baseHeaders };

    if (requiresAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const fetchOptions = {
      method,
      headers,
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} - Response data
   */
  async get(endpoint, options = {}) {
    const url = buildApiUrl(endpoint);
    
    const fetchOptions = {
      method: 'GET',
      headers: { ...this.baseHeaders, ...options.headers },
      ...options,
    };

    return this.makeRequest(url, fetchOptions);
  }

  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} - Response data
   */
  async post(endpoint, data = null, options = {}) {
    const url = buildApiUrl(endpoint);
    
    const fetchOptions = {
      method: 'POST',
      headers: { ...this.baseHeaders, ...options.headers },
      ...options,
    };

    if (data) {
      fetchOptions.body = JSON.stringify(data);
    }

    return this.makeRequest(url, fetchOptions);
  }

  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} - Response data
   */
  async put(endpoint, data = null, options = {}) {
    const url = buildApiUrl(endpoint);
    
    const fetchOptions = {
      method: 'PUT',
      headers: { ...this.baseHeaders, ...options.headers },
      ...options,
    };

    if (data) {
      fetchOptions.body = JSON.stringify(data);
    }

    return this.makeRequest(url, fetchOptions);
  }

  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} - Response data
   */
  async delete(endpoint, options = {}) {
    const url = buildApiUrl(endpoint);
    
    const fetchOptions = {
      method: 'DELETE',
      headers: { ...this.baseHeaders, ...options.headers },
      ...options,
    };

    return this.makeRequest(url, fetchOptions);
  }

  /**
   * Make a PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} - Response data
   */
  async patch(endpoint, data = null, options = {}) {
    const url = buildApiUrl(endpoint);
    
    const fetchOptions = {
      method: 'PATCH',
      headers: { ...this.baseHeaders, ...options.headers },
      ...options,
    };

    if (data) {
      fetchOptions.body = JSON.stringify(data);
    }

    return this.makeRequest(url, fetchOptions);
  }

  /**
   * Handle token expiration and redirect to login
   * @param {Response} response - Fetch response object
   * @param {Object} data - Response data
   * @returns {boolean} - True if token expired
   */
  handleTokenExpiration(response, data) {
    const isTokenExpired = 
      response.status === 401 || 
      response.status === 403 || 
      data?.message?.toLowerCase().includes('token') ||
      data?.message?.toLowerCase().includes('unauthorized') ||
      data?.message?.toLowerCase().includes('expired') ||
      data?.error?.toLowerCase().includes('token') ||
      data?.error?.toLowerCase().includes('unauthorized');

    if (isTokenExpired) {
      // Clear expired token
      this.clearAuthToken();
      
      // Redirect to login with return URL
      const currentPath = window.location.pathname;
      const returnUrl = encodeURIComponent(currentPath);
      const message = encodeURIComponent('Your session has expired. Please log in again.');
      
      window.location.href = `/login?returnUrl=${returnUrl}&message=${message}`;
      return true;
    }
    
    return false;
  }

  /**
   * Execute the actual HTTP request with timeout and error handling
   * @param {string} url - Full URL
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} - Response data
   */
  async makeRequest(url, options) {
    try {
      // Create timeout promise
      const timeoutPromise = this.createTimeoutPromise(this.timeout);
      
      // Create fetch promise
      const fetchPromise = fetch(url, options);
      
      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      let data;
      try {
        // Handle empty responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }
      } catch (error) {
        data = { 
          message: response.statusText || 'Unknown error',
          status: response.status 
        };
      }

      // Check for token expiration first
      if (this.handleTokenExpiration(response, data)) {
        const error = new Error('Token expired - redirecting to login');
        error.response = {
          status: response.status,
          statusText: response.statusText,
          data: data
        };
        throw error;
      }

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${data.message || response.statusText}`);
        error.response = {
          status: response.status,
          statusText: response.statusText,
          data: data
        };
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', {
        url,
        method: options.method,
        error: error.message,
      });
      throw error;
    }
  }

  // ==================== BUSINESS LOGIC METHODS ====================
  // User-related API calls

  /**
   * Fetch all users
   * @returns {Promise<Array>} - List of users
   */
  async fetchUsers() {
    return this.request('users');
  }

  /**
   * Update user information
   * @param {string} userId - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} - Updated user data
   */
  async updateUser(userId, userData) {
    console.log('Updating user with ID:', userId, 'Data:', userData);
    return this.request(`users/id/${userId}`, 'PUT', userData);
  }

  //2FA-related API calls

  /**
   * Retrieve qr code for 2fa setup
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - 2FA setup data
   */
  async get2FAQrCode(userId) {
    return this.request(`auth/2fa/setup/`, 'POST', { userId });
  }
  /**
   * Verify 2FA token
   * @param {string} userId - User ID
   * @param {string} token - 2FA token
   * @returns {Promise<Object>} - Verification result
   */
  async verify2FA(userId, token) {
    return this.request(`auth/2fa/verify/`, 'POST', { userId, token });
  }

  // Course-related API calls

  /**
   * Fetch all courses
   * @returns {Promise<Array>} - List of courses
   */
  async fetchCourses() {
    return this.request('courses');
  }

  /**
   * Fetch a course by ID
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>} - Course data
   */
  async fetchCourseById(courseId) {
    return this.request(`courses/${courseId}`);
  }

  /**
   * Add a new course
   * @param {Object} courseData - Course data
   * @returns {Promise<Object>} - Created course
   */
  async addCourse(courseData) {
    return this.request('courses', 'POST', courseData);
  }

  /**
   * Update an existing course
   * @param {string} courseId - Course ID
   * @param {Object} courseData - Course data to update
   * @returns {Promise<Object>} - Updated course
   */
  async updateCourse(courseId, courseData) {
    return this.request(`courses/${courseId}`, 'PUT', courseData);
  }

  /**
   * Delete a course
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteCourse(courseId) {
    return this.request(`courses/${courseId}`, 'DELETE');
  }

  // Classroom-related API calls

  /**
   * Fetch all classrooms
   * @returns {Promise<Array>} - List of classrooms
   */
  async fetchClassrooms() {
    console.log('Fetching classrooms from API at:', process.env.REACT_APP_API_URL);
    return this.request('physical-classrooms');
  }

  /**
   * Fetch classrooms for a specific user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User's classrooms
   */
  async fetchMyClassrooms(userId) {
    console.log('Fetching my classrooms for user:', userId);
    return this.request(`physical-classrooms/my-classrooms/${userId}`);
  }

  /**
   * Fetch a classroom by ID
   * @param {string} classroomId - Classroom ID
   * @returns {Promise<Object>} - Classroom data
   */
  async fetchClassroomById(classroomId) {
    return this.request(`physical-classrooms/${classroomId}`);
  }

  /**
   * Add a new classroom
   * @param {Object} classroomData - Classroom data
   * @returns {Promise<Object>} - Created classroom
   */
  async addClassroom(classroomData) {
    return this.request('physical-classrooms', 'POST', classroomData);
  }

  /**
   * Update an existing classroom
   * @param {string} classroomId - Classroom ID
   * @param {Object} classroomData - Classroom data to update
   * @returns {Promise<Object>} - Updated classroom
   */
  async updateClassroom(classroomId, classroomData) {
    return this.request(`physical-classrooms/${classroomId}`, 'PUT', classroomData);
  }

  /**
   * Delete a classroom
   * @param {string} classroomId - Classroom ID
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteClassroom(classroomId) {
    return this.request(`physical-classrooms/${classroomId}`, 'DELETE');
  }

  /**
   * Fetch students in a classroom
   * @param {string} classroomId - Classroom ID
   * @returns {Promise<Array>} - List of students
   */
  async fetchStudentsInClassroom(classroomId) {
    return this.request(`physical-classrooms/${classroomId}/students`);
  }

  /**
   * Enroll a student in a classroom
   * @param {string} classroomId - Classroom ID
   * @param {string} userId - User/Student ID
   * @returns {Promise<Object>} - Enrollment result
   */
  async enrollStudent(classroomId, userId) {
    console.log('API Call - ClassroomId:', classroomId, 'UserId:', userId, 'Type:', typeof userId);
    const requestBody = { 
      studentId: userId
    };
    console.log('Request body:', requestBody);
    return this.request(`physical-classrooms/${classroomId}/add-student`, 'POST', requestBody);
  }

  /**
   * Remove a user from a classroom
   * @param {string} classroomId - Classroom ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Removal result
   */
  async removeStudent(classroomId, userId) {
    console.log('Removing user with ID:', userId, 'from classroom ID:', classroomId);
    return this.request(`physical-classrooms/${classroomId}/remove-student`, 'POST', { studentId: userId });
  }

  // Grades and Worksheets

  /**
   * Fetch grades for a classroom
   * @param {string} classroomId - Classroom ID
   * @returns {Promise<Array>} - List of grades
   */
  async fetchGrades(classroomId) {
    return this.request(`grade/classroom/${classroomId}`);
  }

  /**
   * Fetch worksheets for a classroom
   * @param {string} classroomId - Classroom ID
   * @returns {Promise<Array>} - List of worksheets
   */
  async fetchWorksheets(classroomId) {
    return this.request(`worksheets/classroom/${classroomId}`);
  }

  // Student Activity

  /**
   * Get student activity
   * @param {string} studentId - Student ID
   * @returns {Promise<Object|null>} - Student activity data
   */
  async getStudentActivity(studentId) {
    if (!studentId) {
      console.warn('No studentId provided');
      return null;
    }
    return this.request(`studentresponses/student/${studentId}`, 'GET', null, true);
  }

  /**
   * Build active users list with activity status
   * @param {Array} students - List of students
   * @returns {Promise<Array>} - Students with activity status
   */
  async buildActiveUsers(students) {
    const results = await Promise.all(
      students.map(async (student) => {
        const studentId = student._id || student.id;
        const lastActivity = await this.getStudentActivity(studentId);
        
        let activityStatus = 'Never Active';
        let isActive = false;
        
        if (lastActivity) {
          const minutesAgo = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60));
          
          if (minutesAgo <= 1440) { // 24 hours
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

  // Points and Leaderboard

  /**
   * Fetch all user points
   * @returns {Promise<Array>} - List of user points
   */
  async fetchUserPoints2() {
    return this.request('points/');
  }

  /**
   * Fetch points for a specific user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User points data
   */
  async fetchUserPoints(userId) {
    console.log("USER ID", userId);
    const response = await fetch(`${BASE_URL}/api/points/total/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log('USER RESPONSE', response);

    if (!response.ok) {
      if (response.status === 404) {
        console.log("REACHED HERE");
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

  /**
   * Build leaderboard for a classroom
   * @param {Object} classroomResponse - Classroom data with students
   * @returns {Promise<Array>} - Ranked leaderboard
   */
  async buildLeaderBoard(classroomResponse) {
    try {
      console.log('Building leaderboard for classroom:', classroomResponse.name);
      const userPoints2 = await this.fetchUserPoints2();
      console.log('entire classroom response', userPoints2);

      if (classroomResponse.studentIds.length === 0) {
        console.log('No students found in classroom');
        return [];
      }

      // Get points for each student
      const leaderboardPromises = classroomResponse.studentIds.map(async (student) => {
        try {
          const userPoints = await this.fetchUserPoints(student._id);
          console.log("Points for user", userPoints);
          
          return {
            id: student._id,
            name: student.name,
            email: student.email,
            totalPoints: userPoints?.totalPoints || 0,
            progressData: userPoints?.progressData || {}
          };
        } catch (error) {
          console.warn(`Failed to fetch points for student ${student.name}:`, error);
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

      let currentRank = 0;
      let lastPointTotal = null;
      
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
          };
        });

      console.log('Leaderboard created successfully:', rankedLeaderboard);
      return rankedLeaderboard;

    } catch (error) {
      console.error('Error building simple leaderboard:', error);
      throw new Error('Failed to build leaderboard');
    }
  }

  // Notifications

  /**
   * Send email notification
   * @param {string} recipient - Recipient email
   * @param {string} subject - Email subject
   * @param {string} message - Email message
   * @returns {Promise<Object>} - Send result
   */
  async sendEmailNotification(recipient, subject, message) {
    return this.request('notifications/email', 'POST', { recipient, subject, message });
  }

  /**
   * Send email invite to classroom
   * @param {string} userId - User ID
   * @param {string} recipientEmail - Recipient email
   * @param {string} classroomId - Classroom ID
   * @param {string} classroomName - Classroom name
   * @returns {Promise<Object>} - Invite result
   */
  async sendEmailInvite(userId, recipientEmail, classroomId, classroomName) {
    console.log('Sending email invite for user:', userId, 'to:', recipientEmail, 'for classroom:', classroomId);
    if (!userId || !recipientEmail || !classroomId || !classroomName) {
      throw new Error('User ID, recipient email, classroom ID, and classroom name are required to send an invite');
    }

    const inviteUrl = `${BASE_URL}/api/classroom/${classroomId}/add-student`;
    return this.request('notifications/email/invite', 'POST', { userId, recipientEmail, classroomName, inviteUrl });
  }

  /**
   * Fetch notifications
   * @returns {Promise<Array>} - List of notifications
   */
  async fetchNotifications() {
    return this.request('notifs');
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();

export default apiClient;
