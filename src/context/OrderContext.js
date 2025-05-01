import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import orderAPI from "../api/orders";
import { AuthContext } from "./AuthContext";
import { CartContext } from "./CartContext";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);

  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  // Load active order from storage when app starts
  useEffect(() => {
    if (isAuthenticated) {
      loadActiveOrder();
      fetchRecentOrders();
    }
  }, [isAuthenticated]);

  // Load active order from AsyncStorage
  const loadActiveOrder = async () => {
    try {
      const savedOrderId = await AsyncStorage.getItem("activeOrderId");
      if (savedOrderId) {
        setActiveOrderId(savedOrderId);
        fetchOrderDetails(savedOrderId);
      }
    } catch (error) {
      console.error("Error loading active order from storage:", error);
    }
  };

  // Save active order to AsyncStorage
  const saveActiveOrder = async (orderId) => {
    try {
      if (orderId) {
        await AsyncStorage.setItem("activeOrderId", orderId);
      } else {
        await AsyncStorage.removeItem("activeOrderId");
      }
    } catch (error) {
      console.error("Error saving active order to storage:", error);
    }
  };

  // Create a new order
  const createOrder = async (orderData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderAPI.createOrder(orderData);
      if (response.success) {
        setCurrentOrder(response.data);
        setActiveOrderId(response.data._id);
        saveActiveOrder(response.data._id);

        // Clear the cart after successful order
        clearCart();

        Toast.show({
          type: "success",
          text1: "Order Placed",
          text2: "Your order has been placed successfully",
        });

        return { success: true, orderId: response.data._id };
      }
    } catch (err) {
      setError(err.message || "Failed to place order");
      Toast.show({
        type: "error",
        text1: "Order Failed",
        text2: err.message || "Please try again",
      });
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's recent orders
  const fetchRecentOrders = async (limit = 5) => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await orderAPI.getMyOrders({ limit });
      if (response.success) {
        setRecentOrders(response.data);
      }
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all orders for the user
  const fetchAllOrders = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await orderAPI.getMyOrders();
      if (response.success) {
        setOrders(response.data);
        return { success: true, orders: response.data };
      }
    } catch (err) {
      setError(err.message || "Failed to fetch orders");
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch details of a specific order
  const fetchOrderDetails = async (orderId) => {
    if (!orderId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await orderAPI.getOrder(orderId);
      if (response.success) {
        // If this is the active order, update the current order state
        if (orderId === activeOrderId) {
          setCurrentOrder(response.data);
        }
        return { success: true, order: response.data };
      }
    } catch (err) {
      setError(err.message || "Failed to fetch order details");
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Track an order (real-time updates)
  const trackOrder = async (orderId) => {
    if (!orderId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await orderAPI.trackOrder(orderId);
      if (response.success) {
        return { success: true, tracking: response.data };
      }
    } catch (err) {
      setError(err.message || "Failed to track order");
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Rate an order
  const rateOrder = async (orderId, ratingData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderAPI.rateOrder(orderId, ratingData);
      if (response.success) {
        // Update the order in the state
        fetchOrderDetails(orderId);

        Toast.show({
          type: "success",
          text1: "Rating Submitted",
          text2: "Thank you for your feedback",
        });

        return { success: true };
      }
    } catch (err) {
      setError(err.message || "Failed to submit rating");
      Toast.show({
        type: "error",
        text1: "Rating Failed",
        text2: err.message || "Please try again",
      });
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel an order
  const cancelOrder = async (orderId, cancellationReason) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderAPI.cancelOrder(orderId, {
        cancellationReason,
      });
      if (response.success) {
        // Update the order in the state
        fetchOrderDetails(orderId);

        // If this is the active order, clear it
        if (orderId === activeOrderId) {
          setActiveOrderId(null);
          setCurrentOrder(null);
          saveActiveOrder(null);
        }

        Toast.show({
          type: "success",
          text1: "Order Cancelled",
          text2: "Your order has been cancelled",
        });

        return { success: true };
      }
    } catch (err) {
      setError(err.message || "Failed to cancel order");
      Toast.show({
        type: "error",
        text1: "Cancellation Failed",
        text2: err.message || "Please try again",
      });
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Check if an order is completed (delivered or cancelled)
  const isOrderCompleted = (order) => {
    if (!order) return false;
    return order.status === "delivered" || order.status === "cancelled";
  };

  // Clear active order when completed
  const clearActiveOrderIfCompleted = async () => {
    if (currentOrder && isOrderCompleted(currentOrder)) {
      setActiveOrderId(null);
      setCurrentOrder(null);
      saveActiveOrder(null);
    }
  };

  // Setup order status listener (could be implemented with WebSockets or polling)
  const setupOrderStatusListener = (orderId) => {
    // This is a placeholder for real-time order status updates
    // In a real app, you would use WebSockets or push notifications
    let interval;

    const startPolling = () => {
      // Poll for order updates every 30 seconds
      interval = setInterval(async () => {
        const result = await fetchOrderDetails(orderId);
        if (result && result.success && isOrderCompleted(result.order)) {
          clearInterval(interval);
          clearActiveOrderIfCompleted();
        }
      }, 30000);
    };

    startPolling();

    // Return cleanup function
    return () => {
      if (interval) clearInterval(interval);
    };
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        recentOrders,
        currentOrder,
        activeOrderId,
        isLoading,
        error,
        createOrder,
        fetchAllOrders,
        fetchOrderDetails,
        fetchRecentOrders,
        trackOrder,
        rateOrder,
        cancelOrder,
        setupOrderStatusListener,
        isOrderCompleted,
        clearActiveOrderIfCompleted,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContext;
