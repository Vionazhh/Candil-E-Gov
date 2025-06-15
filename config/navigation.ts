import { CommonColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

/**
 * Configuration for main tab navigation
 */
export const tabConfig = {
  // Main tab screens configuration
  screens: [
    {
      name: 'index',
      title: 'Home',
      icon: 'home-outline',
      activeIcon: 'home',
    },
    {
      name: 'book',
      title: 'Semua Buku',
      icon: 'book-outline',
      activeIcon: 'book',
    },
    {
      name: 'borrowings',
      title: 'Peminjaman',
      icon: 'library-outline',
      activeIcon: 'library',
    },
    {
      name: 'profile',
      title: 'Profile',
      icon: 'person-outline',
      activeIcon: 'person',
    },
  ] as const,
  
  // Tab bar styling
  style: {
    backgroundColor: CommonColors.white,
    borderTopWidth: 1,
    borderTopColor: CommonColors.gray200,
    paddingTop: 5,
    paddingBottom: 5,
    height: 60,
  },
  
  // Tab bar label styling
  labelStyle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
};

/**
 * Configuration for stack navigation
 */
export const stackConfig = {
  // Main screen configuration
  screens: {
    // Auth screens
    auth: {
      login: {
        options: {
          headerShown: false,
          animation: 'slide_from_bottom',
        },
      },
      register: {
        options: {
          headerShown: false,
          animation: 'slide_from_bottom',
        },
      },
      forgotPassword: {
        options: {
          headerShown: false,
          animation: 'slide_from_bottom',
        },
      },
    },
    
    // Book screens
    books: {
      detail: {
        options: {
          headerShown: false,
          animation: 'slide_from_right',
        },
      },
      list: {
        options: {
          headerShown: false,
          animation: 'slide_from_right',
        },
      },
      category: {
        options: {
          headerShown: false,
          animation: 'slide_from_right',
        },
      },
    },
  },
  
  // Default screen options
  defaultOptions: {
    headerShown: false,
    animation: 'fade',
  },
};

/**
 * Get icon name based on route and active state
 */
export const getTabIcon = (routeName: string, focused: boolean): keyof typeof Ionicons.glyphMap => {
  const screen = tabConfig.screens.find(s => s.name === routeName);
  
  if (!screen) {
    // Default icons if screen not found
    return focused ? 'home' : 'home-outline';
  }
  
  return focused ? (screen.activeIcon as keyof typeof Ionicons.glyphMap) : (screen.icon as keyof typeof Ionicons.glyphMap);
};

/**
 * Get tab label based on route name
 */
export const getTabLabel = (routeName: string): string => {
  const screen = tabConfig.screens.find(s => s.name === routeName);
  return screen?.title || routeName;
};

export default {
  tabConfig,
  stackConfig,
  getTabIcon,
  getTabLabel,
}; 