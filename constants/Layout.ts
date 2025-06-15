/**
 * Layout constants for screen dimensions and component sizing
 * Used to ensure consistent sizing across the application
 */
import { Dimensions } from 'react-native';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Layout constants
 */
export const Layout = {
  // Screen dimensions
  screenWidth,
  screenHeight,
  
  // Book card sizing
  bookCard: {
    width: (screenWidth - 48) / 3, // 3 columns with margins
    height: 200,
  },
  
  // Book cover sizing
  bookCover: {
    width: '100%',
    height: 120,
  },
  
  // Content padding
  contentPadding: 16,
  
  // Screen edge padding
  screenPadding: {
    horizontal: 16,
    vertical: 16,
  },
};