import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Text } from '../atoms/Text';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  actionStyle?: StyleProp<TextStyle>;
}

/**
 * SectionHeader component for section titles with optional
 * subtitle and action button
 */
export const SectionHeader = ({
  title,
  subtitle,
  actionText,
  actionIcon,
  onActionPress,
  style,
  titleStyle,
  subtitleStyle,
  actionStyle,
}: SectionHeaderProps) => {
  const hasAction = !!(actionText || actionIcon);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleContainer}>
        <Text
          variant="h4"
          weight="semibold"
          style={[styles.title, titleStyle]}
        >
          {title}
        </Text>
        
        {subtitle && (
          <Text
            variant="body2"
            color={CommonColors.gray600}
            style={[styles.subtitle, subtitleStyle]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      
      {hasAction && onActionPress && (
        <TouchableOpacity
          style={styles.actionContainer}
          onPress={onActionPress}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Text
            variant="button"
            color={CommonColors.primary}
            style={[styles.actionText, actionStyle]}
          >
            {actionText}
          </Text>
          
          {actionIcon && (
            <Ionicons
              name={actionIcon}
              size={16}
              color={CommonColors.primary}
              style={styles.actionIcon}
            />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    marginBottom: subtitle => subtitle ? Spacing.xs : 0,
  },
  subtitle: {},
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginRight: actionIcon => actionIcon ? Spacing.xs : 0,
  },
  actionIcon: {},
}); 