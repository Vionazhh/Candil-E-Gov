import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreenColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

const CategoryItems = ({ 
  title, 
  onPress,
  style 
}:{
    title: string,
    onPress: () => void,
    style?: any,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.title}>{title}</Text>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={HomeScreenColors.categoryArrow}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: HomeScreenColors.categoryBackground,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: HomeScreenColors.categoryBorder,
  },
  title: {
    fontSize: Typography.sizes.base,
    color: HomeScreenColors.categoryText,
    fontWeight: Typography.weights.normal,
  },
});

export default CategoryItems;