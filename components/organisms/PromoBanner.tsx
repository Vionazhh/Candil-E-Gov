import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';

const PromoBanner = ({ 
  title, 
  subtitle, 
  ctaText, 
  onPress,
  onClose,
  style 
}:{
    title:string,
    subtitle:string,
    ctaText:string,
    onPress: () => void,
    onClose: () => void,
    style?:any,
}) => {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={20} color={CommonColors.white} />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>{ctaText}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.imageContainer}>
          {/* Placeholder for book covers */}
          <View style={styles.bookStack}>
            <View style={[styles.book, styles.book1]} />
            <View style={[styles.book, styles.book2]} />
            <View style={[styles.book, styles.book3]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: CommonColors.primary,
    borderRadius: 12,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    zIndex: 1,
    padding: Spacing.xs,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: CommonColors.white,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeights.tight * Typography.sizes.base,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.white,
    opacity: 0.9,
    marginBottom: Spacing.md,
    lineHeight: Typography.lineHeights.normal * Typography.sizes.sm,
  },
  ctaButton: {
    backgroundColor: CommonColors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  ctaText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: CommonColors.primary,
  },
  imageContainer: {
    width: 80,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookStack: {
    position: 'relative',
    width: 60,
    height: 50,
  },
  book: {
    position: 'absolute',
    width: 30,
    height: 40,
    borderRadius: 4,
  },
  book1: {
    backgroundColor: '#FF6B9D',
    left: 0,
    top: 5,
    transform: [{ rotate: '-10deg' }],
  },
  book2: {
    backgroundColor: '#FFD93D',
    left: 15,
    top: 0,
    transform: [{ rotate: '5deg' }],
  },
  book3: {
    backgroundColor: '#A8A3FF',
    left: 30,
    top: 8,
    transform: [{ rotate: '15deg' }],
  },
});

export default PromoBanner;