import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Text } from './Text';

export interface InputProps extends TextInputProps {
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  helper?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  label?: string;
  onRightIconPress?: () => void;
  onLeftIconPress?: () => void;
}

/**
 * Input component with icons, error states, and helper text
 */
export const Input = ({
  leftIcon,
  rightIcon,
  error,
  helper,
  containerStyle,
  inputStyle,
  label,
  onRightIconPress,
  onLeftIconPress,
  secureTextEntry,
  ...rest
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prev => !prev);
  };

  // Handle focus events
  const handleFocus = (e: any) => {
    setIsFocused(true);
    rest.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    rest.onBlur?.(e);
  };

  // Calculate container styles based on state
  const containerStyles = [
    styles.container,
    isFocused && styles.focused,
    error && styles.error,
    containerStyle,
  ];

  // Show password visibility toggle if it's a password input
  const passwordIcon = secureTextEntry 
    ? isPasswordVisible 
      ? 'eye-off-outline' 
      : 'eye-outline'
    : undefined;

  // Determine the right icon
  const actualRightIcon = passwordIcon || rightIcon;

  // Handle right icon press
  const handleRightIconPress = () => {
    if (passwordIcon) {
      togglePasswordVisibility();
    } else if (onRightIconPress) {
      onRightIconPress();
    }
  };

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text variant="body2" weight="medium" style={styles.label}>
          {label}
        </Text>
      )}
      
      <View style={containerStyles}>
        {leftIcon && (
          <TouchableOpacity 
            onPress={onLeftIconPress}
            disabled={!onLeftIconPress}
            style={styles.leftIconContainer}
          >
            <Ionicons 
              name={leftIcon} 
              size={20} 
              color={error ? CommonColors.error : CommonColors.gray500} 
            />
          </TouchableOpacity>
        )}
        
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            actualRightIcon && styles.inputWithRightIcon,
            inputStyle,
          ]}
          placeholderTextColor={CommonColors.gray400}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...rest}
        />
        
        {actualRightIcon && (
          <TouchableOpacity 
            onPress={handleRightIconPress}
            disabled={!onRightIconPress && !passwordIcon}
            style={styles.rightIconContainer}
          >
            <Ionicons 
              name={actualRightIcon} 
              size={20} 
              color={error ? CommonColors.error : CommonColors.gray500} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {(error || helper) && (
        <Text 
          variant="caption" 
          color={error ? CommonColors.error : CommonColors.gray500}
          style={styles.helperText}
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CommonColors.gray300,
    borderRadius: 8,
    backgroundColor: CommonColors.white,
  },
  focused: {
    borderColor: CommonColors.primary,
  },
  error: {
    borderColor: CommonColors.error,
  },
  input: {
    flex: 1,
    height: 48,
    padding: Spacing.md,
    fontSize: Typography.sizes.base,
    color: CommonColors.gray900,
    fontFamily: 'Inter-Regular',
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIconContainer: {
    padding: Spacing.sm,
  },
  rightIconContainer: {
    padding: Spacing.sm,
  },
  label: {
    marginBottom: Spacing.xs,
    color: CommonColors.gray700,
  },
  helperText: {
    marginTop: Spacing.xs,
  },
}); 