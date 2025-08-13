import apiClient from './apiClient.js';

/**
 * Get user progress for a specific course
 * @param {string} courseName - The name of the course (e.g., 'astronomy')
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - The progress data for the user and course
 */
export const getUserCourseProgress = async (courseName, userId) => {
  try {
    return await apiClient.get(`api/progress/user/${userId}/course/${courseName}/completion`);
  } catch (error) {
    console.error('Error fetching user course progress:', error);
    throw error;
  }
};

getUserCourseProgress('Astronomy', '688d6519ab0d28950abd0321').then(console.log).catch(console.error);