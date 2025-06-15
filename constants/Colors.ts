/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

/**
 * Color constants for the application
 * Organized by theme and screen-specific colors
 */

// Theme base colors
export type ColorTheme = 'light' | 'dark';

// Common colors that are theme-independent
export const CommonColors = {
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
  
  // Primary color and shades
  primary: '#1E88E5',
  primaryDark: '#1565C0',
  primaryLight: '#90CAF9',
  
  // Grayscale
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Feedback colors
  success: '#2ECC71',
  error: '#E53935',
  warning: '#FFB300',
  info: '#0A7EA4',
};

// Theme-specific colors
export const ThemeColors = {
  light: {
    text: CommonColors.gray900,
    textSecondary: CommonColors.gray700,
    background: CommonColors.white,
    card: CommonColors.white,
    border: CommonColors.gray300,
    tint: CommonColors.primary,
    icon: CommonColors.gray600,
    tabIconDefault: CommonColors.gray600,
    tabIconSelected: CommonColors.primary,
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#151718',
    card: '#1E1F20',
    border: '#2C2D2E',
    tint: CommonColors.white,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: CommonColors.white,
  },
};

// Screen-specific colors
export const ScreenColors = {
  home: {
    background: CommonColors.gray50,
    card: CommonColors.white,
    bannerBackground: CommonColors.primary,
    bannerText: CommonColors.white,
    readerPink: '#FF6B9D',
    readerYellow: '#FFD93D',
    readerPurple: '#A8A3FF',
    readerGreen: '#4ECDC4',
    readerOrange: '#FF6B6B',
    categoryBackground: CommonColors.white,
    categoryBorder: CommonColors.gray300,
    categoryText: CommonColors.gray900,
    categoryArrow: CommonColors.gray400,
  },
  category: {
    primary: CommonColors.primary,
    background: CommonColors.white,
    cardBackground: CommonColors.white,
    text: CommonColors.gray900,
    textSecondary: CommonColors.gray600,
    border: CommonColors.gray300,
    shadow: CommonColors.black,
  },
  book: {
    primary: CommonColors.primary,
    background: CommonColors.gray100,
    cardBackground: CommonColors.white,
    text: CommonColors.gray900,
    textSecondary: CommonColors.gray600,
    textLight: CommonColors.gray500,
    border: CommonColors.gray300,
    shadow: CommonColors.black,
    overlay: 'rgba(0, 0, 0, 0.3)',
  },
};

// Combined exports for backward compatibility
export const Colors = {
  ...CommonColors,
  light: ThemeColors.light,
  dark: ThemeColors.dark,
};

export const HomeScreenColors = ScreenColors.home;
export const CategoryScreenColors = ScreenColors.category;
export const CategoryItemScreenColors = ScreenColors.book;