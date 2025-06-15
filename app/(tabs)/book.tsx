import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { CommonColors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import { useBook } from "@/hooks";
import { Book } from "@/types/Book";
import { logger } from "@/utils/logger";

// Sorting options for the books
const SORT_OPTIONS = [
  { key: 'title_asc', label: 'Judul A-Z' },
  { key: 'title_desc', label: 'Judul Z-A' },
  { key: 'recent', label: 'Terbaru' },
];

// Memorize BookItem component to prevent unnecessary re-renders
const BookItem = memo(
  ({ item, onPress }: { item: Book; onPress: () => void }) => {
    // Track if image fails to load
    const [imageError, setImageError] = React.useState(false);
    
    return (
      <TouchableOpacity style={styles.bookItem} onPress={onPress}>
        <View style={styles.bookImageContainer}>
          {item.coverImage && !imageError ? (
            <Image 
              source={{ uri: item.coverImage }} 
              style={styles.bookImage} 
              onError={() => setImageError(true)}
            />
          ) : (
            <Text style={styles.bookImageText}>{item.title ? item.title.charAt(0).toUpperCase() : '?'}</Text>
          )}
        </View>
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.title || "Untitled Book"}
          </Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>
            {item.author?.name || "Unknown Author"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
);

// Add display name for debugging
BookItem.displayName = "BookItem";

// Extract FlatList items renderer for better performance
const renderBookItem = ({
  item,
  onBookPress,
}: {
  item: Book;
  onBookPress: (book: Book) => void;
}) => <BookItem item={item} onPress={() => onBookPress(item)} />;

// Extract empty component to prevent re-renders
const EmptyListComponent = ({ error }: { error: string | null }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="book-outline" size={64} color={CommonColors.gray400} />
    <Text style={styles.emptyText}>
      {error ? `Error: ${error}` : "Tidak ada buku yang ditemukan"}
    </Text>
  </View>
);

export default function BookScreen() {
  const {
    books,
    isLoading,
    isRefreshing,
    error,
    totalBooks,
    handleBookPress,
    refreshBooks,
    loadMoreBooks,
  } = useBook();
  
  // State for filter and sort
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [filterText, setFilterText] = useState('');
  
  // Apply filtering and sorting to books
  React.useEffect(() => {
    let result = [...books];
    
    // Apply text filter if any
    if (filterText) {
      const searchText = filterText.toLowerCase();
      result = result.filter(book => 
        book.title?.toLowerCase().includes(searchText) || 
        book.author?.name?.toLowerCase().includes(searchText)
      );
    }
    
    // Apply sorting
    switch (sortOption.key) {
      case 'title_asc':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'title_desc':
        result.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      case 'recent':
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        break;
    }
    
    setFilteredBooks(result);
  }, [books, filterText, sortOption]);

  // Toggle filter modal
  const toggleFilterModal = useCallback(() => {
    setFilterModalVisible(prev => !prev);
  }, []);
  
  // Select sort option
  const handleSortSelect = useCallback((option) => {
    setSortOption(option);
    setFilterModalVisible(false);
  }, []);
  
  // Clear filter
  const clearFilter = useCallback(() => {
    setFilterText('');
  }, []);

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={CommonColors.primary} />
        <Text style={styles.loadingText}>Memuat buku...</Text>
      </View>
    );
  }

  // Use keyExtractor to provide stable keys
  const keyExtractor = (item: Book) => item.id;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.filterContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari judul atau penulis..."
            value={filterText}
            onChangeText={setFilterText}
          />
          {filterText ? (
            <TouchableOpacity onPress={clearFilter} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color={CommonColors.gray600} />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity style={styles.sortButton} onPress={toggleFilterModal}>
          <Ionicons name="funnel-outline" size={20} color={CommonColors.gray700} />
          <Text style={styles.sortButtonText}>{sortOption.label}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBooks}
        renderItem={({ item }) =>
          renderBookItem({ item, onBookPress: handleBookPress })
        }
        keyExtractor={keyExtractor}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={refreshBooks}
        onEndReached={loadMoreBooks}
        onEndReachedThreshold={0.5}
        maxToRenderPerBatch={12}
        removeClippedSubviews={true}
        initialNumToRender={9}
        ListEmptyComponent={<EmptyListComponent error={error} />}
        ListHeaderComponent={() => (
          <Text style={styles.bookCount}>
            {filteredBooks.length} {filteredBooks.length !== totalBooks ? `dari ${totalBooks} ` : ''}
            buku tersedia
          </Text>
        )}
      />
      
      {/* Sort & Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={toggleFilterModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleFilterModal}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Urutkan Buku</Text>
              <TouchableOpacity onPress={toggleFilterModal}>
                <Ionicons name="close" size={24} color={CommonColors.gray700} />
              </TouchableOpacity>
            </View>
            
            {SORT_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.key}
                style={styles.sortOption}
                onPress={() => handleSortSelect(option)}
              >
                <Text style={styles.sortOptionText}>{option.label}</Text>
                {sortOption.key === option.key && (
                  <Ionicons name="checkmark" size={22} color={CommonColors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CommonColors.gray50,
    paddingHorizontal: Spacing.md,
  },
  header: {
    marginVertical: Spacing.md,
    paddingTop: Spacing.sm,
  },
  bookCount: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray600,
    marginBottom: Spacing.md,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CommonColors.gray500,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: Typography.sizes.sm,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CommonColors.white,
    borderRadius: 8,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  sortButtonText: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray700,
    marginLeft: Spacing.xs,
  },
  listContainer: {
    paddingBottom: Spacing.xl,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  bookItem: {
    width: "31%",
    backgroundColor: CommonColors.white,
    borderRadius: 12,
    marginBottom: Spacing.md,
    overflow: "hidden",
    elevation: 2,
    shadowColor: CommonColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookImageContainer: {
    height: 120,
    backgroundColor: CommonColors.primary + '20',
    justifyContent: "center",
    alignItems: "center",
  },
  bookImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  bookInfo: {
    padding: Spacing.sm,
  },
  bookTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: "600",
    color: CommonColors.gray900,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: Typography.sizes.xs - 1,
    color: CommonColors.gray600,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.base,
    color: CommonColors.gray600,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl * 2,
  },
  emptyText: {
    fontSize: Typography.sizes.base,
    color: CommonColors.gray600,
    textAlign: "center",
    marginTop: Spacing.md,
  },
  bookImageText: {
    fontSize: Typography.sizes.xl,
    fontWeight: "bold",
    color: CommonColors.gray700,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: CommonColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    paddingBottom: 40, // Extra space for iOS
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: CommonColors.gray900,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: CommonColors.gray200,
  },
  sortOptionText: {
    fontSize: Typography.sizes.base,
    color: CommonColors.gray800,
  },
});