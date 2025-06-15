/**
 * Book-related type definitions and utilities
 * Defines structures for books, authors, publishers, and related entities
 */
import { Category } from './Category';

/**
 * Book availability status enum
 */
export enum BookAvailability {
  AVAILABLE = 'Available',
  BORROWED = 'Borrowed',
  // RESERVED = 'Reserved',
  UNAVAILABLE = 'Unavailable',
  // PROCESSING = 'Processing',
}

/**
 * Book format enum
 */
// export enum BookFormat {
//   HARDCOVER = 'Hardcover',
//   PAPERBACK = 'Paperback',
//   EBOOK = 'E-Book',
//   AUDIOBOOK = 'Audiobook',
//   PDF = 'PDF',
// }

/**
 * Book language enum
 */
export enum BookLanguage {
  INDONESIAN = 'Indonesian',
  ENGLISH = 'English',
  ARABIC = 'Arabic',
  JAVANESE = 'Javanese',
  OTHER = 'Other',
}

/**
 * Badge types for book UI display
 */
export enum BadgeType {
  NEW = 'New',
  POPULAR = 'Popular',
  RECOMMENDED = 'Recommended',
  LIMITED = 'Limited',
  NONE = '',
}

/**
 * Badge color type mapping
 */
export type BadgeColors = {
  [key in BadgeType]: string;
};

/**
 * Default badge colors for UI
 */
export const DEFAULT_BADGE_COLORS: BadgeColors = {
  [BadgeType.NEW]: '#4CAF50',
  [BadgeType.POPULAR]: '#FF9800',
  [BadgeType.RECOMMENDED]: '#2196F3',
  [BadgeType.LIMITED]: '#F44336',
  [BadgeType.NONE]: 'transparent',
};

/**
 * Author information
 */
export interface Author {
  id: string;
  name: string;
  photoUrl?: string;
  biography?: string;
}

/**
 * Publisher information
 */
export interface Publisher {
  id: string;
  name: string;
  location?: string;
}

/**
 * Base book interface with required properties
 */
export interface BookBase {
  id: string;
  title: string;
  authorId: string;
  author?: Author;
  coverImage: string;
  categoryId: string;
  category?: Category;
  publisherId?: string;
  publisher?: Publisher;
}

/**
 * Book details interface for additional metadata
 */
export interface BookDetails {
  isbn?: string;
  publishYear?: number;
  pageCount?: number;
  language?: BookLanguage;
  // format?: BookFormat;
  description?: string;
  // tags?: string[];
  rating?: number;
  // reviewCount?: number;
  audioUrl?: string;
  pdfUrl?: string;
  readCount?: number;
  // content?: string;
}

/**
 * Book availability information
 */
export interface BookInventory {
  totalStock: number;
  availableStock: number;
  borrowedCount?: number;
  lastRestockDate?: Date | string;
}

/**
 * Book UI presentation properties
 */
export interface BookUIProps {
  badge?: BadgeType;
  badgeColor?: string;
  highlighted?: boolean;
  promoted?: boolean;
}

/**
 * Complete book interface combining all aspects
 */
export interface Book extends BookBase, Partial<BookDetails> {
  availability: BookAvailability | string;
  inventory?: BookInventory;
  // availabilityInfo?: BookAvailabilityInfo;
  ui?: BookUIProps;
}

/**
 * Book search parameters
 */
export interface BookSearchParams {
  query: string;
  categoryId?: string;
  authorId?: string;
  publisherId?: string;
  language?: BookLanguage;
  // format?: BookFormat;
  availability?: BookAvailability;
  yearRange?: [number, number];
  // tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'author' | 'publishYear' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Book filter options
 */
export interface BookFilterOptions {
  categories?: string[];
  availability?: BookAvailability[];
  languages?: BookLanguage[];
  // formats?: BookFormat[];
  fromYear?: number;
  toYear?: number;
  minRating?: number;
  // tags?: string[];
}

/**
 * Type guard to check if an object is a valid Book
 */
export function isBook(obj: any): obj is Book {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.authorId === 'string' &&
    typeof obj.coverImage === 'string' &&
    typeof obj.categoryId === 'string'
  );
}

/**
 * Type guard to check if a string is a valid BookAvailability value
 */
export function isBookAvailability(value: string): value is BookAvailability {
  return Object.values(BookAvailability).includes(value as BookAvailability);
}

/**
 * Gets the badge color for a badge type
 */
export function getBadgeColor(badge: BadgeType | string): string {
  if (Object.values(BadgeType).includes(badge as BadgeType)) {
    return DEFAULT_BADGE_COLORS[badge as BadgeType] || DEFAULT_BADGE_COLORS[BadgeType.NONE];
  }
  return DEFAULT_BADGE_COLORS[BadgeType.NONE];
}