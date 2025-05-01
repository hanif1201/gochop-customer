import api from "./index";

/**
 * Restaurant API service
 * Handles all restaurant related API requests
 */
const restaurantAPI = {
  /**
   * Get all restaurants with filtering
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise} - API response
   */
  getRestaurants: async (params = {}) => {
    try {
      const response = await api.get("/restaurants", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Get restaurants near a location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} distance - Distance in kilometers
   * @returns {Promise} - API response
   */
  getNearbyRestaurants: async (lat, lng, distance = 10) => {
    try {
      const params = {
        near: `${lat},${lng}`,
        distance,
      };
      const response = await api.get("/restaurants", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Get restaurants by cuisine type
   * @param {string|Array} cuisineType - Cuisine type(s)
   * @returns {Promise} - API response
   */
  getRestaurantsByCuisine: async (cuisineType) => {
    try {
      const cuisine = Array.isArray(cuisineType)
        ? cuisineType.join(",")
        : cuisineType;

      const params = { cuisine };
      const response = await api.get("/restaurants", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Get a single restaurant by ID
   * @param {string} id - Restaurant ID
   * @returns {Promise} - API response
   */
  getRestaurant: async (id) => {
    try {
      const response = await api.get(`/restaurants/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Get restaurant menu
   * @param {string} id - Restaurant ID
   * @returns {Promise} - API response
   */
  getRestaurantMenu: async (id) => {
    try {
      const response = await api.get(`/restaurants/${id}/menu`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Search restaurants
   * @param {string} query - Search query
   * @returns {Promise} - API response
   */
  searchRestaurants: async (query) => {
    try {
      const params = {
        select: "name,cuisineType,averageRating",
        sort: "-averageRating",
        name: query,
      };
      const response = await api.get("/restaurants", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default restaurantAPI;
