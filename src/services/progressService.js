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

export const getStudentResponses = async (studentId, courseId, lessonId = null) => {
  try {
    const url = `https://core-server-nine.vercel.app/api/teachers/bpq-responses/${courseId}/student/${studentId}?lessonId=lesson${lessonId}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching student responses:', error);
    throw error;
  }
};

export const getStudentResponsesByLesson = async (studentId, courseId, lessonId) => {
  try {
    const url = `https://core-server-nine.vercel.app/api/teacher/student-responses/${courseId}/${studentId}?lessonId=lesson${lessonId}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching student responses by lesson:', error);
    throw error;
  }
};

// getUserCourseProgress('astronomy', '688d6519ab0d28950abd0321').then(console.log).catch(console.error);
// getUserCourseProgress('astronomy', '68967e810cb7f9004ef70de4').then(console.log).catch(console.error);