import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { lightTheme, darkTheme } from "../theme";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(lightTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from storage when app starts
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Set up device theme change listener
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (syncWithDevice) {
        handleThemeChange(colorScheme === "dark");
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Track if theme should sync with device settings
  const [syncWithDevice, setSyncWithDevice] = useState(true);

  // Load user's theme preference
  const loadThemePreference = async () => {
    try {
      const savedThemePreference = await AsyncStorage.getItem(
        "themePreference"
      );
      const savedSyncSetting = await AsyncStorage.getItem("syncWithDevice");

      // Set sync preference
      if (savedSyncSetting !== null) {
        setSyncWithDevice(savedSyncSetting === "true");
      }

      if (savedSyncSetting === "true" || savedSyncSetting === null) {
        // Use device setting
        const colorScheme = Appearance.getColorScheme();
        handleThemeChange(colorScheme === "dark");
      } else if (savedThemePreference !== null) {
        // Use saved setting
        handleThemeChange(savedThemePreference === "dark");
      } else {
        // Default to light mode
        handleThemeChange(false);
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
      // Default to light mode
      handleThemeChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Save theme preference
  const saveThemePreference = async (isDark, sync) => {
    try {
      await AsyncStorage.setItem("themePreference", isDark ? "dark" : "light");
      await AsyncStorage.setItem("syncWithDevice", String(sync));
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  // Handle theme change
  const handleThemeChange = (isDark) => {
    setIsDarkMode(isDark);
    setTheme(isDark ? darkTheme : lightTheme);
  };

  // Toggle theme
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    handleThemeChange(newMode);
    // If manually changed, don't sync with device
    setSyncWithDevice(false);
    saveThemePreference(newMode, false);
  };

  // Toggle sync with device setting
  const toggleSync = () => {
    const newSyncValue = !syncWithDevice;
    setSyncWithDevice(newSyncValue);

    if (newSyncValue) {
      // If turning sync on, immediately sync with device
      const colorScheme = Appearance.getColorScheme();
      handleThemeChange(colorScheme === "dark");
    }

    saveThemePreference(isDarkMode, newSyncValue);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        isLoading,
        syncWithDevice,
        toggleTheme,
        toggleSync,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
