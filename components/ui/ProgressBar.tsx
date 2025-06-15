import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import React from 'react';
import { LayoutAnimation, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProgressBarProps {
  progress: number;
  currentPage?: number;
  totalPages?: number;
  showPages?: boolean;
  showPercentage?: boolean;
  height?: number;
  barColor?: string;
  backgroundColor?: string;
  textColor?: string;
  onProgressPress?: (position: number) => void;
  style?: object;
}

/**
 * A reusable component for showing reading progress
 * with optional page numbers and percentage
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  currentPage,
  totalPages,
  showPages = true,
  showPercentage = true,
  height = 4,
  barColor = CommonColors.primary,
  backgroundColor = CommonColors.gray200,
  textColor = CommonColors.gray800,
  onProgressPress,
  style,
}) => {
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  
  // Calculate percentage display
  const percentage = Math.round(clampedProgress * 100);
  
  // Handle tap on progress bar
  const handleProgressPress = (event: any) => {
    if (!onProgressPress) return;
    
    // Get the position that was tapped (0-1)
    const { locationX, target } = event.nativeEvent;
    target.measure((x: number, y: number, width: number) => {
      const position = Math.min(Math.max(locationX / width, 0), 1);
      
      // Animate the update
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      
      // Call callback with the position
      onProgressPress(position);
    });
  };

  return (
    <View style={[styles.container, style]}>
      {/* Progress info (page/percentage) */}
      {(showPages || showPercentage) && (
        <View style={styles.infoContainer}>
          {showPages && currentPage && totalPages && (
            <Text style={[styles.pageText, { color: textColor }]}>
              {currentPage} / {totalPages}
            </Text>
          )}
          
          {showPercentage && (
            <Text style={[styles.percentageText, { color: textColor }]}>
              {percentage}%
            </Text>
          )}
        </View>
      )}
      
      {/* Progress bar */}
      <TouchableOpacity
        activeOpacity={onProgressPress ? 0.6 : 1}
        onPress={onProgressPress ? handleProgressPress : undefined}
        disabled={!onProgressPress}
      >
        <View 
          style={[
            styles.progressContainer, 
            { height, backgroundColor }
          ]}
        >
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${percentage}%`,
                backgroundColor: barColor,
                height
              }
            ]} 
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: 'transparent',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  pageText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  percentageText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  progressContainer: {
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 2,
  },
});

export default ProgressBar; 