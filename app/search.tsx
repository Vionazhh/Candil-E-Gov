/**
 * Search screen for books
 * Allows users to search for books by general terms or exact phrases
 */
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { SafeAreaView } from 'react-native-safe-area-context';

// Hooks
import { useSearchBooks } from "@/hooks/useSearchBooks";

// Components
import { SearchBar } from "@/components/molecules/SearchBar";
import { SearchResultItem } from "@/components/molecules/SearchResultItem";

// Constants
import { CommonColors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";

// Types
import { Book } from "@/types/Book";

/**
 * Search tab types
 */
type SearchTab = "all" | "books" | "categories";

/**
 * Search result types with enhanced book result
 */
type BookSearchResult = Book & { type: "book"; source: "search" };
type BookResult = {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publishedDate?: string;
  category?: string;
  thumbnail?: string;
  description?: string;
  type: "book";
  source: "books";
};
type CategoryResult = { id: string; title: string; type: "category" };
type SearchResult = BookSearchResult | BookResult | CategoryResult;

/**
 * Search screen component
 * Displays search interface and results for books
 */
const SearchScreen: React.FC = () => {
  const params = useLocalSearchParams<{ q: string }>();
  const initialQuery = params.q || "";
  
  const {
    searchQuery,
    searchResults,
    isLoading,
    error,
    handleSearch,
    clearResults,
    categoryResults,
    bookResults, // Added bookResults from updated hook
    hasResults,
    hasBookResults, // Added from updated hook
    hasCategoryResults, // Added from updated hook
    searchType,
  } = useSearchBooks(initialQuery);

  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  
  // Initialize search with query parameter if provided
  useEffect(() => {
    if (initialQuery && initialQuery !== searchQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch, searchQuery]);

  // Memoized filtered results for performance with enhanced book results
  const filteredResults = useMemo((): SearchResult[] => {
    switch (activeTab) {
      case "books":
        // Combine both search results and book results
        const searchBookItems: BookSearchResult[] = searchResults.map(book => ({
          ...book,
          type: "book" as const,
          source: "search" as const
        }));
        
        const bookItems: BookResult[] = bookResults.map(book => ({
          ...book,
          type: "book" as const,
          source: "books" as const
        }));

        // Remove duplicates based on ID
        const combinedBooks = [...searchBookItems, ...bookItems];
        const uniqueBooks = combinedBooks.filter((book, index, self) => 
          index === self.findIndex(b => b.id === book.id)
        );
        
        return uniqueBooks;
        
      case "categories":
        return categoryResults.map(category => ({
          id: category.id,
          title: category.title,
          type: "category" as const
        }));
        
      case "all":
      default:
        // Combine all results for the "All" tab
        const allSearchBookItems: BookSearchResult[] = searchResults.map(book => ({
          ...book,
          type: "book" as const,
          source: "search" as const
        }));
        
        const allBookItems: BookResult[] = bookResults.map(book => ({
          ...book,
          type: "book" as const,
          source: "books" as const
        }));
        
        const categoryItems: CategoryResult[] = categoryResults.map(category => ({
          id: category.id,
          title: category.title,
          type: "category" as const
        }));

        // Remove duplicates from combined book results
        const allCombinedBooks = [...allSearchBookItems, ...allBookItems];
        const allUniqueBooks = allCombinedBooks.filter((book, index, self) => 
          index === self.findIndex(b => b.id === book.id)
        );

        return [...allUniqueBooks, ...categoryItems];
    }
  }, [activeTab, searchResults, bookResults, categoryResults]);

  // Auto-switch to appropriate tab based on search type
  useEffect(() => {
    if (searchType === "category" && activeTab !== "categories") {
      setActiveTab("categories");
    } else if (searchType === "title" && activeTab !== "books") {
      setActiveTab("books");
    }
  }, [searchType, activeTab]);
  
  // Handle result item press
  const handleResultPress = useCallback((item: SearchResult) => {
    if (!item) return;
    
    switch (item.type) {
      case "book":
        router.push(`/books/${item.id}`);
        break;
      case "category":
        router.push(`/books/category/${item.id}`);
        break;
    }
  }, []);

  // Render each result item
  const renderResultItem = useCallback(({ item }: { item: SearchResult }) => {
    if (!item) return null;
    
    return (
      <SearchResultItem
        item={item}
        onPress={() => handleResultPress(item)}
        searchQuery={searchQuery} // Pass search query for highlighting
        searchType={searchType} // Pass search type for better rendering
      />
    );
  }, [handleResultPress, searchQuery, searchType]);

  // Refresh handling
  const handleRefresh = useCallback(() => {
    // Re-trigger search with current query
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, [searchQuery, handleSearch]);

  // Clear search handling
  const handleClearSearch = useCallback(() => {
    clearResults();
    setActiveTab("all");
  }, [clearResults]);

  // Empty state component
  const renderEmptyState = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={CommonColors.primary} />
          <Text style={styles.emptyText}>Mencari...</Text>
          {searchType !== "general" && (
            <Text style={styles.searchTypeText}>
              Mode pencarian: {getSearchTypeLabel(searchType)}
            </Text>
          )}
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={CommonColors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (searchQuery && !isLoading && !hasResults) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={48} color={CommonColors.gray400} />
          <Text style={styles.emptyText}>Tidak ada hasil untuk `&quot;`{searchQuery}`&quot;`</Text>
          {searchType !== "general" && (
            <Text style={styles.searchTypeText}>
              Coba pencarian {getSearchTypeLabel(searchType)} atau ubah kata kunci
            </Text>
          )}
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={64} color={CommonColors.gray300} />
        <Text style={styles.initialText}>Cari buku, kategori, atau penulis</Text>
        <Text style={styles.searchTipsText}>
          Tips: Gunakan `&quot;`...`&quot;` untuk pencarian frasa, title: untuk judul, category: untuk kategori
        </Text>
      </View>
    );
  }, [isLoading, error, searchQuery, hasResults, searchType, handleRefresh]);

  // Get search type label
  const getSearchTypeLabel = (type: string): string => {
    switch (type) {
      case "phrase": return "frasa";
      case "title": return "judul";
      case "category": return "kategori";
      default: return "umum";
    }
  };
  
  // Calculate counts for each tab with enhanced book results
  const tabCounts = useMemo(() => {
    // Remove duplicates from combined book results for accurate counting
    const combinedBooks = [...searchResults, ...bookResults];
    const uniqueBooks = combinedBooks.filter((book, index, self) => 
      index === self.findIndex(b => b.id === book.id)
    );
    
    const bookCount = uniqueBooks.length;
    const categoryCount = categoryResults.length;
    const totalCount = bookCount + categoryCount;
    
    return {
      all: totalCount,
      books: bookCount,
      categories: categoryCount
    };
  }, [searchResults, bookResults, categoryResults]);
  
  // Tab section with dynamic count
  const renderTabs = useCallback(() => {
    const tabs = [
      { 
        id: "all", 
        label: "Semua", 
        count: tabCounts.all
      },
      { 
        id: "books", 
        label: "Buku", 
        count: tabCounts.books
      },
      { 
        id: "categories", 
        label: "Kategori", 
        count: tabCounts.categories
      },
    ];
    
    return (
      <View style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
              tab.count === 0 && searchQuery && styles.disabledTab
            ]}
            onPress={() => setActiveTab(tab.id as SearchTab)}
            disabled={tab.count === 0 && !!searchQuery}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
                tab.count === 0 && searchQuery && styles.disabledTabText
              ]}
            >
              {tab.label}
              {searchQuery && tab.count > 0 && (
                <Text style={styles.tabCount}> ({tab.count})</Text>
              )}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [activeTab, tabCounts, searchQuery]);

  // Result count display with search type info
  const renderResultCount = useCallback(() => {
    if (!searchQuery || isLoading || !filteredResults.length) return null;
    
    let countText = `${filteredResults.length} hasil ditemukan`;
    
    // Add specific type count for the active tab
    if (activeTab !== "all") {
      const tabName = activeTab === "books" ? "buku" : 
                      activeTab === "categories" ? "kategori" : "item";
      countText = `${filteredResults.length} ${tabName} ditemukan`;
    }
    
    // Add source information for book results
    let sourceInfo = "";
    if (activeTab === "books" || activeTab === "all") {
      const searchCount = searchResults.length;
      const bookCount = bookResults.length;
      if (searchCount > 0 && bookCount > 0) {
        sourceInfo = ` (${searchCount} dari pencarian, ${bookCount} dari katalog)`;
      } else if (bookCount > 0) {
        sourceInfo = ` (dari katalog)`;
      } else if (searchCount > 0) {
        sourceInfo = ` (dari pencarian)`;
      }
    }
    
    return (
      <View style={styles.resultCountContainer}>
        <Text style={styles.resultCountText}>
          {countText} untuk `&quot;`{searchQuery}`&quot;`{sourceInfo}
        </Text>
        {searchType !== "general" && (
          <Text style={styles.searchTypeIndicator}>
            Pencarian {getSearchTypeLabel(searchType)}
          </Text>
        )}
      </View>
    );
  }, [searchQuery, isLoading, filteredResults.length, activeTab, searchType, searchResults.length, bookResults.length]);

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: SearchResult) => {
    // Add source to key for book items to handle duplicates
    if (item.type === "book" && "source" in item) {
      return `${item.type}-${item.source}-${item.id}`;
    }
    return `${item.type}-${item.id}`;
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        {Platform.OS === 'ios' && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={CommonColors.gray800} />
          </TouchableOpacity>
        )}
        
        <SearchBar 
          value={searchQuery}
          onChangeText={handleSearch}
          onClear={handleClearSearch}
          placeholder="Cari buku, kategori, penulis..."
          autoFocus={!initialQuery}
          showClearButton={!!searchQuery}
        />
      </View>

      {(searchQuery || hasResults) && (
        <>
          {renderTabs()}
          {renderResultCount()}
        </>
      )}

      <FlatList
        data={filteredResults}
        renderItem={renderResultItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContainer,
          filteredResults.length === 0 && styles.emptyListContainer
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshing={isLoading}
        onRefresh={handleRefresh}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        getItemLayout={undefined} // Let FlatList calculate
      />
    </SafeAreaView>
  );
};

