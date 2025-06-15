import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle
} from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

/**
 * Button component with various styles and options
 */
export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  iconSize,
  style,
  textStyle,
  fullWidth = false,
  ...rest
}: ButtonProps) => {
  // Determine button styles based on variant
  const buttonStyles = [
    styles.button,
    styles[`${variant}Button`],
    styles[`${size}Button`],
    fullWidth && styles.fullWidth,
    disabled && styles[`${variant}DisabledButton`],
    style,
  ];

  // Determine text styles based on variant
  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles[`${variant}DisabledText`],
    textStyle,
  ];

  // Determine icon size based on button size
  const iconSizeMap = {
    small: 16,
    medium: 18,
    large: 20,
  };
  
  const iconSizeValue = iconSize || iconSizeMap[size];
  const iconColor = variant === 'primary' ? CommonColors.white : CommonColors.primary;
  const disabledIconColor = CommonColors.gray400;

  // Render loading spinner in place of content when loading
  if (loading) {
    return (
      <TouchableOpacity 
        style={buttonStyles} 
        onPress={onPress}
        disabled={true}
        activeOpacity={0.7}
        {...rest}
      >
        <ActivityIndicator 
          size={size === 'small' ? 'small' : 'small'} 
          color={variant === 'primary' ? CommonColors.white : CommonColors.primary} 
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={buttonStyles} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      {...rest}
    >
      {leftIcon && (
        <Ionicons 
          name={leftIcon} 
          size={iconSizeValue} 
          color={disabled ? disabledIconColor : iconColor} 
          style={styles.leftIcon} 
        />
      )}
      
      <Text style={textStyles}>{title}</Text>
      
      {rightIcon && (
        <Ionicons 
          name={rightIcon} 
          size={iconSizeValue} 
          color={disabled ? disabledIconColor : iconColor} 
          style={styles.rightIcon} 
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  fullWidth: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: CommonColors.primary,
  },
  secondaryButton: {
    backgroundColor: CommonColors.gray100,
  },
  outlinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: CommonColors.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  smallButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  mediumButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  largeButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  primaryDisabledButton: {
    backgroundColor: CommonColors.gray300,
  },
  secondaryDisabledButton: {
    backgroundColor: CommonColors.gray100,
  },
  outlinedDisabledButton: {
    borderColor: CommonColors.gray300,
  },
  textDisabledButton: {
    // No special style needed for disabled text button
  },
  text: {
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  primaryText: {
    color: CommonColors.white,
  },
  secondaryText: {
    color: CommonColors.gray900,
  },
  outlinedText: {
    color: CommonColors.primary,
  },
  textText: {
    color: CommonColors.primary,
  },
  smallText: {
    fontSize: Typography.sizes.xs,
  },
  mediumText: {
    fontSize: Typography.sizes.sm,
  },
  largeText: {
    fontSize: Typography.sizes.base,
  },
  primaryDisabledText: {
    color: CommonColors.gray100,
  },
  secondaryDisabledText: {
    color: CommonColors.gray400,
  },
  outlinedDisabledText: {
    color: CommonColors.gray400,
  },
  textDisabledText: {
    color: CommonColors.gray400,
  },
  leftIcon: {
    marginRight: Spacing.xs,
  },
  rightIcon: {
    marginLeft: Spacing.xs,
  },
}); 