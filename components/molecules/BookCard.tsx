import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Book, BookAvailability } from '@/types/Book';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Text } from '../atoms/Text';

export interface BookCardProps {
  book: Book;
  onPress?: (book: Book) => void;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  compact?: boolean;
  showAvailability?: boolean;
}

/**
 * BookCard displays a book with cover, title, and author
 * with optional availability indicator
 */
export const BookCard = ({
  book,
  onPress,
  style,
  imageStyle,
  compact = false,
  showAvailability = false,
}: BookCardProps) => {
  const { title, author, coverImage, availability } = book;
  
  // Format author name
  const authorName = typeof author === 'string' ? author : author?.name || 'Unknown';
  
  // Determine if book is available
  const isAvailable = availability === BookAvailability.AVAILABLE;
  
  // Handle card press
  const handlePress = () => {
    if (onPress) {
      onPress(book);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        compact ? styles.compactContainer : styles.regularContainer,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: coverImage }}
          style={[
            styles.image,
            compact ? styles.compactImage : styles.regularImage,
            imageStyle,
          ]}
          resizeMode="cover"
        />
        
        {showAvailability && (
          <View
            style={[
              styles.availabilityBadge,
              isAvailable ? styles.availableBadge : styles.unavailableBadge,
            ]}
          >
            <Ionicons
              name={isAvailable ? 'checkmark-circle' : 'close-circle'}
              size={compact ? 12 : 16}
              color={CommonColors.white}
            />
          </View>
        )}
      </View>
      
      <View style={compact ? styles.compactTextContainer : styles.textContainer}>
        <Text
          variant={compact ? 'caption' : 'body2'}
          weight="semibold"
          numberOfLines={2}
          style={styles.title}
        >
          {title}
        </Text>
        
        <Text
          variant={compact ? 'overline' : 'caption'}
          color={CommonColors.gray600}
          numberOfLines={1}
          style={styles.author}
        >
          {authorName}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: CommonColors.white,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: CommonColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  regularContainer: {
    width: 160,
  },
  compactContainer: {
    width: 120,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    backgroundColor: CommonColors.gray200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  regularImage: {
    width: '100%',
    height: 200,
  },
  compactImage: {
    width: '100%',
    height: 150,
  },
  textContainer: {
    padding: Spacing.sm,
  },
  compactTextContainer: {
    padding: Spacing.xs,
  },
  title: {
    marginBottom: 4,
  },
  author: {
    marginTop: 2,
  },
  availabilityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableBadge: {
    backgroundColor: CommonColors.success,
  },
  unavailableBadge: {
    backgroundColor: CommonColors.error,
  },
}); 