export default SearchScreen;

/**
 * Component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CommonColors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: CommonColors.white,
    borderBottomWidth: 1,
    borderBottomColor: CommonColors.gray200,
  },
  backButton: {
    marginRight: Spacing.sm,
  },
  listContainer: {
    flexGrow: 1,
    paddingVertical: Spacing.md,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    marginTop: Spacing.xl,
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.base,
    color: CommonColors.gray600,
    textAlign: "center",
  },
  initialText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.lg,
    color: CommonColors.gray500,
    textAlign: "center",
  },
  searchTipsText: {
    marginTop: Spacing.sm,
    fontSize: Typography.sizes.xs,
    color: CommonColors.gray400,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 18,
  },
  searchTypeText: {
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.xs,
    color: CommonColors.primary,
    textAlign: "center",
    fontWeight: "500",
  },
  errorText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.base,
    color: CommonColors.error,
    textAlign: "center",
  },
  retryButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: CommonColors.primary,
    borderRadius: 4,
  },
  retryText: {
    color: CommonColors.white,
    fontWeight: "500",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: CommonColors.white,
    paddingTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: CommonColors.gray200,
  },
  tab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.md,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: CommonColors.primary,
  },
  disabledTab: {
    opacity: 0.5,
  },
  tabText: {
    fontSize: Typography.sizes.sm,
    fontWeight: "500",
    color: CommonColors.gray600,
  },
  activeTabText: {
    color: CommonColors.primary,
    fontWeight: "600",
  },
  disabledTabText: {
    color: CommonColors.gray400,
  },
  tabCount: {
    fontSize: Typography.sizes.xs,
    fontWeight: "400",
  },
  resultCountContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: CommonColors.gray50,
  },
  resultCountText: {
    fontSize: Typography.sizes.xs,
    color: CommonColors.gray600,
  },
  searchTypeIndicator: {
    fontSize: Typography.sizes.xs,
    color: CommonColors.primary,
    fontWeight: "500",
    marginTop: 2,
  },
});