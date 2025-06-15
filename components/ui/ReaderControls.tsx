import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define theme types for reader
export type ReaderTheme = 'light' | 'dark' | 'sepia';

interface ReaderControlsProps {
  // Font settings
  fontSize: number;
  onFontSizeChange: (fontSize: number) => void;
  minFontSize?: number;
  maxFontSize?: number;
  
  // Theme settings
  theme: ReaderTheme;
  onThemeChange: (theme: ReaderTheme) => void;
  
  // Navigation
  onNavigateBack: () => void;
  onToggleBookmark?: () => void;
  isBookmarked?: boolean;
  
  // Additional actions
  onShare?: () => void;
  onOpenTableOfContents?: () => void;
  
  // Additional settings
  lineSpacing?: number;
  onLineSpacingChange?: (spacing: number) => void;
  minLineSpacing?: number;
  maxLineSpacing?: number;
}

/**
 * Provides user controls for reading experience including font size,
 * theme selection, navigation and sharing
 */
const ReaderControls: React.FC<ReaderControlsProps> = ({
  fontSize,
  onFontSizeChange,
  minFontSize = 12,
  maxFontSize = 24,
  
  theme,
  onThemeChange,
  
  onNavigateBack,
  onToggleBookmark,
  isBookmarked,
  
  onShare,
  onOpenTableOfContents,
  
  lineSpacing = 1.5,
  onLineSpacingChange,
  minLineSpacing = 1.2,
  maxLineSpacing = 2.0,
}) => {
  // State for controls visibility
  const [controlsVisible, setControlsVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  
  // Toggle main controls
  const toggleControls = () => {
    setControlsVisible(prev => !prev);
    // Hide settings if controls are hidden
    if (settingsVisible && !controlsVisible) {
      setSettingsVisible(false);
    }
  };
  
  // Toggle settings panel
  const toggleSettings = () => {
    setSettingsVisible(prev => !prev);
  };
  
  // Handle font size change
  const handleFontSizeChange = (value: number) => {
    onFontSizeChange(value);
  };
  
  // Handle line spacing change
  const handleLineSpacingChange = (value: number) => {
    if (onLineSpacingChange) {
      onLineSpacingChange(value);
    }
  };
  
  // Handle theme changes
  const handleThemeChange = (newTheme: ReaderTheme) => {
    onThemeChange(newTheme);
  };

  // Floating button for showing/hiding controls
  const renderFloatingButton = () => (
    <TouchableOpacity 
      style={styles.floatingButton} 
      onPress={toggleControls}
      activeOpacity={0.8}
    >
      <Ionicons 
        name={controlsVisible ? "close" : "settings-outline"} 
        size={24} 
        color="white" 
      />
    </TouchableOpacity>
  );
  
  // Main controls panel
  const renderControlsPanel = () => (
    <Animated.View style={[
      styles.controlsContainer,
      { backgroundColor: theme === 'dark' ? '#333' : CommonColors.white }
    ]}>
      <View style={styles.controlsHeader}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.controlButton}>
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={theme === 'dark' ? CommonColors.white : CommonColors.gray800} 
          />
        </TouchableOpacity>
        
        <View style={styles.controlsHeaderTitle}>
          <Text style={[
            styles.controlsHeaderText,
            { color: theme === 'dark' ? CommonColors.white : CommonColors.gray800 }
          ]}>
            Reader Controls
          </Text>
        </View>
        
        <TouchableOpacity onPress={toggleControls} style={styles.controlButton}>
          <Ionicons 
            name="close" 
            size={24} 
            color={theme === 'dark' ? CommonColors.white : CommonColors.gray800} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.controlsBody}>
        <TouchableOpacity 
          style={styles.controlItem} 
          onPress={toggleSettings}
        >
          <Ionicons 
            name="text" 
            size={22} 
            color={theme === 'dark' ? CommonColors.white : CommonColors.gray800} 
          />
          <Text style={[
            styles.controlItemText,
            { color: theme === 'dark' ? CommonColors.white : CommonColors.gray800 }
          ]}>
            Text Settings
          </Text>
        </TouchableOpacity>
        
        {onToggleBookmark && (
          <TouchableOpacity 
            style={styles.controlItem} 
            onPress={onToggleBookmark}
          >
            <Ionicons 
              name={isBookmarked ? "bookmark" : "bookmark-outline"} 
              size={22} 
              color={theme === 'dark' ? CommonColors.white : CommonColors.gray800} 
            />
            <Text style={[
              styles.controlItemText,
              { color: theme === 'dark' ? CommonColors.white : CommonColors.gray800 }
            ]}>
              {isBookmarked ? "Bookmarked" : "Bookmark"}
            </Text>
          </TouchableOpacity>
        )}
        
        {onOpenTableOfContents && (
          <TouchableOpacity 
            style={styles.controlItem} 
            onPress={onOpenTableOfContents}
          >
            <Ionicons 
              name="list" 
              size={22} 
              color={theme === 'dark' ? CommonColors.white : CommonColors.gray800} 
            />
            <Text style={[
              styles.controlItemText,
              { color: theme === 'dark' ? CommonColors.white : CommonColors.gray800 }
            ]}>
              Table of Contents
            </Text>
          </TouchableOpacity>
        )}
        
        {onShare && (
          <TouchableOpacity 
            style={styles.controlItem} 
            onPress={onShare}
          >
            <Ionicons 
              name="share-outline" 
              size={22} 
              color={theme === 'dark' ? CommonColors.white : CommonColors.gray800} 
            />
            <Text style={[
              styles.controlItemText,
              { color: theme === 'dark' ? CommonColors.white : CommonColors.gray800 }
            ]}>
              Share
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
  
  // Settings modal
  const renderSettingsModal = () => (
    <Modal
      visible={settingsVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setSettingsVisible(false)}
    >
      <SafeAreaView 
        style={[
          styles.modalContainer,
          { backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)' }
        ]}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={[
              styles.modalTitle,
              { color: theme === 'dark' ? CommonColors.white : CommonColors.gray800 }
            ]}>
              Display Settings
            </Text>
            <TouchableOpacity onPress={() => setSettingsVisible(false)}>
              <Ionicons 
                name="close-circle" 
                size={24} 
                color={theme === 'dark' ? CommonColors.white : CommonColors.gray800} 
              />
            </TouchableOpacity>
          </View>
          
          {/* Font Size Setting */}
          <View style={styles.settingSection}>
            <Text style={[
              styles.settingLabel,
              { color: theme === 'dark' ? CommonColors.white : CommonColors.gray800 }
            ]}>
              Font Size
            </Text>
            <View style={styles.sliderContainer}>
              <Text style={[
                styles.sliderValue,
                { color: theme === 'dark' ? CommonColors.white : CommonColors.gray600 }
              ]}>
                A
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={minFontSize}
                maximumValue={maxFontSize}
                step={1}
                value={fontSize}
                onValueChange={handleFontSizeChange}
                minimumTrackTintColor={CommonColors.primary}
                maximumTrackTintColor={theme === 'dark' ? '#555' : '#ddd'}
              />
              <Text style={[
                styles.sliderValue,
                { fontSize: 24, color: theme === 'dark' ? CommonColors.white : CommonColors.gray600 }
              ]}>
                A
              </Text>
            </View>
          </View>
          
          {/* Line Spacing Setting */}
          {onLineSpacingChange && (
            <View style={styles.settingSection}>
              <Text style={[
                styles.settingLabel,
                { color: theme === 'dark' ? CommonColors.white : CommonColors.gray800 }
              ]}>
                Line Spacing
              </Text>
              <View style={styles.sliderContainer}>
                <Ionicons 
                  name="reorder-two" 
                  size={20} 
                  color={theme === 'dark' ? CommonColors.white : CommonColors.gray600} 
                />
                <Slider
                  style={styles.slider}
                  minimumValue={minLineSpacing}
                  maximumValue={maxLineSpacing}
                  step={0.1}
                  value={lineSpacing}
                  onValueChange={handleLineSpacingChange}
                  minimumTrackTintColor={CommonColors.primary}
                  maximumTrackTintColor={theme === 'dark' ? '#555' : '#ddd'}
                />
                <Ionicons 
                  name="reorder-four" 
                  size={20} 
                  color={theme === 'dark' ? CommonColors.white : CommonColors.gray600} 
                />
              </View>
            </View>
          )}
          
          {/* Theme Selection */}
          <View style={styles.settingSection}>
            <Text style={[
              styles.settingLabel,
              { color: theme === 'dark' ? CommonColors.white : CommonColors.gray800 }
            ]}>
              Theme
            </Text>
            <View style={styles.themeOptions}>
              <TouchableOpacity 
                style={[
                  styles.themeOption, 
                  styles.lightTheme,
                  theme === 'light' && styles.selectedTheme
                ]} 
                onPress={() => handleThemeChange('light')}
              >
                <Text style={styles.themeText}>Light</Text>
                {theme === 'light' && (
                  <Ionicons name="checkmark-circle" size={16} color={CommonColors.primary} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.themeOption, 
                  styles.sepiaTheme,
                  theme === 'sepia' && styles.selectedTheme
                ]} 
                onPress={() => handleThemeChange('sepia')}
              >
                <Text style={styles.themeText}>Sepia</Text>
                {theme === 'sepia' && (
                  <Ionicons name="checkmark-circle" size={16} color={CommonColors.primary} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.themeOption, 
                  styles.darkTheme,
                  theme === 'dark' && styles.selectedTheme
                ]} 
                onPress={() => handleThemeChange('dark')}
              >
                <Text style={[styles.themeText, { color: CommonColors.white }]}>Dark</Text>
                {theme === 'dark' && (
                  <Ionicons name="checkmark-circle" size={16} color={CommonColors.primary} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <>
      {renderFloatingButton()}
      {controlsVisible && renderControlsPanel()}
      {renderSettingsModal()}
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: CommonColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: CommonColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 100,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    elevation: 10,
    shadowColor: CommonColors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    padding: Spacing.md,
    zIndex: 99,
  },
  controlsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: CommonColors.gray200,
  },
  controlsHeaderTitle: {
    flex: 1,
    alignItems: 'center',
  },
  controlsHeaderText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },
  controlButton: {
    padding: Spacing.sm,
  },
  controlsBody: {
    paddingVertical: Spacing.md,
  },
  controlItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  controlItemText: {
    fontSize: Typography.sizes.base,
    marginLeft: Spacing.sm,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: Spacing.lg,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: CommonColors.gray200,
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  settingSection: {
    marginBottom: Spacing.lg,
  },
  settingLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.sm,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: Spacing.md,
  },
  sliderValue: {
    fontSize: 16,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeOption: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    flexDirection: 'row',
  },
  selectedTheme: {
    borderWidth: 2,
    borderColor: CommonColors.primary,
  },
  lightTheme: {
    backgroundColor: CommonColors.white,
    borderWidth: 1,
    borderColor: CommonColors.gray200,
  },
  sepiaTheme: {
    backgroundColor: '#F8F2E4',
    borderWidth: 1,
    borderColor: '#E8D8C0',
  },
  darkTheme: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#555',
  },
  themeText: {
    fontSize: Typography.sizes.sm,
    marginRight: 5,
  },
});

export default ReaderControls; 