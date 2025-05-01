import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base API configuration
const API_URL = "http://localhost:5000/api"; // Change this to your actual API URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add a request interceptor to attach the auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting token from storage:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle unauthorized errors (401)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // Clear token and trigger auth flow in the app
      await AsyncStorage.removeItem("auth_token");

      // This will be caught by the context provider
      return Promise.reject(new Error("auth_error"));
    }

    return Promise.reject(error);
  }
);

export default api;
