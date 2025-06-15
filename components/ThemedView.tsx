import { useTheme } from '@/context/ThemeContext';
import React from 'react';
import { Container, ContainerProps } from './atoms/View';

export interface ThemedViewProps extends ContainerProps {
  darkBackgroundColor?: string;
  lightBackgroundColor?: string;
}

/**
 * A themed view component that adapts to the current theme
 */
export const ThemedView: React.FC<ThemedViewProps> = ({
  darkBackgroundColor,
  lightBackgroundColor,
  backgroundColor,
  style,
  children,
  ...rest
}) => {
  const { theme } = useTheme();
  const isDark = theme.colorScheme === 'dark';
  
  // Determine background color based on theme and props
  const themeBackgroundColor = isDark
    ? darkBackgroundColor || theme.colors.background
    : lightBackgroundColor || theme.colors.background;
  
  // Use provided backgroundColor if available, otherwise use theme-specific color
  const bgColor = backgroundColor || themeBackgroundColor;
  
  return (
    <Container
      backgroundColor={bgColor}
      style={style}
      {...rest}
    >
      {children}
    </Container>
  );
}; 