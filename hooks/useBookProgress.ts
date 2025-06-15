import { BorrowService } from '@/services/BorrowService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

interface BookProgress {
  bookId: string;
  progress: number;
  page: number;
  lastRead: string;
  completed: boolean;
}

interface BookProgressMap {
  [key: string]: BookProgress;
}

const PROGRESS_STORAGE_KEY = '@book_progress';
const PROGRESS_SYNC_INTERVAL = 30000; // 30 seconds
const MIN_PROGRESS_DELTA = 0.01; // Minimum change in progress (1%) to trigger storage

/**
 * Hook to track and manage book reading progress with AsyncStorage persistence
 * and synchronization with backend when online
 */
const useBookProgress = () => {
  const [progressMap, setProgressMap] = useState<BookProgressMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const borrowService = new BorrowService();

  // Load progress from AsyncStorage on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        setIsLoading(true);
        const storedProgress = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
        
        if (storedProgress) {
          setProgressMap(JSON.parse(storedProgress));
        }
      } catch (error) {
        console.error('Error loading book progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, []);
  
  // Save progress to AsyncStorage
  const saveProgressToStorage = useCallback(async (newProgressMap: BookProgressMap) => {
    try {
      await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(newProgressMap));
    } catch (error) {
      console.error('Error saving book progress:', error);
    }
  }, []);
  
  // Sync local progress with server
  const syncProgressWithServer = useCallback(async () => {
    try {
      // Check if borrowService exists and has the required method
      if (!borrowService || typeof borrowService.updateReadingProgress !== 'function') {
        console.error('BorrowService or updateReadingProgress method not available');
        setSyncError('Service unavailable for syncing progress');
        return;
      }
      
      const progressesToSync = Object.values(progressMap).filter(
        progress => !progress.completed
      );
      
      if (progressesToSync.length === 0) {
        return;
      }
      
      // Update progress in batches
      const updatePromises = progressesToSync.map(progress =>
        borrowService.updateReadingProgress(
          progress.bookId,
          progress.progress,
          progress.page
        )
      );
      
      await Promise.all(updatePromises);
      setSyncError(null);
    } catch (error) {
      console.error('Error syncing reading progress:', error);
      setSyncError('Failed to sync reading progress');
    }
  }, [progressMap, borrowService]);
  
  // Periodically sync progress with backend when changes exist
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (Object.keys(progressMap).length > 0) {
        syncProgressWithServer();
      }
    }, PROGRESS_SYNC_INTERVAL);
    
    return () => {
      clearInterval(syncInterval);
    };
  }, [progressMap, syncProgressWithServer]);
  
  // Track reading progress
  const trackProgress = useCallback(
    (bookId: string, progress: number, page: number) => {
      // Only track if progress changed significantly
      const currentProgress = progressMap[bookId]?.progress || 0;
      if (Math.abs(progress - currentProgress) < MIN_PROGRESS_DELTA && progressMap[bookId]) {
        return;
      }
      
      const now = new Date().toISOString();
      const newProgress: BookProgress = {
        bookId,
        progress,
        page,
        lastRead: now,
        completed: progress >= 1,
      };
      
      const updatedProgressMap = {
        ...progressMap,
        [bookId]: newProgress,
      };
      
      setProgressMap(updatedProgressMap);
      saveProgressToStorage(updatedProgressMap);
    },
    [progressMap, saveProgressToStorage]
  );
  
  // Complete reading
  const completeReading = useCallback(
    async (bookId: string) => {
      try {
        // Check if borrowService exists and has the required method
        if (!borrowService || typeof borrowService.completeReading !== 'function') {
          console.error('BorrowService or completeReading method not available');
          return false;
        }
        
        // Mark as completed locally
        const updatedProgressMap = {
          ...progressMap,
          [bookId]: {
            ...(progressMap[bookId] || { bookId, page: 1 }),
            progress: 1,
            completed: true,
            lastRead: new Date().toISOString(),
          },
        };
        
        setProgressMap(updatedProgressMap);
        await saveProgressToStorage(updatedProgressMap);
        
        // Notify the server of completion
        await borrowService.completeReading(bookId);
        
        return true;
      } catch (error) {
        console.error('Error completing book:', error);
        return false;
      }
    },
    [progressMap, saveProgressToStorage, borrowService]
  );
  
  // Get progress for a book
  const getProgress = useCallback(
    (bookId: string) => {
      return progressMap[bookId] || null;
    },
    [progressMap]
  );
  
  // Get all progress records
  const getAllProgress = useCallback(() => {
    return Object.values(progressMap);
  }, [progressMap]);

  return {
    trackProgress,
    completeReading,
    getProgress,
    getAllProgress,
    isLoading,
    syncError,
    forceSyncWithServer: syncProgressWithServer,
  };
};

export default useBookProgress; 