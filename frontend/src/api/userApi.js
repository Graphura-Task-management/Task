import axiosInstance from './axiosConfig';

// Get dashboard statistics (Admin)
export const getDashboardStats = async () => {
  const response = await axiosInstance.get('/users/dashboard/stats');
  return response.data;
};

// Get all leaders with stats
export const getAllLeaders = async () => {
  const response = await axiosInstance.get('/users/leaders');
  return response.data;
};

// Get leader details by ID
export const getLeaderDetails = async (leaderId) => {
  const response = await axiosInstance.get(`/users/leaders/${leaderId}/details`);
  return response.data;
};

// Get all employees
export const getAllEmployees = async () => {
  const response = await axiosInstance.get('/users/employees');
  return response.data;
};

// Get my team members (Leader)
export const getMyTeam = async () => {
  const response = await axiosInstance.get('/users/my-team');
  return response.data;
};

// Get all users (Admin)
export const getAllUsers = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await axiosInstance.get(`/users?${params}`);
  return response.data;
};

// Update user
export const updateUser = async (userData) => {
  const response = await axiosInstance.put(`/users/updateProfile`, userData);
  return response.data;
};

// Delete user
export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/users/${userId}`);
  return response.data;
};