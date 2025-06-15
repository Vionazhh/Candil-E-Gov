import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ReadingProgressProps {
  currentPage: number;
  totalPages: number;
  progress: number; // 0-1 value
}

/**
 * Component that displays reading progress at the bottom of the reading screen
 */
export const ReadingProgress: React.FC<ReadingProgressProps> = ({
  currentPage,
  totalPages,
  progress,
}) => {
  // Calculate percentage for display
  const progressPercent = Math.round(progress * 100);
  
  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar,
            { width: `${progressPercent}%` }
          ]} 
        />
      </View>
      
      {/* Page indicator */}
      <View style={styles.pageIndicator}>
        <Text style={styles.pageText}>
          {currentPage}/{totalPages}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: CommonColors.white,
    borderTopWidth: 1,
    borderTopColor: CommonColors.gray200,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: CommonColors.gray200,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: CommonColors.primary,
    borderRadius: 2,
  },
  pageIndicator: {
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  pageText: {
    fontSize: Typography.sizes.xs,
    color: CommonColors.gray600,
    fontWeight: Typography.weights.medium,
  },
});

export default ReadingProgress; 