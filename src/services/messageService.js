import apiClient from './apiClient';

/**
 * Message Service
 * Handles all messaging-related API calls for study groups and direct messages
 */
class MessageService {
  /**
   * Get messages for a study group
   * @param {string} groupId - Study group's ObjectId
   * @returns {Promise<Array>} - Array of message objects sorted oldest to newest
   */
  async getGroupMessages(groupId) {
    try {
      if (!groupId) {
        throw new Error('Group ID is required');
      }

      console.debug('[MessageService] Pulling study group history for groupId:', groupId);
      const response = await apiClient.get(`api/group-messages/${groupId}`);
      const messages = Array.isArray(response) ? response : response.messages || [];
      console.debug('[MessageService] Study group history loaded:', messages.length, 'messages for groupId:', groupId);
      return messages;
    } catch (error) {
      console.debug('[MessageService] Study group history fetch failed for groupId:', groupId, error);
      console.error('Error fetching group messages:', error);
      
      if (error.message.includes('404')) {
        throw new Error('Study group not found');
      } else if (error.message.includes('403')) {
        throw new Error('You are not a member of this study group');
      }
      
      throw error;
    }
  }

  /**
   * Post a message to a study group
   * @param {string} groupId - Study group's ObjectId
   * @param {Object} messageData - Message data
   * @param {string} messageData.content - Message content
   * @param {Array} messageData.attachments - Optional attachments
   * @returns {Promise<Object>} - Created message object
   */
  async postGroupMessage(groupId, messageData) {
    try {
      if (!groupId) {
        throw new Error('Group ID is required');
      }
      if (!messageData.content || !messageData.content.trim()) {
        throw new Error('Message content is required');
      }

      // Get current user from localStorage
      const user = JSON.parse(localStorage.getItem('login_response') || '{}').user || {};
      const senderUserId = user._id;

      if (!senderUserId) {
        throw new Error('User not authenticated');
      }

      const payload = {
        content: messageData.content.trim(),
        attachments: messageData.attachments || [],
        senderUserId
      };

      const response = await apiClient.post(`api/group-messages/${groupId}`, payload);
      return response;
    } catch (error) {
      console.error('Error posting group message:', error);
      
      if (error.message.includes('404')) {
        throw new Error('Study group not found');
      } else if (error.message.includes('403')) {
        throw new Error('You are not a member of this study group');
      } else if (error.message.includes('400')) {
        throw new Error('Invalid message data');
      }
      
      throw error;
    }
  }

  /**
   * Edit a message
   * @param {string} messageId - Message's ObjectId
   * @param {string} content - Updated message content
   * @returns {Promise<Object>} - Updated message object
   */
  async editMessage(messageId, content) {
    try {
      if (!messageId) {
        throw new Error('Message ID is required');
      }
      if (!content || !content.trim()) {
        throw new Error('Message content is required');
      }

      const response = await apiClient.put(`api/group-messages/message/${messageId}`, {
        content: content.trim()
      });
      return response;
    } catch (error) {
      console.error('Error editing message:', error);
      
      if (error.message.includes('404')) {
        throw new Error('Message not found');
      } else if (error.message.includes('403')) {
        throw new Error('You can only edit your own messages');
      }
      
      throw error;
    }
  }

  /**
   * Delete a message (soft delete)
   * @param {string} messageId - Message's ObjectId
   * @returns {Promise<Object>} - Deletion confirmation
   */
  async deleteMessage(messageId) {
    try {
      if (!messageId) {
        throw new Error('Message ID is required');
      }

      const response = await apiClient.delete(`api/group-messages/message/${messageId}`);
      return response;
    } catch (error) {
      console.error('Error deleting message:', error);
      
      if (error.message.includes('404')) {
        throw new Error('Message not found');
      } else if (error.message.includes('403')) {
        throw new Error('You can only delete your own messages');
      }
      
      throw error;
    }
  }

  /**
   * Send a direct message to a student
   * @param {string} recipientId - Recipient's user ID
   * @param {string} content - Message content
   * @param {string} classroomId - Classroom context (optional)
   * @returns {Promise<Object>} - Created message object
   */
  async sendDirectMessage(recipientId, content, classroomId = null) {
    try {
      if (!recipientId) {
        throw new Error('Recipient ID is required');
      }
      if (!content || !content.trim()) {
        throw new Error('Message content is required');
      }

      // Get current user from localStorage
      const user = JSON.parse(localStorage.getItem('login_response') || '{}').user || {};
      const senderId = user._id;

      if (!senderId) {
        throw new Error('User not authenticated');
      }

      const payload = {
        recipientId,
        senderId,
        content: content.trim(),
        classroomId
      };

      const response = await apiClient.post('api/messages/direct', payload);
      return response;
    } catch (error) {
      console.error('Error sending direct message:', error);
      throw error;
    }
  }

  /**
   * Get direct messages between the current user and another user
   * @param {string} otherUserId - Other user's ID
   * @param {number} limit - Maximum number of messages (default: 50)
   * @returns {Promise<Array>} - Array of message objects
   */
  async getDirectMessages(otherUserId, limit = 50) {
    try {
      if (!otherUserId) {
        throw new Error('Other user ID is required');
      }

      // Get current user from localStorage
      const user = JSON.parse(localStorage.getItem('login_response') || '{}').user || {};
      const userId = user._id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const endpoint = `api/messages/direct?userId=${userId}&otherUserId=${otherUserId}&limit=${limit}`;
      const response = await apiClient.get(endpoint);
      return Array.isArray(response) ? response : response.messages || [];
    } catch (error) {
      console.error('Error fetching direct messages:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const messageService = new MessageService();
export default messageService;
