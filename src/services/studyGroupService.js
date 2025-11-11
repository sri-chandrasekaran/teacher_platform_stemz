import apiClient from './apiClient';

/**
 * Study Group Service
 * Handles all study group-related API calls
 */
class StudyGroupService {
  /**
   * Create a new study group within a classroom
   * @param {Object} studyGroupData - Study group data
   * @param {string} studyGroupData.classroomId - Classroom's ObjectId
   * @param {string} studyGroupData.name - Study group name
   * @param {Array<string>} studyGroupData.memberUserIds - Array of member user ObjectIds
   * @returns {Promise<Object>} - Created study group object
   */
  async createStudyGroup(studyGroupData) {
    try {
      // Validate required fields
      if (!studyGroupData.classroomId) {
        throw new Error('Classroom ID is required');
      }
      if (!studyGroupData.name) {
        throw new Error('Study group name is required');
      }
      if (!studyGroupData.memberUserIds || studyGroupData.memberUserIds.length === 0) {
        throw new Error('At least one member is required');
      }

      const response = await apiClient.post('api/studygroups', studyGroupData);
      return response;
    } catch (error) {
      console.error('Error creating study group:', error);
      
      // Handle specific validation errors
      if (error.message.includes('400')) {
        if (error.message.includes('classroom')) {
          throw new Error('Invalid classroom or classroom does not exist');
        } else if (error.message.includes('member')) {
          throw new Error('One or more members are invalid or not in the classroom');
        }
      }
      
      throw error;
    }
  }

  /**
   * Get all active study groups for the authenticated user
   * @returns {Promise<Array>} - Array of study group objects
   */
  async getUserStudyGroups() {
    try {
      return await apiClient.get('api/studygroups');
    } catch (error) {
      console.error('Error fetching user study groups:', error);
      throw error;
    }
  }

  /**
   * Get specific study group details with populated member information
   * @param {string} id - Study group's ObjectId
   * @returns {Promise<Object>} - Study group object with populated members
   */
  async getStudyGroupById(id) {
    try {
      if (!id) {
        throw new Error('Study group ID is required');
      }
      return await apiClient.get(`api/studygroups/${id}`);
    } catch (error) {
      console.error('Error fetching study group by ID:', error);
      
      if (error.message.includes('404')) {
        throw new Error('Study group not found');
      }
      
      throw error;
    }
  }

  /**
   * Get all active study groups for a specific classroom
   * @param {string} classroomId - Classroom's ObjectId
   * @returns {Promise<Array>} - Array of study group objects
   */
  async getStudyGroupsByClassroomId(classroomId) {
    try {
      if (!classroomId) {
        throw new Error('Classroom ID is required');
      }
      return await apiClient.get(`api/studygroups/classroom/${classroomId}`);
    } catch (error) {
      console.error('Error fetching study groups by classroom:', error);
      throw error;
    }
  }

  /**
   * Replace all members in the study group
   * @param {string} id - Study group's ObjectId
   * @param {Array<string>} memberUserIds - Array of member user ObjectIds
   * @returns {Promise<Object>} - Updated study group object
   */
  async updateMembers(id, memberUserIds) {
    try {
      if (!id) {
        throw new Error('Study group ID is required');
      }
      if (!Array.isArray(memberUserIds)) {
        throw new Error('Member user IDs must be an array');
      }

      const response = await apiClient.put(
        `api/studygroups/${id}/members`,
        { memberUserIds }
      );
      return response;
    } catch (error) {
      console.error('Error updating study group members:', error);
      
      if (error.message.includes('400')) {
        throw new Error('Invalid member user IDs');
      } else if (error.message.includes('404')) {
        throw new Error('Study group not found');
      }
      
      throw error;
    }
  }

  /**
   * Add new members to the study group (no duplicates)
   * @param {string} id - Study group's ObjectId
   * @param {Array<string>} userIds - Array of user ObjectIds to add
   * @returns {Promise<Object>} - Updated study group object
   */
  async addMembers(id, userIds) {
    try {
      if (!id) {
        throw new Error('Study group ID is required');
      }
      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new Error('At least one user ID is required');
      }

      const response = await apiClient.post(
        `api/studygroups/${id}/members`,
        { userIds }
      );
      return response;
    } catch (error) {
      console.error('Error adding members to study group:', error);
      
      if (error.message.includes('400')) {
        throw new Error('Invalid user IDs or users already in group');
      } else if (error.message.includes('404')) {
        throw new Error('Study group not found');
      }
      
      throw error;
    }
  }

  /**
   * Remove members from the study group
   * @param {string} id - Study group's ObjectId
   * @param {Array<string>} userIds - Array of user ObjectIds to remove
   * @returns {Promise<Object>} - Updated study group object
   */
  async removeMembers(id, userIds) {
    try {
      if (!id) {
        throw new Error('Study group ID is required');
      }
      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new Error('At least one user ID is required');
      }

      const response = await apiClient.delete(
        `api/studygroups/${id}/members`,
        { 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userIds })
        }
      );
      return response;
    } catch (error) {
      console.error('Error removing members from study group:', error);
      
      if (error.message.includes('400')) {
        throw new Error('Invalid user IDs or users not in group');
      } else if (error.message.includes('404')) {
        throw new Error('Study group not found');
      }
      
      throw error;
    }
  }

  /**
   * Archive a study group (soft delete)
   * @param {string} id - Study group's ObjectId
   * @returns {Promise<Object>} - Archived study group object
   */
  async archiveStudyGroup(id) {
    try {
      if (!id) {
        throw new Error('Study group ID is required');
      }

      const response = await apiClient.post(`api/studygroups/${id}/archive`);
      return response;
    } catch (error) {
      console.error('Error archiving study group:', error);
      
      if (error.message.includes('404')) {
        throw new Error('Study group not found');
      }
      
      throw error;
    }
  }

  /**
   * Update study group information (name, etc.)
   * @param {string} id - Study group's ObjectId
   * @param {Object} studyGroupData - Updated study group data
   * @returns {Promise<Object>} - Updated study group object
   */
  async updateStudyGroup(id, studyGroupData) {
    try {
      if (!id) {
        throw new Error('Study group ID is required');
      }

      const response = await apiClient.put(`api/studygroups/${id}`, studyGroupData);
      return response;
    } catch (error) {
      console.error('Error updating study group:', error);
      
      if (error.message.includes('404')) {
        throw new Error('Study group not found');
      }
      
      throw error;
    }
  }

  /**
   * Delete study group (if the endpoint supports hard delete)
   * Note: Use archiveStudyGroup for soft delete
   * @param {string} id - Study group's ObjectId
   * @returns {Promise<Object>} - Deletion confirmation
   */
  async deleteStudyGroup(id) {
    try {
      if (!id) {
        throw new Error('Study group ID is required');
      }

      const response = await apiClient.delete(`api/studygroups/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting study group:', error);
      
      if (error.message.includes('404')) {
        throw new Error('Study group not found');
      }
      
      throw error;
    }
  }
}

// Create and export a singleton instance
const studyGroupService = new StudyGroupService();
export default studyGroupService;

