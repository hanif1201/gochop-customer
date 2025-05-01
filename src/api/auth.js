import api from "./index";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Auth API service
 * Handles all authentication related API requests
 */
const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - API response
   */
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      if (response.data.success && response.data.token) {
        await AsyncStorage.setItem("auth_token", response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Login a user
   * @param {Object} credentials - User login credentials
   * @returns {Promise} - API response
   */
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      if (response.data.success && response.data.token) {
        await AsyncStorage.setItem("auth_token", response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Logout the current user
   * @returns {Promise} - API response
   */
  logout: async () => {
    try {
      const response = await api.get("/auth/logout");
      await AsyncStorage.removeItem("auth_token");
      return response.data;
    } catch (error) {
      await AsyncStorage.removeItem("auth_token");
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Get the current user profile
   * @returns {Promise} - API response
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise} - API response
   */
  updateProfile: async (userData) => {
    try {
      const response = await api.put("/auth/updatedetails", userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Update user password
   * @param {Object} passwordData - Password update data
   * @returns {Promise} - API response
   */
  updatePassword: async (passwordData) => {
    try {
      const response = await api.put("/auth/updatepassword", passwordData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Request password reset
   * @param {Object} email - User email
   * @returns {Promise} - API response
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgotpassword", { email });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token from email
   * @param {Object} passwordData - New password data
   * @returns {Promise} - API response
   */
  resetPassword: async (token, passwordData) => {
    try {
      const response = await api.put(
        `/auth/resetpassword/${token}`,
        passwordData
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>} - Is authenticated
   */
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      return !!token;
    } catch (error) {
      return false;
    }
  },
};

export default authAPI;
