import axiosInstance from './axiosConfig';

// Create new task
export const createTask = async (taskData) => {
  const response = await axiosInstance.post('/tasks', taskData);
  return response.data;
};

// Get all tasks
export const getAllTasks = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await axiosInstance.get(`/tasks?${params}`);
  return response.data;
};

// Get my tasks
export const getMyTasks = async () => {
  const response = await axiosInstance.get('/tasks/my-tasks');
  return response.data;
};

// Get task by ID
export const getTaskById = async (taskId) => {
  const response = await axiosInstance.get(`/tasks/${taskId}`);
  return response.data;
};

// Update task
export const updateTask = async (taskId, taskData) => {
  const response = await axiosInstance.put(`/tasks/${taskId}`, taskData);
  return response.data;
};

// Update task status
export const updateTaskStatus = async (taskId, status) => {
  const response = await axiosInstance.patch(`/tasks/${taskId}/status`, {
    status
  });
  return response.data;
};

// Delete task
export const deleteTask = async (taskId) => {
  const response = await axiosInstance.delete(`/tasks/${taskId}`);
  return response.data;
};

// Add comment to task
export const addComment = async (taskId, text) => {
  const response = await axiosInstance.post(`/tasks/${taskId}/comments`, {
    text
  });
  return response.data;
};