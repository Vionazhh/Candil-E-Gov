import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LoadingScreenProps {
  message?: string;
  backgroundColor?: string;
  indicatorColor?: string;
  textColor?: string;
  showLogo?: boolean;
  size?: 'small' | 'large';
}

/**
 * A reusable loading screen component
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  backgroundColor = CommonColors.white,
  indicatorColor = CommonColors.primary,
  textColor = CommonColors.gray700,
  showLogo = false,
  size = 'large',
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {showLogo && (
        <View style={styles.logoContainer}>
          {/* Logo could be added here */}
        </View>
      )}
      
      <ActivityIndicator
        size={size}
        color={indicatorColor}
        style={styles.indicator}
      />
      
      {message && (
        <Text style={[styles.message, { color: textColor }]}>
          {message}
        </Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  indicator: {
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: Typography.sizes.md,
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },
});

export default LoadingScreen; 