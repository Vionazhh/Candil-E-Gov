import React, { useCallback, useEffect, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text
} from 'react-native';
import { CommonColors } from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';

interface TextReaderProps {
  content: string;
  bookId: string;
  fontSize: number;
  lineHeight?: number;
  theme?: 'light' | 'dark' | 'sepia';
  initialProgress?: number;
  onScrollProgress?: (progress: number, currentPage: number, totalPages: number) => void;
}

/**
 * A reusable text reader component that displays text content with customizable styling
 * and tracks reading progress
 */
const TextReader: React.FC<TextReaderProps> = ({
  content,
  bookId,
  fontSize,
  lineHeight = 24,
  theme = 'light',
  initialProgress = 0,
  onScrollProgress,
}) => {
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Split content into paragraphs for better readability
  const paragraphs = content
    ? content.split('\n').filter(p => p.trim().length > 0)
    : ['No content available'];

  // Calculate estimated total pages based on word count
  const wordCount = content ? content.split(/\s+/).length : 0;
  const estimatedWordsPerPage = 250;
  const totalPages = Math.max(Math.ceil(wordCount / estimatedWordsPerPage), 1);

  // Handle scroll to set initial position
  useEffect(() => {
    if (initialProgress && initialProgress > 0 && scrollViewRef.current && contentHeight > 0 && scrollViewHeight > 0) {
      const scrollToY = Math.max(0, initialProgress * contentHeight - scrollViewHeight / 2);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: scrollToY, animated: false });
      }, 100);
    }
  }, [initialProgress, contentHeight, scrollViewHeight]);

  // Handle layout events to get content dimensions
  const handleLayout = useCallback((event: any) => {
    setScrollViewHeight(event.nativeEvent.layout.height);
  }, []);

  const handleContentSizeChange = useCallback((width: number, height: number) => {
    setContentHeight(height);
  }, []);

  // Handle scroll events to track reading progress
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!onScrollProgress) return;

      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const paddingToBottom = 20;

      // Calculate progress (0-1)
      const progress = Math.min(
        (contentOffset.y + layoutMeasurement.height + paddingToBottom) /
          contentSize.height,
        1
      );

      // Calculate current page
      const currentPage = Math.max(Math.ceil(progress * totalPages), 1);

      // Pass progress to parent component
      onScrollProgress(progress, currentPage, totalPages);
    },
    [totalPages, onScrollProgress]
  );

  // Determine background and text colors based on theme
  const getBackgroundColor = () => {
    switch (theme) {
      case 'dark':
        return '#222';
      case 'sepia':
        return '#F8F2E4';
      case 'light':
      default:
        return CommonColors.white;
    }
  };

  const getTextColor = () => {
    switch (theme) {
      case 'dark':
        return CommonColors.white;
      case 'sepia':
      case 'light':
      default:
        return CommonColors.gray900;
    }
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={[styles.container, { backgroundColor: getBackgroundColor() }]}
      contentContainerStyle={styles.contentContainer}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      onLayout={handleLayout}
      onContentSizeChange={handleContentSizeChange}
    >
      {paragraphs.map((paragraph, index) => (
        <Text
          key={index}
          style={[
            styles.paragraph,
            {
              fontSize,
              lineHeight: lineHeight || fontSize * 1.5,
              color: getTextColor(),
            },
          ]}
        >
          {paragraph}
        </Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },
  paragraph: {
    marginBottom: Spacing.md,
    textAlign: 'justify',
  },
});

export default TextReader; 