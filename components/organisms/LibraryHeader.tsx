import { CategoryItemScreenColors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import {
  Platform,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

export interface LibraryHeaderProps {
  title: string;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Header component for library screens with back and menu buttons
 */
export const LibraryHeader = memo(({
  title,
  onBackPress,
  onMenuPress,
  subtitle,
  backgroundColor = CategoryItemScreenColors.primary,
  textColor = "white",
  style,
}: LibraryHeaderProps) => {
  // Get status bar height for iOS
  const statusBarHeight = Platform.OS === "ios" ? 44 : 0;
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor },
      { paddingTop: statusBarHeight },
      style
    ]}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={backgroundColor} 
      />
      
      <View style={styles.content}>
        {onBackPress ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onBackPress}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityHint="Navigate to the previous screen"
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        ) : (
          // Empty view for equal spacing when no back button
          <View style={styles.iconButton} />
        )}

        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: textColor }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: `${textColor}cc` }]}>
              {subtitle}
            </Text>
          )}
        </View>

        {onMenuPress ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onMenuPress}
            activeOpacity={0.7}
            accessibilityLabel="Open menu"
            accessibilityHint="Shows additional options"
          >
            <Ionicons name="menu" size={24} color={textColor} />
          </TouchableOpacity>
        ) : (
          // Empty view for equal spacing when no menu button
          <View style={styles.iconButton} />
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    // backgroundColor is set via props
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 56,
  },
  iconButton: {
    padding: Spacing.xs,
    width: 40,
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    // color is set via props
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
    // color is set via props with opacity
    marginTop: 2,
  },
});

LibraryHeader.displayName = "LibraryHeader";