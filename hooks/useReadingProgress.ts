/**
 * Reading progress hook for tracking and managing book reading state
 */
import { borrowService } from '@/services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';

/**
 * Reading progress data structure
 */
export interface ReadingProgressData {
  bookId: string;
  progress: number; // 0-1 value representing reading progress
  page: number;
  lastReadAt: number; // timestamp
}

/**
 * Hook return type definition
 */
export interface UseReadingProgressReturn {
  trackProgress: (bookId: string, progress: number, page: number) => Promise<void>;
  getProgress: (bookId: string) => Promise<ReadingProgressData | null>;
  completeReading: (bookId: string) => Promise<boolean>;
  resetProgress: (bookId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Storage key prefix for reading progress
const PROGRESS_STORAGE_KEY_PREFIX = 'reading_progress_';

/**
 * Hook to manage reading progress tracking and book completion
 * Provides functionality to track, retrieve, complete, and reset reading progress
 */
export const useReadingProgress = (): UseReadingProgressReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Track and save reading progress
   * @param bookId Book identifier
   * @param progress Progress value (0-1)
   * @param page Current page number
   */
  const trackProgress = useCallback(async (
    bookId: string, 
    progress: number, 
    page: number
  ): Promise<void> => {
    try {
      const progressData: ReadingProgressData = {
        bookId,
        progress,
        page,
        lastReadAt: Date.now(),
      };

      // Save to AsyncStorage
      await AsyncStorage.setItem(
        `${PROGRESS_STORAGE_KEY_PREFIX}${bookId}`,
        JSON.stringify(progressData)
      );
    } catch (err) {
      console.error('Failed to save reading progress:', err);
      setError('Failed to save reading progress');
    }
  }, []);

  /**
   * Get saved reading progress for a book
   * @param bookId Book identifier
   * @returns Reading progress data or null if not found
   */
  const getProgress = useCallback(async (
    bookId: string
  ): Promise<ReadingProgressData | null> => {
    try {
      const savedProgressJSON = await AsyncStorage.getItem(
        `${PROGRESS_STORAGE_KEY_PREFIX}${bookId}`
      );
      
      if (savedProgressJSON) {
        return JSON.parse(savedProgressJSON) as ReadingProgressData;
      }
      
      return null;
    } catch (err) {
      console.error('Failed to retrieve reading progress:', err);
      setError('Failed to retrieve reading progress');
      return null;
    }
  }, []);

  /**
   * Complete reading a book and mark it as returned
   * @param bookId Book identifier
   * @returns True if successful, false otherwise
   */
  const completeReading = useCallback(async (bookId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // First, find active borrow for this book
      const borrows = await borrowService.getBookBorrows(bookId);
      const activeBorrow = borrows.find(borrow => borrow.status === 'active');
      
      if (activeBorrow) {
        // Return the book
        await borrowService.returnBook(activeBorrow.id || '');
      }
      
      // Remove progress data
      await AsyncStorage.removeItem(`${PROGRESS_STORAGE_KEY_PREFIX}${bookId}`);
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Failed to complete reading:', err);
      setError('Failed to complete reading');
      setLoading(false);
      return false;
    }
  }, []);

  /**
   * Reset reading progress for a book
   * @param bookId Book identifier
   */
  const resetProgress = useCallback(async (bookId: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(`${PROGRESS_STORAGE_KEY_PREFIX}${bookId}`);
    } catch (err) {
      console.error('Failed to reset reading progress:', err);
      setError('Failed to reset reading progress');
    }
  }, []);

  return {
    trackProgress,
    getProgress,
    completeReading,
    resetProgress,
    loading,
    error,
  };
};

export default useReadingProgress; 