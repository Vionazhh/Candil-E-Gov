import { CommonColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleProp, StyleSheet, TextStyle } from 'react-native';

export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption' | 'button' | 'overline';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

/**
 * Text component with typography variants and styling options
 */
export const Text = ({
  variant = 'body1',
  weight = 'regular',
  color,
  align = 'left',
  style,
  children,
  ...rest
}: TextProps) => {
  // Determine font family based on weight
  const fontFamily = {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  }[weight];

  // Apply styles based on variant, weight, color, and alignment
  const textStyles = [
    styles.text,
    styles[variant],
    { fontFamily },
    { textAlign: align },
    color && { color },
    style,
  ];

  return (
    <RNText style={textStyles} {...rest}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  text: {
    color: CommonColors.gray900,
  },
  h1: {
    fontSize: Typography.sizes.xxxl,
    lineHeight: Typography.lineHeights.xxxl,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: Typography.sizes.xxl,
    lineHeight: Typography.lineHeights.xxl,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: Typography.sizes.xl,
    lineHeight: Typography.lineHeights.xl,
  },
  h4: {
    fontSize: Typography.sizes.lg,
    lineHeight: Typography.lineHeights.lg,
  },
  body1: {
    fontSize: Typography.sizes.base,
    lineHeight: Typography.lineHeights.base,
  },
  body2: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.lineHeights.sm,
  },
  caption: {
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.lineHeights.xs,
  },
  button: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.lineHeights.sm,
    letterSpacing: 0.5,
  },
  overline: {
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.lineHeights.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
}); 