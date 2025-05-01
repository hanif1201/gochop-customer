import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authAPI from "../api/auth";
import Toast from "react-native-toast-message";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if the user is logged in on app start
  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  // Check if the user is authenticated
  const checkUserLoggedIn = async () => {
    setIsLoading(true);
    try {
      const isAuth = await authAPI.isAuthenticated();
      if (isAuth) {
        const userData = await authAPI.getCurrentUser();
        if (userData.success) {
          setUser(userData.data);
          setIsAuthenticated(true);
        } else {
          // Token is present but user data can't be fetched
          await AsyncStorage.removeItem("auth_token");
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      setError(err.message || "Failed to check authentication status");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Register a new user
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(userData);
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        Toast.show({
          type: "success",
          text1: "Registration Successful",
          text2: "Welcome to GoChop!",
        });
        return { success: true };
      }
    } catch (err) {
      setError(err.message || "Registration failed");
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: err.message || "Please try again",
      });
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.login(credentials);
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        Toast.show({
          type: "success",
          text1: "Login Successful",
          text2: `Welcome back, ${response.user.name}!`,
        });
        return { success: true };
      }
    } catch (err) {
      setError(err.message || "Login failed");
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: err.message || "Please check your credentials",
      });
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
      setUser(null);
      setIsAuthenticated(false);
      Toast.show({
        type: "success",
        text1: "Logout Successful",
        text2: "You have been logged out",
      });
      return { success: true };
    } catch (err) {
      // Even if the API call fails, we still want to log out locally
      setUser(null);
      setIsAuthenticated(false);
      Toast.show({
        type: "info",
        text1: "Logged Out",
        text2: "You have been logged out",
      });
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.updateProfile(userData);
      if (response.success) {
        setUser(response.data);
        Toast.show({
          type: "success",
          text1: "Profile Updated",
          text2: "Your profile has been updated successfully",
        });
        return { success: true };
      }
    } catch (err) {
      setError(err.message || "Failed to update profile");
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: err.message || "Please try again",
      });
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.forgotPassword(email);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Password Reset Sent",
          text2: "Check your email for instructions",
        });
        return { success: true };
      }
    } catch (err) {
      setError(err.message || "Failed to send password reset");
      Toast.show({
        type: "error",
        text1: "Password Reset Failed",
        text2: err.message || "Please try again",
      });
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (token, passwordData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.resetPassword(token, passwordData);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Password Reset Successful",
          text2: "You can now login with your new password",
        });
        return { success: true };
      }
    } catch (err) {
      setError(err.message || "Failed to reset password");
      Toast.show({
        type: "error",
        text1: "Password Reset Failed",
        text2: err.message || "Please try again",
      });
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        register,
        login,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
        checkUserLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
