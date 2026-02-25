import axiosInstance from './axiosConfig';

// Create new project (Admin)
export const createProject = async (projectData) => {
  const response = await axiosInstance.post('/projects', projectData);
  return response.data;
};

// Get all projects
export const getAllProjects = async () => {
  const response = await axiosInstance.get('/projects');
  return response.data;
};

// Get my projects
export const getMyProjects = async () => {
  const response = await axiosInstance.get('/projects/my-projects');
  return response.data;
};

// Get project by ID
export const getProjectById = async (projectId) => {
  const response = await axiosInstance.get(`/projects/${projectId}`);
  return response.data;
};

// Update project
export const updateProject = async (projectId, projectData) => {
  const response = await axiosInstance.put(`/projects/${projectId}`, projectData);
  return response.data;
};

// Delete project
export const deleteProject = async (projectId) => {
  const response = await axiosInstance.delete(`/projects/${projectId}`);
  return response.data;
};

// Add team member to project
export const addTeamMember = async (memberData) => {
  const response = await axiosInstance.post(`/users/team/add`,{memberData});
  return response.data;
};

// Remove team member from project
export const removeTeamMember = async (memberId) => {
  const response = await axiosInstance.post(`/users/team/remove`, {memberId});
  return response.data;
};
