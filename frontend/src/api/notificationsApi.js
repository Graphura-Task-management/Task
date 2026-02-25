import axiosInstance from "./axiosConfig";

export const notificationService = {
  // Get all notifications for current user
  getNotifications: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/notifications', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get unread notification count
  getUnreadCount: async () => {
    try {
      const response = await axiosInstance.get('/notifications/unread/count');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await axiosInstance.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await axiosInstance.patch('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await axiosInstance.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete all read notifications
  deleteAllRead: async () => {
    try {
      const response = await axiosInstance.delete('/notifications/read');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};