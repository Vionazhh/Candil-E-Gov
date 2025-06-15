import { auth } from '@/config/firebase';
import { Borrow, borrowService } from '@/services';
import { parseError } from '@/types/errors/AppError';
import { useCallback, useEffect, useState } from 'react';

interface UseBorrowsResult {
  borrows: Borrow[];
  isLoading: boolean;
  error: string | null;
  borrowBook: (bookId: string) => Promise<void>;
  returnBook: (borrowId: string) => Promise<void>;
  refreshBorrows: () => Promise<void>;
  getBorrowsByBookId: (bookId: string) => Promise<Borrow[]>;
  isBookAvailable: (bookId: string) => Promise<boolean>;
  getUserBorrowHistory: () => Promise<Borrow[]>;
  getBorrowDetails: (borrowId: string) => Promise<Borrow | null>;
  checkForOverdueBooks: () => Promise<void>;
}

export const useBorrows = (): UseBorrowsResult => {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchBorrows = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Make sure user is authenticated
      const user = auth.currentUser;
      if (!user) {
        setError('Silahkan login terlebih dahulu');
        return;
      }
      
      // This will automatically check and return overdue books
      const userBorrows = await borrowService.getUserActiveBorrows(user.uid);
      setBorrows(userBorrows);
    } catch (err) {
      const appError = parseError(err);
      setError(appError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchBorrows();
  }, [fetchBorrows]);
  
  const borrowBook = useCallback(async (bookId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Make sure user is authenticated
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Silahkan login terlebih dahulu');
      }
      
      // Borrow the book - due date is automatically set to 7 days from now
      await borrowService.borrowBook(bookId, user.uid);
      await fetchBorrows(); // Refresh borrows after borrowing
    } catch (err) {
      const appError = parseError(err);
      setError(appError.message);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBorrows]);
  
  const returnBook = useCallback(async (borrowId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await borrowService.returnBook(borrowId);
      await fetchBorrows(); // Refresh borrows after returning
    } catch (err) {
      const appError = parseError(err);
      setError(appError.message);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBorrows]);

  const refreshBorrows = useCallback(async () => {
    await fetchBorrows();
  }, [fetchBorrows]);

  const getBorrowsByBookId = useCallback(async (bookId: string): Promise<Borrow[]> => {
    try {
      return await borrowService.getBookBorrows(bookId);
    } catch (err) {
      const appError = parseError(err);
      setError(appError.message);
      return [];
    }
  }, []);

  const isBookAvailable = useCallback(async (bookId: string): Promise<boolean> => {
    try {
      return await borrowService.isBookAvailable(bookId);
    } catch (err) {
      const appError = parseError(err);
      setError(appError.message);
      return false;
    }
  }, []);
  
  const getUserBorrowHistory = useCallback(async (): Promise<Borrow[]> => {
    try {
      // Make sure user is authenticated
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Silahkan login terlebih dahulu');
      }
      
      return await borrowService.getUserBorrowHistory(user.uid);
    } catch (err) {
      const appError = parseError(err);
      setError(appError.message);
      return [];
    }
  }, []);
  
  const getBorrowDetails = useCallback(async (borrowId: string): Promise<Borrow | null> => {
    try {
      return await borrowService.getBorrowById(borrowId);
    } catch (err) {
      const appError = parseError(err);
      setError(appError.message);
      return null;
    }
  }, []);
  
  const checkForOverdueBooks = useCallback(async (): Promise<void> => {
    try {
      // Make sure user is authenticated
      const user = auth.currentUser;
      if (!user) {
        return;
      }
      
      // This will automatically check and return overdue books
      await fetchBorrows();
    } catch (err) {
      const appError = parseError(err);
      setError(appError.message);
    }
  }, [fetchBorrows]);
  
  return {
    borrows,
    isLoading,
    error,
    borrowBook,
    returnBook,
    refreshBorrows,
    getBorrowsByBookId,
    isBookAvailable,
    getUserBorrowHistory,
    getBorrowDetails,
    checkForOverdueBooks,
  };
};

export default useBorrows; 