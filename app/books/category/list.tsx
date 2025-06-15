import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types/Category';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Category item component for the list
const CategoryItem = ({ category, onPress }: { category: Category; onPress: () => void }) => (
  <TouchableOpacity style={styles.categoryItem} onPress={onPress}>
    <Text style={styles.categoryTitle} numberOfLines={2}>{category.title}</Text>
    <Ionicons name="chevron-forward" size={20} color={CommonColors.gray400} style={styles.chevron} />
  </TouchableOpacity>
);

export default function CategoryListScreen() {
  const router = useRouter();
  const { categories, handleCategoryPress, isLoading, error } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');

  const handleBackPress = () => {
    router.back();
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter((category: Category) =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create two columns of data
  const createTwoColumnData = (data: Category[]) => {
    const leftColumn = data.filter((_, i) => i % 2 === 0);
    const rightColumn = data.filter((_, i) => i % 2 !== 0);
    return { leftColumn, rightColumn };
  };

  const { leftColumn, rightColumn } = createTwoColumnData(filteredCategories);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={CommonColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kategori Buku</Text>
        <View style={styles.rightHeader} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={CommonColors.gray500} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari kategori..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={CommonColors.gray400}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={CommonColors.gray500} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Grid */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CommonColors.primary} />
          <Text style={styles.loadingText}>Memuat kategori...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gridContainer}>
          {/* Left Column */}
          <View style={styles.column}>
            {leftColumn.map((category: Category) => (
              <CategoryItem
                key={category.id}
                category={category}
                onPress={() => handleCategoryPress(category)}
              />
            ))}
          </View>
          
          {/* Right Column */}
          <View style={styles.column}>
            {rightColumn.map((category: Category) => (
              <CategoryItem
                key={category.id}
                category={category}
                onPress={() => handleCategoryPress(category)}
              />
            ))}
          </View>
          
          {filteredCategories.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="file-tray-outline" size={64} color={CommonColors.gray300} />
              <Text style={styles.emptyText}>
                {searchQuery.length > 0
                  ? `Tidak ada kategori dengan nama "${searchQuery}"`
                  : "Belum ada kategori yang tersedia"}
              </Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CommonColors.white,
  },
  header: {
    backgroundColor: CommonColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    color: CommonColors.white,
  },
  rightHeader: {
    width: 40,
  },
  searchContainer: {
    backgroundColor: CommonColors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: CommonColors.gray200,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CommonColors.gray100,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    color: CommonColors.gray900,
    fontSize: Typography.sizes.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.base,
    color: CommonColors.gray600,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    fontSize: Typography.sizes.base,
    color: CommonColors.danger,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  retryButton: {
    backgroundColor: CommonColors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
  },
  retryButtonText: {
    color: CommonColors.white,
    fontWeight: '600',
  },
  gridContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: CommonColors.gray200,
    borderRightWidth: 0.5,
    borderRightColor: CommonColors.gray200,
    borderLeftWidth: 0.5,
    borderLeftColor: CommonColors.gray200,
    minHeight: 60,
  },
  categoryTitle: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray900,
    paddingRight: 8,
  },
  chevron: {
    marginLeft: 4,
  },
  emptyContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: CommonColors.white,
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.base,
    color: CommonColors.gray600,
    textAlign: 'center',
  },
});
