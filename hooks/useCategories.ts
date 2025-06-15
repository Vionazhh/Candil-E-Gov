import { categoryService } from '@/services';
import { Category } from '@/types/Category';
import { parseError } from '@/types/errors/AppError';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

interface UseCategoriesOptions {
  onCategorySelect?: (category: Category) => void;
}

interface UseCategoriesResult {
  categories: Category[];
  featuredCategories: Category[];
  popularCategories: Category[];
  isLoading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
  handleCategoryPress: (category: Category) => void;
  getCategoryById: (id: string) => Promise<Category | undefined>;
}

/**
 * Return type for the useCategories hook
 */
export interface UseCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
}

/**
 * Hook for managing categories data and interactions
 * 
 * @param options - Optional configuration
 * @returns Category data and interaction methods
 */
export const useCategories = (options?: UseCategoriesOptions): UseCategoriesResult => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([]);
  const [popularCategories, setPopularCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  
  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all categories
      const result = await categoryService.getAllCategories();
      setCategories(result.items);
      
      // Get featured categories
      const featured = await categoryService.getFeaturedCategories();
      setFeaturedCategories(featured.items);
      
      // Get popular categories
      // const popular = await categoryService.getPopularCategories();
      // setPopularCategories(popular);
    } catch (err) {
      const appError = parseError(err);
      setError(appError.message);
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  // Handler for category selection
  const handleCategoryPress = useCallback((category: Category) => {
    if (options?.onCategorySelect) {
      options.onCategorySelect(category);
    } else {
      // Navigate to category screen with the selected category ID
      router.push({
        pathname: `/books/category/${category.id}`,
      });
    }
  }, [options, router]);
  
  // Utility to find a category by ID
  const getCategoryById = useCallback(async (id: string) => {
    try {
      return await categoryService.getById(id);
    } catch (err) {
      console.error('Error getting category by ID:', err);
      return undefined;
    }
  }, []);
  
  // Refresh categories
  const refreshCategories = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    featuredCategories,
    popularCategories,
    isLoading,
    error,
    refreshCategories,
    handleCategoryPress,
    getCategoryById,
  };
};
