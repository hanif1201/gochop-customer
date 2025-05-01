import { Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

// Metrics used for spacing, sizing, and layout
const metrics = {
  // Screen dimensions
  screenWidth: width,
  screenHeight: height,

  // Margin sizes
  marginTiny: 4,
  marginSmall: 8,
  marginRegular: 16,
  marginMedium: 24,
  marginLarge: 32,
  marginXLarge: 40,

  // Padding sizes
  paddingTiny: 4,
  paddingSmall: 8,
  paddingRegular: 16,
  paddingMedium: 24,
  paddingLarge: 32,
  paddingXLarge: 40,

  // Border radius
  borderRadiusTiny: 4,
  borderRadiusSmall: 8,
  borderRadiusRegular: 12,
  borderRadiusMedium: 16,
  borderRadiusLarge: 24,
  borderRadiusXLarge: 32,
  borderRadiusCircle: 100,

  // Spacing for lists
  listItemSpacing: 16,
  listHeaderSpacing: 24,
  listSectionSpacing: 32,

  // Icon sizes
  iconTiny: 12,
  iconSmall: 16,
  iconRegular: 24,
  iconMedium: 32,
  iconLarge: 40,
  iconXLarge: 48,

  // Button sizes
  buttonHeight: 48,
  buttonHeightSmall: 36,
  buttonHeightLarge: 56,
  buttonRadius: 8,

  // Input field sizes
  inputHeight: 48,
  inputRadius: 8,

  // Card metrics
  cardRadius: 16,
  cardElevation: 4,

  // Platform specific values
  navBarHeight: Platform.OS === "ios" ? 64 : 56,
  statusBarHeight: Platform.OS === "ios" ? 20 : 0,
  tabBarHeight: 56,

  // Bottom area inset for iPhone X style devices
  bottomInset: Platform.OS === "ios" ? 34 : 0,

  // Dimensions for responsive layouts
  isSmallDevice: width < 375,
  isLargeDevice: width >= 768,
};

export default metrics;
