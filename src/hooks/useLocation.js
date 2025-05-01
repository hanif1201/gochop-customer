import { useState, useEffect } from "react";
import * as Location from "expo-location";

/**
 * Custom hook to handle location functionality
 * @param {Object} options Configuration options
 * @param {boolean} options.autoRequest Automatically request permissions on mount
 * @returns {Object} Location data and methods
 */
const useLocation = (options = { autoRequest: true }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Request location permissions
  const requestPermissions = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        setHasPermission(true);

        // Get current position once permission is granted
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setLocation(location);
        } catch (error) {
          setErrorMsg("Could not get your location");
          console.error("Error getting location:", error);
        }
      } else {
        setHasPermission(false);
        setErrorMsg("Permission to access location was denied");
      }
    } catch (error) {
      setErrorMsg("Error requesting location permissions");
      console.error("Error requesting permissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current position
  const getCurrentPosition = async () => {
    if (!hasPermission) {
      await requestPermissions();
      return;
    }

    setIsLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(location);
    } catch (error) {
      setErrorMsg("Could not get your location");
      console.error("Error getting location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get address from coordinates (reverse geocoding)
  const getAddressFromCoordinates = async (latitude, longitude) => {
    setIsLoading(true);
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      return results;
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get coordinates from address (forward geocoding)
  const getCoordinatesFromAddress = async (address) => {
    setIsLoading(true);
    try {
      const results = await Location.geocodeAsync(address);
      return results;
    } catch (error) {
      console.error("Error geocoding address:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-request permissions on mount if enabled
  useEffect(() => {
    if (options.autoRequest) {
      requestPermissions();
    }
  }, []);

  return {
    location,
    errorMsg,
    isLoading,
    hasPermission,
    requestPermissions,
    getCurrentPosition,
    getAddressFromCoordinates,
    getCoordinatesFromAddress,
  };
};

export default useLocation;
