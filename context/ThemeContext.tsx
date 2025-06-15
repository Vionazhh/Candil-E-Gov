import { ColorTheme, ThemeColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { Dimensions, useColorScheme } from 'react-native';

// Theme mode options
export type ThemeMode = 'light' | 'dark' | 'system';

// Window dimensions
export interface WindowDimensions {
  width: number;
  height: number;
}

// Layout information
export interface ThemeLayout {
  window: WindowDimensions;
  isSmallDevice: boolean;
}

// Complete theme definition
export interface AppTheme {
  colors: typeof ThemeColors['light'] | typeof ThemeColors['dark'];
  typography: typeof Typography;
  spacing: typeof Spacing;
  layout: ThemeLayout;
  mode: ThemeMode;
  colorScheme: ColorTheme;
}

// Theme context interface
interface ThemeContextType {
  theme: AppTheme;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

// State type
interface ThemeState {
  mode: ThemeMode;
  systemColorScheme: ColorTheme;
  layout: ThemeLayout;
}

// Action types
type ThemeAction =
  | { type: 'SET_THEME_MODE'; payload: ThemeMode }
  | { type: 'SET_SYSTEM_COLOR_SCHEME'; payload: ColorTheme }
  | { type: 'UPDATE_LAYOUT'; payload: Partial<ThemeLayout> };

// Initial state
const initialLayout: ThemeLayout = {
  window: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  isSmallDevice: Dimensions.get('window').width < 375,
};

const initialState: ThemeState = {
  mode: 'system',
  systemColorScheme: 'light',
  layout: initialLayout,
};

// Reducer function
function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'SET_THEME_MODE':
      return { ...state, mode: action.payload };
    case 'SET_SYSTEM_COLOR_SCHEME':
      return { ...state, systemColorScheme: action.payload };
    case 'UPDATE_LAYOUT':
      return { ...state, layout: { ...state.layout, ...action.payload } };
    default:
      return state;
  }
}

// Create context with a more defined default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Determines the effective color scheme based on theme mode and system preference
 */
function getEffectiveColorScheme(mode: ThemeMode, systemScheme: ColorTheme): ColorTheme {
  return mode === 'system' ? systemScheme : mode as ColorTheme;
}

/**
 * Creates a complete theme based on color scheme
 */
function createTheme(state: ThemeState): AppTheme {
  const colorScheme = getEffectiveColorScheme(state.mode, state.systemColorScheme);
  
  return {
    colors: ThemeColors[colorScheme],
    typography: Typography,
    spacing: Spacing,
    layout: state.layout,
    mode: state.mode,
    colorScheme,
  };
}

/**
 * Provider component for theme-related state
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get the system color scheme
  const systemColorScheme = useColorScheme() ?? 'light';
  
  // Use reducer for state management
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Update system color scheme when it changes
  useEffect(() => {
    dispatch({ 
      type: 'SET_SYSTEM_COLOR_SCHEME', 
      payload: systemColorScheme as ColorTheme
    });
  }, [systemColorScheme]);

  // Update layout dimensions when they change
  useEffect(() => {
    const handleDimensionsChange = ({ window }: { window: WindowDimensions }) => {
      dispatch({
        type: 'UPDATE_LAYOUT',
        payload: {
          window,
          isSmallDevice: window.width < 375,
        },
      });
    };

    const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

    return () => {
      subscription.remove();
    };
  }, []);

  // Set theme mode
  const setThemeMode = useCallback((mode: ThemeMode) => {
    dispatch({ type: 'SET_THEME_MODE', payload: mode });
  }, []);

  // Toggle between light, dark, and system modes
  const toggleTheme = useCallback(() => {
    dispatch({
      type: 'SET_THEME_MODE',
      payload: state.mode === 'light' 
        ? 'dark' 
        : state.mode === 'dark' 
          ? 'system' 
          : 'light',
    });
  }, [state.mode]);

  // Memoize the theme to prevent unnecessary re-renders
  const theme = useMemo(() => createTheme(state), [state]);

  // Context value
  const value = useMemo(() => ({
    theme,
    setThemeMode,
    toggleTheme,
  }), [theme, setThemeMode, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook for accessing theme context
 * @throws Error if used outside of ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}; 