/**
 * Typography constants for consistent text styling across the app
 */

// Font size definitions
export type FontSize = 
  | 'xxs'  // Extra extra small
  | 'xs'   // Extra small
  | 'sm'   // Small
  | 'base' // Base size
  | 'lg'   // Large
  | 'xl'   // Extra large
  | 'xxl'  // Extra extra large
  | 'xxxl'; // Extra extra extra large

// Font weight definitions
export type FontWeight = 
  | 'normal'   // Regular (400)
  | 'medium'   // Medium (500)
  | 'semibold' // Semi-bold (600)
  | 'bold';    // Bold (700)

// Line height definitions
export type LineHeight = 
  | 'tight'    // Compact (1.2)
  | 'normal'   // Standard (1.4)
  | 'relaxed'; // Spacious (1.6)

// Font family definitions
export type FontFamily = 
  | 'regular'  // Inter-Regular
  | 'medium'   // Inter-Medium
  | 'semibold' // Inter-SemiBold
  | 'bold';    // Inter-Bold

// Typography object with typed properties
export const Typography = {
  // Font sizes in pixels
  sizes: {
    xxs: 10,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  } as const,
  
  // Font weights as strings (matches React Native's expected values)
  weights: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  } as const,
  
  // Line heights as multipliers
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  } as const,
  
  // Font families
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold', 
    bold: 'Inter-Bold',
  } as const,
  
  // Common text styles for reuse
  styles: {
    title: {
      fontSize: 24,
      fontWeight: "700",
      lineHeight: 32,
      fontFamily: 'Inter-Bold',
    },
    subtitle: {
      fontSize: 18,
      fontWeight: "600",
      lineHeight: 24,
      fontFamily: 'Inter-SemiBold',
    },
    body: {
      fontSize: 16,
      fontWeight: "400",
      lineHeight: 24,
      fontFamily: 'Inter-Regular',
    },
    caption: {
      fontSize: 12,
      fontWeight: "400",
      lineHeight: 16,
      fontFamily: 'Inter-Regular',
    },
  } as const,
};
