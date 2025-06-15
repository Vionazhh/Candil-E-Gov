import { Button, ButtonProps } from '@/components/atoms/Button';
import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import React from 'react';
import { StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';

interface CustomButtonProps extends Omit<ButtonProps, 'variant' | 'onPress'> {
  loading?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  solidColor?: string;
  onPress?: () => void;
}

/**
 * CustomButton component that wraps the base Button component with
 * additional styling and loading state for authentication screens
 */
const CustomButton = ({
  title,
  onPress = () => {},
  loading = false,
  disabled = false,
  containerStyle,
  titleStyle,
  solidColor = CommonColors.primary,
  ...props
}: CustomButtonProps) => {
  return (
    <Button
      title={loading ? '' : title}
      variant="primary"
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: disabled ? CommonColors.gray400 : solidColor },
        containerStyle,
      ]}
      textStyle={[styles.buttonText, titleStyle]}
      leftIcon={loading ? undefined : props.leftIcon}
      rightIcon={loading ? undefined : props.rightIcon}
      loading={loading}
      disabled={disabled || loading}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: Spacing.md,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default CustomButton; 