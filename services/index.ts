/**
 * Service module exports
 * Exports all service classes and their respective types
 * Handles platform-specific exports for web compatibility
 */
import { Platform } from 'react-native';

// Service class exports with platform-specific handling
import authorServiceInstance from './AuthorService';
import bookServiceInstance from './BookService';
import borrowServiceClass from './BorrowService';
import categoryServiceInstance from './CategoryService';
import publisherServiceInstance from './PublisherService';

// Create web-safe BorrowService with required methods
class WebSafeBorrowService {
  constructor() {
    console.warn('BorrowService is not fully supported on web platform');
  }

  async getUserActiveBorrows() { return []; }
  async getBookBorrows() { return []; }
  async isBookAvailable() { return true; }
  async borrowBook() { throw new Error('Not available on web'); }
  async returnBook() { throw new Error('Not available on web'); }
  async getUserBorrowHistory() { return []; }
  async getBorrowById() { return null; }
  async getAll() { return { items: [], total: 0, page: 1, limit: 10, hasMore: false }; }
}

// Determine if we're on web platform
// const isWeb = Platform.OS === 'web';

// Service exports with web-compatibility
export const authorService = authorServiceInstance;
export const bookService = bookServiceInstance;
export const borrowService = borrowServiceClass;
export const categoryService = categoryServiceInstance;
export const publisherService = publisherServiceInstance;

// Default exports for backward compatibility
export default {
  authorService,
  bookService,
  borrowService,
  categoryService,
  publisherService
};

// Type exports
export type { ListResponse, QueryOptions } from './BaseService';
export type { Borrow, BorrowStatus } from './BorrowService';

