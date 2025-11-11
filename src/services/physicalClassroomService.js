import apiClient from './apiClient';

/**
 * Physical Classroom Service
 * Handles all physical classroom-related API calls
 */
class PhysicalClassroomService {
  /**
   * Get basic information for all active physical classrooms (public endpoint)
   * @returns {Promise<Array>} - Array of basic classroom info
   */
  async getBasicInfo() {
    try {
      return await apiClient.get('api/physical-classrooms/basic-info');
    } catch (error) {
      console.error('Error fetching basic classroom info:', error);
      throw error;
    }
  }

  /**
   * Get all active physical classrooms with full details
   * @returns {Promise<Array>} - Array of classroom objects
   */
  async getAllClassrooms() {
    try {
      return await apiClient.get('api/physical-classrooms');
    } catch (error) {
      console.error('Error fetching all classrooms:', error);
      throw error;
    }
  }

  /**
   * Get user's physical classrooms (both teaching and enrolled)
   * @param {string} userId - User's ObjectId
   * @returns {Promise<Object>} - Object with 'teaching' and 'enrolled' arrays
   */
  async getUserClassrooms(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return await apiClient.get(`api/physical-classrooms/my-classrooms/${userId}`);
    } catch (error) {
      console.error('Error fetching user classrooms:', error);
      throw error;
    }
  }

  /**
   * Create a new physical classroom
   * @param {Object} classroomData - Classroom data
   * @param {string} classroomData.name - Classroom name
   * @param {string} classroomData.description - Classroom description
   * @param {string} classroomData.teacherId - Teacher's ObjectId
   * @param {string} classroomData.schoolName - School name
   * @param {string} classroomData.gradeLevel - Grade level
   * @param {string} classroomData.academicYear - Academic year
   * @param {string} classroomData.classroomNumber - Classroom number
   * @param {number} classroomData.maxStudents - Maximum number of students
   * @param {Array<string>} classroomData.students - Array of student ObjectIds (optional)
   * @returns {Promise<Object>} - Created classroom object
   */
  async createClassroom(classroomData) {
    try {
      const response = await apiClient.post('api/physical-classrooms', classroomData);
      return response;
    } catch (error) {
      console.error('Error creating classroom:', error);
      throw error;
    }
  }

  /**
   * Get physical classroom by ID
   * @param {string} id - Classroom's ObjectId
   * @returns {Promise<Object>} - Classroom object with populated teacher and students
   */
  async getClassroomById(id) {
    try {
      if (!id) {
        throw new Error('Classroom ID is required');
      }
      return await apiClient.get(`api/physical-classrooms/${id}`);
    } catch (error) {
      console.error('Error fetching classroom by ID:', error);
      throw error;
    }
  }

  /**
   * Update physical classroom information
   * @param {string} id - Classroom's ObjectId
   * @param {Object} classroomData - Updated classroom data
   * @returns {Promise<Object>} - Updated classroom object
   */
  async updateClassroom(id, classroomData) {
    try {
      if (!id) {
        throw new Error('Classroom ID is required');
      }
      const response = await apiClient.put(`api/physical-classrooms/${id}`, classroomData);
      return response;
    } catch (error) {
      console.error('Error updating classroom:', error);
      throw error;
    }
  }

  /**
   * Delete physical classroom (soft delete - sets isActive to false)
   * @param {string} id - Classroom's ObjectId
   * @returns {Promise<Object>} - Deletion confirmation
   */
  async deleteClassroom(id) {
    try {
      if (!id) {
        throw new Error('Classroom ID is required');
      }
      return await apiClient.delete(`api/physical-classrooms/${id}`);
    } catch (error) {
      console.error('Error deleting classroom:', error);
      throw error;
    }
  }

  /**
   * Get all students in a physical classroom
   * @param {string} id - Classroom's ObjectId
   * @returns {Promise<Object>} - Object with classroom info, students array, and student count
   */
  async getClassroomStudents(id) {
    try {
      if (!id) {
        throw new Error('Classroom ID is required');
      }
      return await apiClient.get(`api/physical-classrooms/${id}/students`);
    } catch (error) {
      console.error('Error fetching classroom students:', error);
      throw error;
    }
  }

  /**
   * Add a student to physical classroom
   * @param {string} classroomId - Classroom's ObjectId
   * @param {string} studentId - Student's ObjectId
   * @returns {Promise<Object>} - Updated classroom object
   */
  async addStudent(classroomId, studentId) {
    try {
      if (!classroomId || !studentId) {
        throw new Error('Classroom ID and Student ID are required');
      }
      
      const response = await apiClient.post(
        `api/physical-classrooms/${classroomId}/add-student`,
        { studentId }
      );
      return response;
    } catch (error) {
      console.error('Error adding student to classroom:', error);
      
      // Handle specific error cases
      if (error.message.includes('400')) {
        if (error.message.includes('already enrolled')) {
          throw new Error('Student is already enrolled in this classroom');
        } else if (error.message.includes('full')) {
          throw new Error('Classroom has reached maximum capacity');
        } else {
          throw new Error('Invalid classroom or student ID');
        }
      } else if (error.message.includes('404')) {
        throw new Error('Classroom or student not found');
      }
      
      throw error;
    }
  }

  /**
   * Remove a student from physical classroom
   * @param {string} classroomId - Classroom's ObjectId
   * @param {string} studentId - Student's ObjectId
   * @returns {Promise<Object>} - Updated classroom object
   */
  async removeStudent(classroomId, studentId) {
    try {
      if (!classroomId || !studentId) {
        throw new Error('Classroom ID and Student ID are required');
      }
      
      const response = await apiClient.post(
        `api/physical-classrooms/${classroomId}/remove-student`,
        { studentId }
      );
      return response;
    } catch (error) {
      console.error('Error removing student from classroom:', error);
      
      // Handle specific error cases
      if (error.message.includes('400')) {
        throw new Error('Student is not enrolled in this classroom or invalid ID');
      } else if (error.message.includes('404')) {
        throw new Error('Classroom not found');
      }
      
      throw error;
    }
  }
}

// Create and export a singleton instance
const physicalClassroomService = new PhysicalClassroomService();
export default physicalClassroomService;

