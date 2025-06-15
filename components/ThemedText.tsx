import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { TextProps } from 'react-native';
import { Text } from './atoms/Text';

export interface ThemedTextProps extends TextProps {
  type?: 'default' | 'defaultBold' | 'defaultSemiBold' | 'heading' | 'subheading' | 'caption';
  darkColor?: string;
  lightColor?: string;
}

/**
 * A themed text component that adapts to the current theme
 */
export const ThemedText: React.FC<ThemedTextProps> = ({
  type = 'default',
  darkColor,
  lightColor,
  style,
  children,
  ...rest
}) => {
  const { theme } = useTheme();
  const isDark = theme.colorScheme === 'dark';
  
  // Map type to variant and weight
  let variant = 'body1';
  let weight: 'normal' | 'medium' | 'semibold' | 'bold' = 'normal';
  
  switch (type) {
    case 'defaultBold':
      variant = 'body1';
      weight = 'bold';
      break;
    case 'defaultSemiBold':
      variant = 'body1';
      weight = 'semibold';
      break;
    case 'heading':
      variant = 'h4';
      weight = 'bold';
      break;
    case 'subheading':
      variant = 'h5';
      weight = 'medium';
      break;
    case 'caption':
      variant = 'caption';
      weight = 'normal';
      break;
    default:
      variant = 'body1';
      weight = 'normal';
  }
  
  // Determine text color based on theme and props
  const color = isDark
    ? darkColor || theme.colors.text
    : lightColor || theme.colors.text;
  
  return (
    <Text
      variant={variant}
      weight={weight}
      color={color}
      style={style}
      {...rest}
    >
      {children}
    </Text>
  );
}; 