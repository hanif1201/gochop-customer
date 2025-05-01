import colors from "./colors";
import fonts from "./fonts";
import metrics from "./metrics";

// Light theme configuration
export const lightTheme = {
  dark: false,
  colors: {
    primary: colors.primaryLight,
    background: colors.backgroundLight,
    card: colors.cardLight,
    text: colors.textLight,
    border: colors.borderLight,
    notification: colors.notificationLight,
    error: colors.errorLight,
    success: colors.successLight,
    warning: colors.warningLight,
    info: colors.infoLight,
    accent: colors.accentLight,
    placeholder: colors.placeholderLight,
    white: colors.white,
    black: colors.black,
    gray: colors.gray,
    overlay: colors.overlayLight,
  },
  fonts,
  metrics,
};

// Dark theme configuration
export const darkTheme = {
  dark: true,
  colors: {
    primary: colors.primaryDark,
    background: colors.backgroundDark,
    card: colors.cardDark,
    text: colors.textDark,
    border: colors.borderDark,
    notification: colors.notificationDark,
    error: colors.errorDark,
    success: colors.successDark,
    warning: colors.warningDark,
    info: colors.infoDark,
    accent: colors.accentDark,
    placeholder: colors.placeholderDark,
    white: colors.white,
    black: colors.black,
    gray: colors.gray,
    overlay: colors.overlayDark,
  },
  fonts,
  metrics,
};

export default { lightTheme, darkTheme };
