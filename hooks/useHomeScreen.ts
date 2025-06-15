/**
 * Hook for managing home screen state and interactions
 * Handles UI components specific to the home screen
 */
import { Category } from '@/types/Category';
import { Reader } from '@/types/Reader';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useCategories } from './useCategories';

/**
 * Hook return interface
 */
export interface UseHomeScreenReturn {
  // State
  searchQuery: string;
  showBanner: boolean;
  isRefreshing: boolean;
  
  // Data
  topReaders: Reader[];
  
  // Handlers
  handleBannerClose: () => void;
  handleBannerAction: () => void;
  handleCategoryPress: (category: Category) => void;
  handleReaderPress: (reader: Reader) => void;
  handleSeeAllReaders: () => void;
  handleSeeAllCategories: () => void;
  refreshData: () => Promise<void>;
}

/**
 * Hook for managing home screen state and interactions
 * @returns Home screen state and handlers
 */
export const useHomeScreen = (): UseHomeScreenReturn => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showBanner, setShowBanner] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get categories from the categories hook
  const { categories, refreshCategories } = useCategories();

  // Mock data for readers - to be replaced with actual API
  // TODO: Replace with real data from a ReaderService
  const topReaders: Reader[] = useMemo(() => [
    {
      id: "1",
      name: "Siti Nuraeni",
      readingTime: "03:51:27",
      backgroundColor: "#FF6B9D",
    },
    {
      id: "2",
      name: "Selviani Dwi",
      readingTime: "02:57:39",
      backgroundColor: "#FFD93D",
    },
    {
      id: "3",
      name: "Yulia Mengsih",
      readingTime: "02:38:12",
      backgroundColor: "#A8A3FF",
    },
    {
      id: "4",
      name: "Ahmad Fauzi",
      readingTime: "02:15:45",
      backgroundColor: "#4ECDC4",
    },
    {
      id: "5",
      name: "Budi Santoso",
      readingTime: "01:58:33",
      backgroundColor: "#FF6B6B",
    },
  ], []);

  /**
   * Refresh all data on the home screen
   */
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Refresh categories data
      await refreshCategories();
      // Future: refresh readers data when API is available
    } catch (error) {
      console.error('Error refreshing home data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshCategories]);

  /**
   * Handle banner close action
   */
  const handleBannerClose = useCallback(() => {
    setShowBanner(false);
  }, []);

  /**
   * Handle banner action button
   */
  const handleBannerAction = useCallback(() => {
    // Navigate to featured books or promotion page
    router.push('/books/category/list');
  }, []);

  /**
   * Handle category selection
   * @param category Selected category
   */
  const handleCategoryPress = useCallback((category: Category) => {
    // Navigate to category page
    router.push(`/books/category/${category.id}`);
  }, []);

  /**
   * Handle reader profile selection
   * @param reader Selected reader
   */
  const handleReaderPress = useCallback((reader: Reader) => {
    // Navigate to reader profile
    console.log("Reader pressed:", reader);
    // Could implement: router.push(`/readers/${reader.id}`);
  }, []);

  /**
   * Navigate to all readers page
   */
  const handleSeeAllReaders = useCallback(() => {
    // Navigate to all readers page
    // For now, just log - implement navigation when readers page is available
    console.log("See all readers pressed");
    // router.push('/readers');
  }, []);

  /**
   * Navigate to all categories page
   */
  const handleSeeAllCategories = useCallback(() => {
    // Navigate to all categories page
    router.push('/books/category/list');
  }, []);

  return {
    // State
    searchQuery,
    showBanner,
    isRefreshing,

    // Data
    topReaders,

    // Handlers
    handleBannerClose,
    handleBannerAction,
    handleCategoryPress,
    handleReaderPress,
    handleSeeAllReaders,
    handleSeeAllCategories,
    refreshData,
  };
}; 