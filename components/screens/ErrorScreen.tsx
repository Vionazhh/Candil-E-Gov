import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ErrorScreenProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryButtonText?: string;
  onBack?: () => void;
  backButtonText?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

/**
 * A reusable error screen component with retry and back options
 */
const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title = 'Error Occurred',
  message,
  onRetry,
  retryButtonText = 'Retry',
  onBack,
  backButtonText = 'Go Back',
  backgroundColor = CommonColors.white,
  textColor = CommonColors.gray800,
  buttonColor = CommonColors.primary,
  iconName = 'alert-circle',
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <Ionicons name={iconName} size={70} color={CommonColors.error} style={styles.icon} />
        
        <Text style={[styles.title, { color: textColor }]}>
          {title}
        </Text>
        
        <Text style={[styles.message, { color: textColor }]}>
          {message}
        </Text>
        
        <View style={styles.buttonsContainer}>
          {onRetry && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: buttonColor }]}
              onPress={onRetry}
            >
              <Text style={styles.buttonText}>{retryButtonText}</Text>
            </TouchableOpacity>
          )}
          
          {onBack && (
            <TouchableOpacity
              style={[
                styles.button, 
                styles.backButton,
                { borderColor: buttonColor }
              ]}
              onPress={onBack}
            >
              <Text style={[styles.buttonText, { color: buttonColor }]}>
                {backButtonText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
  },
  icon: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: Typography.sizes.base * 1.4,
  },
  buttonsContainer: {
    flexDirection: 'column',
    width: '100%',
    gap: Spacing.md,
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  buttonText: {
    color: CommonColors.white,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
});

export default ErrorScreen; 