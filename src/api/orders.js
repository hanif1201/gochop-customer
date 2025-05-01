import api from "./index";

/**
 * Orders API service
 * Handles all order related API requests
 */
const orderAPI = {
  /**
   * Get all orders for the current user
   * @param {Object} params - Query parameters for pagination
   * @returns {Promise} - API response
   */
  getMyOrders: async (params = {}) => {
    try {
      const response = await api.get("/orders/myorders", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Get a single order by ID
   * @param {string} id - Order ID
   * @returns {Promise} - API response
   */
  getOrder: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise} - API response
   */
  createOrder: async (orderData) => {
    try {
      const response = await api.post("/orders", orderData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Rate an order (restaurant and rider)
   * @param {string} id - Order ID
   * @param {Object} ratingData - Rating data
   * @returns {Promise} - API response
   */
  rateOrder: async (id, ratingData) => {
    try {
      const response = await api.post(`/orders/${id}/rate`, ratingData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Get order tracking information
   * @param {string} id - Order ID
   * @returns {Promise} - API response with tracking details
   */
  trackOrder: async (id) => {
    try {
      // This is a custom endpoint that would need to be added to your backend
      // It would combine order details with rider location
      const response = await api.get(`/orders/${id}/track`);
      return response.data;
    } catch (error) {
      // If the endpoint doesn't exist, implement it with existing endpoints
      try {
        const orderResponse = await api.get(`/orders/${id}`);
        return {
          success: true,
          data: {
            order: orderResponse.data.data,
            // Rider tracking would be handled separately if needed
          },
        };
      } catch (innerError) {
        throw innerError.response ? innerError.response.data : innerError;
      }
    }
  },

  /**
   * Cancel an order
   * @param {string} id - Order ID
   * @param {Object} cancellationData - Cancellation reason
   * @returns {Promise} - API response
   */
  cancelOrder: async (id, cancellationData) => {
    try {
      // This assumes your backend has a cancel endpoint
      // If not, you might need to update the order status through another endpoint
      const response = await api.post(`/orders/${id}/cancel`, cancellationData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default orderAPI;
