import { Input, InputProps } from '@/components/atoms/Input';
import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';

interface CustomInputProps extends InputProps {
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  iconColor?: string;
}

/**
 * CustomInput component that wraps the base Input component with additional styling
 * and icon support for authentication screens
 */
const CustomInput = ({
  leftIcon,
  rightIcon,
  error,
  containerStyle,
  inputStyle,
  iconColor = CommonColors.primary,
  ...props
}: CustomInputProps) => {
  return (
    <Input
      leftIcon={leftIcon ?? undefined}
      rightIcon={rightIcon ?? undefined}
      error={error}
      containerStyle={[styles.container, containerStyle]}
      inputStyle={[styles.input, inputStyle]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: CommonColors.gray300,
    borderRadius: 8,
    paddingVertical: Spacing.sm,
  },
});

export default CustomInput; 