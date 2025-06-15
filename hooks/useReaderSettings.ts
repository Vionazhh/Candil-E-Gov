import { ReaderTheme } from '@/components/ui/ReaderControls';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

// Default settings constants
export const DEFAULT_FONT_SIZE = 16;
export const DEFAULT_THEME: ReaderTheme = 'light';
export const MIN_FONT_SIZE = 12;
export const MAX_FONT_SIZE = 24;
export const DEFAULT_LINE_SPACING = 1.5;

export interface ReaderSettings {
  fontSize: number;
  theme: ReaderTheme;
  lineSpacing: number;
  enablePaging: boolean;
  scale: number;
  spacing: number;
  fontFamily?: string;
}

export const DEFAULT_SETTINGS: ReaderSettings = {
  fontSize: DEFAULT_FONT_SIZE,
  theme: DEFAULT_THEME,
  lineSpacing: DEFAULT_LINE_SPACING,
  enablePaging: true,
  scale: 1.0,
  spacing: 10,
};

const STORAGE_KEY = '@reader_settings';

/**
 * Hook to manage reader settings with persistence to AsyncStorage
 * Provides methods to update individual settings or reset to defaults
 */
export const useReaderSettings = () => {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error('Error loading reader settings:', error);
        // Fall back to defaults
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to AsyncStorage whenever they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Error saving reader settings:', error);
      }
    };

    // Don't save during initial loading
    if (!isLoading) {
      saveSettings();
    }
  }, [settings, isLoading]);

  // Update font size
  const updateFontSize = (fontSize: number) => {
    setSettings(prev => ({ ...prev, fontSize }));
  };

  // Update theme
  const updateTheme = (theme: ReaderTheme) => {
    setSettings(prev => ({ ...prev, theme }));
  };

  // Update line spacing
  const updateLineSpacing = (lineSpacing: number) => {
    setSettings(prev => ({ ...prev, lineSpacing }));
  };

  // Update font family
  const updateFontFamily = (fontFamily: string) => {
    setSettings(prev => ({ ...prev, fontFamily }));
  };

  // Toggle page turning mode
  const toggleEnablePaging = () => {
    setSettings(prev => ({ ...prev, enablePaging: !prev.enablePaging }));
  };

  // Update PDF scale
  const updateScale = (scale: number) => {
    setSettings(prev => ({ ...prev, scale }));
  };

  // Update PDF page spacing
  const updateSpacing = (spacing: number) => {
    setSettings(prev => ({ ...prev, spacing }));
  };

  // Reset settings to defaults
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  // Update multiple settings at once
  const updateSettings = (newSettings: Partial<ReaderSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return {
    settings,
    isLoading,
    updateFontSize,
    updateTheme,
    updateLineSpacing,
    updateFontFamily,
    toggleEnablePaging,
    updateScale,
    updateSpacing,
    resetSettings,
    updateSettings,
  };
};

export default useReaderSettings; 