import api from "./index";

/**
 * User API service
 * Handles all user profile related API requests
 */
const userAPI = {
  /**
   * Add a new address to user profile
   * @param {Object} addressData - Address data
   * @returns {Promise} - API response
   */
  addAddress: async (addressData) => {
    try {
      const response = await api.post("/users/addresses", addressData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Remove an address from user profile
   * @param {string} addressId - Address ID
   * @returns {Promise} - API response
   */
  removeAddress: async (addressId) => {
    try {
      const response = await api.delete(`/users/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Get the current user profile
   * @returns {Promise} - API response
   */
  getUserProfile: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Update user profile
   * @param {Object} userData - User profile data
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
   * Upload profile image
   * @param {FormData} formData - Form data with image
   * @returns {Promise} - API response
   */
  uploadProfileImage: async (formData) => {
    try {
      const response = await api.post("/users/upload-profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Get saved addresses
   * @returns {Promise} - API response with user's saved addresses
   */
  getSavedAddresses: async () => {
    try {
      // Usually this would be a separate endpoint, but in this case
      // we'll get it from the user profile since that contains the addresses
      const response = await api.get("/auth/me");
      return {
        success: true,
        data: response.data.data.savedAddresses || [],
      };
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default userAPI;
