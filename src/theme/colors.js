// Define the application color palette

// Base colors
const primaryBase = "#FF5722"; // Orange
const secondaryBase = "#4CAF50"; // Green
const accentBase = "#2196F3"; // Blue

// Neutral colors
const white = "#FFFFFF";
const black = "#000000";
const gray = {
  50: "#FAFAFA",
  100: "#F5F5F5",
  200: "#EEEEEE",
  300: "#E0E0E0",
  400: "#BDBDBD",
  500: "#9E9E9E",
  600: "#757575",
  700: "#616161",
  800: "#424242",
  900: "#212121",
};

// Status colors
const success = "#4CAF50"; // Green
const warning = "#FFC107"; // Amber
const error = "#F44336"; // Red
const info = "#2196F3"; // Blue

// Export colors for both light and dark themes
export default {
  // Common colors that don't change with theme
  white,
  black,
  gray,

  // Light theme colors
  primaryLight: primaryBase,
  primaryLightVariant: "#E64A19", // Darker orange
  secondaryLight: secondaryBase,
  accentLight: accentBase,
  backgroundLight: white,
  cardLight: white,
  textLight: gray[900],
  borderLight: gray[300],
  notificationLight: error,
  errorLight: error,
  successLight: success,
  warningLight: warning,
  infoLight: info,
  placeholderLight: gray[500],
  overlayLight: "rgba(0, 0, 0, 0.5)",

  // Dark theme colors
  primaryDark: "#FF7043", // Lighter orange for dark theme
  primaryDarkVariant: "#FF8A65", // Even lighter orange
  secondaryDark: "#66BB6A", // Lighter green
  accentDark: "#42A5F5", // Lighter blue
  backgroundDark: "#121212", // Material dark background
  cardDark: "#1E1E1E",
  textDark: gray[100],
  borderDark: gray[700],
  notificationDark: "#EF5350", // Lighter red
  errorDark: "#EF5350",
  successDark: "#66BB6A",
  warningDark: "#FFCA28",
  infoDark: "#42A5F5",
  placeholderDark: gray[600],
  overlayDark: "rgba(0, 0, 0, 0.7)",
};
