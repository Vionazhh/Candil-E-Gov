import { useTheme } from '@/context/ThemeContext';
import { Book } from '@/types/Book';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from '../atoms/Text';
import { BookCard } from '../molecules/BookCard';

interface BookGridProps {
  books: Book[];
  isLoading: boolean;
  error: string | null;
  onRefresh?: () => void;
  onBookPress: (book: Book) => void;
  ListHeaderComponent?: React.ReactElement;
  numColumns?: number;
  emptyMessage?: string;
}

export const BookGrid: React.FC<BookGridProps> = ({
  books,
  isLoading,
  error,
  onRefresh,
  onBookPress,
  ListHeaderComponent,
  numColumns = 2,
  emptyMessage = 'No books found',
}) => {
  const { theme } = useTheme();

  const renderItem = ({ item }: ListRenderItemInfo<Book>) => (
    <BookCard book={item} onPress={onBookPress} />
  );

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text
            variant="subtitle"
            color={theme.colors.error}
            style={styles.errorText}
          >
            {error}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.centered}>
        <Text variant="subtitle" color={theme.colors.textSecondary}>
          {emptyMessage}
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={books}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      contentContainerStyle={[
        styles.container,
        books.length === 0 && styles.emptyContainer,
      ]}
      columnWrapperStyle={styles.columnWrapper}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmptyComponent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        ) : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 80, // Extra padding at the bottom for content at the bottom
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
  },
}); 