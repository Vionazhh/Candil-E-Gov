import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import React from 'react';
import { View as RNView, ViewProps as RNViewProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';

export interface ContainerProps extends RNViewProps {
  backgroundColor?: string;
  padding?: keyof typeof Spacing | number;
  margin?: keyof typeof Spacing | number;
  rounded?: boolean | number;
  bordered?: boolean;
  shadow?: boolean | 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  flex?: boolean | number;
}

/**
 * Enhanced View component with common styling properties
 */
export const Container = ({
  backgroundColor,
  padding,
  margin,
  rounded,
  bordered,
  shadow,
  style,
  children,
  flex,
  ...rest
}: ContainerProps) => {
  // Process padding value
  const paddingValue = typeof padding === 'string' 
    ? Spacing[padding] 
    : padding;

  // Process margin value
  const marginValue = typeof margin === 'string'
    ? Spacing[margin]
    : margin;

  // Process border radius
  const borderRadius = rounded === true 
    ? 8 
    : typeof rounded === 'number' 
      ? rounded 
      : undefined;

  // Process shadow
  let shadowStyle = {};
  if (shadow) {
    if (shadow === 'sm') {
      shadowStyle = styles.shadowSmall;
    } else if (shadow === 'lg') {
      shadowStyle = styles.shadowLarge;
    } else {
      shadowStyle = styles.shadowMedium;
    }
  }

  // Process flex
  const flexStyle = flex === true 
    ? { flex: 1 } 
    : typeof flex === 'number' 
      ? { flex } 
      : {};

  const containerStyles = [
    flexStyle,
    backgroundColor && { backgroundColor },
    paddingValue !== undefined && { padding: paddingValue },
    marginValue !== undefined && { margin: marginValue },
    borderRadius !== undefined && { borderRadius },
    bordered && styles.bordered,
    shadow && shadowStyle,
    style,
  ];

  return (
    <RNView style={containerStyles} {...rest}>
      {children}
    </RNView>
  );
};

const styles = StyleSheet.create({
  bordered: {
    borderWidth: 1,
    borderColor: CommonColors.gray200,
  },
  shadowSmall: {
    shadowColor: CommonColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  shadowMedium: {
    shadowColor: CommonColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  shadowLarge: {
    shadowColor: CommonColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
}); 