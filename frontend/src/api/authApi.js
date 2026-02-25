import axiosInstance from "./axiosConfig";

export const authService = {

  register: async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axiosInstance.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  // ADD THIS
  verifyOTP: async (data) => {
    const response = await axiosInstance.post("/auth/verify-otp", data);
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await axiosInstance.post("/auth/reset-password", data);
    return response.data;
  },
};

export default authService;