/**
 * Configuration settings for the book reader
 */

// Font settings type for reader
export interface FontSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
}

// Theme options for reader
export enum ReaderTheme {
  LIGHT = 'light',
  DARK = 'dark',
  SEPIA = 'sepia',
}

// Reader configuration object
export const ReaderConfig = {
  // Default font settings
  defaultFontSettings: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 1.5,
  } as FontSettings,
  
  // Font size limits
  minFontSize: 12,
  maxFontSize: 24,
  
  // Theme settings
  themes: {
    [ReaderTheme.LIGHT]: {
      background: '#FFFFFF',
      text: '#333333',
    },
    [ReaderTheme.DARK]: {
      background: '#121212',
      text: '#E0E0E0',
    },
    [ReaderTheme.SEPIA]: {
      background: '#F8F1E3',
      text: '#5B4636',
    },
  },
  
  // Default theme
  defaultTheme: ReaderTheme.LIGHT,
  
  // Animation settings
  animations: {
    pageTransitionDuration: 300, // in ms
  },
  
  // Reading settings
  readingSettings: {
    autoSaveInterval: 10000, // in ms
    scrollThreshold: 0.95, // threshold for completion (0-1)
  },
}; 