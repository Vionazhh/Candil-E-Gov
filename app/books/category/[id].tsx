import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

// Components
import { BookGrid } from "@/components/organisms/BookGrid";
import { LibraryHeader } from "@/components/organisms/LibraryHeader";

// Types, Constants & Hooks
import { CommonColors, CategoryScreenColors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import { useBook } from "@/hooks/useBook";
import bookService from "@/services/BookService";
import { Category } from "@/types/Category";
import { parseError } from "@/types/errors/AppError";
import { router, useLocalSearchParams } from "expo-router";

export default function CategoryDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const {
    books,
    isLoading: isLoadingBooks,
    error: booksError,
    handleBookPress,
    refreshBooks,
  } = useBook({
    categoryId: params.id,
    categoryTitle: category?.title,
  });

  // Fetch category details
  useEffect(() => {
    const fetchCategory = async () => {
      if (!params.id) {
        setCategoryError("Category ID is missing");
        setIsLoadingCategory(false);
        return;
      }

      try {
        setIsLoadingCategory(true);
        // Use the getCategories method and find the category by ID
        const categories = await bookService.getCategories();
        const foundCategory = categories.find((cat) => cat.id === params.id);

        if (!foundCategory) {
          throw new Error(`Category with ID ${params.id} not found`);
        }

        setCategory(foundCategory);
      } catch (error) {
        const appError = parseError(error);
        setCategoryError(appError.message);
      } finally {
        setIsLoadingCategory(false);
      }
    };

    fetchCategory();
  }, [params.id]);

  // Handle navigation back
  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }, []);

  // Loading state
  if (isLoadingCategory) {
    return (
      <SafeAreaView style={styles.container}>
        <LibraryHeader title="Loading..." onBackPress={handleBackPress} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={CommonColors.primary} />
          <Text style={styles.loadingText}>Loading category details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (categoryError) {
    return (
      <SafeAreaView style={styles.container}>
        <LibraryHeader title="Error" onBackPress={handleBackPress} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{categoryError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LibraryHeader
        title={category?.title || "Category"}
        subtitle={`${books.length} books available`}
        onBackPress={handleBackPress}
      />

      {category && (
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryDescription}>
            {category.description ||
              `Browse all books in the ${category.title} category.`}
          </Text>
        </View>
      )}

      <View style={styles.content}>
        <BookGrid
          books={books}
          onBookPress={handleBookPress}
          isLoading={isLoadingBooks}
          error={booksError}
          onRefresh={refreshBooks}
          emptyMessage={`No books found in "${category?.title}" category`}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CategoryScreenColors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.base,
    color: CategoryScreenColors.textSecondary,
  },
  errorText: {
    fontSize: Typography.sizes.base,
    color: CommonColors.error,
    textAlign: "center",
  },
  categoryHeader: {
    backgroundColor: CategoryScreenColors.cardBackground,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: CategoryScreenColors.border,
  },
  categoryDescription: {
    fontSize: Typography.sizes.sm,
    color: CategoryScreenColors.textSecondary,
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
});
