// Font configuration for the application

// Font family names
const fontFamily = {
  regular: "System",
  medium: "System",
  light: "System",
  bold: "System",
};

// Base font sizes
const size = {
  tiny: 10,
  small: 12,
  medium: 14,
  regular: 16,
  large: 18,
  xlarge: 20,
  xxlarge: 22,
  heading: 24,
  subheading: 20,
  title: 28,
  subtitle: 18,
  button: 16,
};

// Font weights
const weight = {
  light: "300",
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  heavy: "800",
};

// Line heights
const lineHeight = {
  tiny: 14,
  small: 18,
  medium: 20,
  regular: 24,
  large: 26,
  xlarge: 28,
  xxlarge: 30,
  heading: 32,
  subheading: 28,
  title: 34,
  subtitle: 26,
};

// Create pre-configured text styles
const style = {
  heading: {
    fontFamily: fontFamily.bold,
    fontSize: size.heading,
    fontWeight: weight.bold,
    lineHeight: lineHeight.heading,
  },
  subheading: {
    fontFamily: fontFamily.medium,
    fontSize: size.subheading,
    fontWeight: weight.semibold,
    lineHeight: lineHeight.subheading,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: size.title,
    fontWeight: weight.bold,
    lineHeight: lineHeight.title,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: size.subtitle,
    fontWeight: weight.medium,
    lineHeight: lineHeight.subtitle,
  },
  regular: {
    fontFamily: fontFamily.regular,
    fontSize: size.regular,
    fontWeight: weight.regular,
    lineHeight: lineHeight.regular,
  },
  small: {
    fontFamily: fontFamily.regular,
    fontSize: size.small,
    fontWeight: weight.regular,
    lineHeight: lineHeight.small,
  },
  button: {
    fontFamily: fontFamily.medium,
    fontSize: size.button,
    fontWeight: weight.medium,
    lineHeight: lineHeight.regular,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: size.small,
    fontWeight: weight.regular,
    lineHeight: lineHeight.small,
  },
};

export default {
  family: fontFamily,
  size,
  weight,
  lineHeight,
  style,
};
