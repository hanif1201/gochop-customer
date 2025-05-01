import api from "./index";

/**
 * Menu API service
 * Handles all menu related API requests
 */
const menuAPI = {
  /**
   * Get all menu items with filtering
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise} - API response
   */
  getMenuItems: async (params = {}) => {
    try {
      const response = await api.get("/menu", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Get menu items for a specific restaurant
   * @param {string} restaurantId - Restaurant ID
   * @returns {Promise} - API response
   */
  getRestaurantMenuItems: async (restaurantId) => {
    try {
      const params = { restaurant: restaurantId };
      const response = await api.get("/menu", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Get menu items by category
   * @param {string} restaurantId - Restaurant ID
   * @param {string|Array} category - Category or categories
   * @returns {Promise} - API response
   */
  getMenuItemsByCategory: async (restaurantId, category) => {
    try {
      const categoryParam = Array.isArray(category)
        ? category.join(",")
        : category;

      const params = {
        restaurant: restaurantId,
        category: categoryParam,
      };

      const response = await api.get("/menu", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Get a single menu item by ID
   * @param {string} id - Menu item ID
   * @returns {Promise} - API response
   */
  getMenuItem: async (id) => {
    try {
      const response = await api.get(`/menu/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Get featured menu items for a restaurant
   * @param {string} restaurantId - Restaurant ID
   * @returns {Promise} - API response
   */
  getFeaturedMenuItems: async (restaurantId) => {
    try {
      const params = {
        restaurant: restaurantId,
        featured: true,
      };
      const response = await api.get("/menu", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default menuAPI;
