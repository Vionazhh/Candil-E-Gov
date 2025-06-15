import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { Platform } from 'react-native';

/**
 * App-wide theme configuration
 * Centralizes theme values for consistent styling
 */
export const theme = {
  // Colors based on light/dark mode
  colors: {
    // Light theme colors (default)
    light: {
      ...Colors.light,
    },
    
    // Dark theme colors
    dark: {
      ...Colors.dark,
    },
  },
  
  // Typography settings
  typography: {
    ...Typography,
    
    // Font family based on platform
    fontFamily: {
      ...Typography.fontFamily,
      default: Platform.select({
        ios: 'Inter-Regular',
        android: 'Inter-Regular',
        web: 'Inter, system-ui, sans-serif',
      }),
    },
  },
  
  // Spacing values
  spacing: {
    ...Spacing,
  },
  
  // Border radius values
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    circle: 9999,
  },
  
  // Elevation values (for Android shadows)
  elevation: {
    none: 0,
    xs: 1,
    sm: 2,
    md: 4,
    lg: 8,
    xl: 16,
  },
  
  // Shadow values (for iOS shadows)
  shadow: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
    },
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
  },
};

// Default export
export default theme; 