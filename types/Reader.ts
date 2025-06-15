/**
 * Represents a library reader/user
 */
export interface Reader {
  id: string | number;
  name: string;
  readingTime: string;
  backgroundColor: string;
}

/**
 * Statistics for a reader
 */
export interface ReaderStats {
  totalBooksRead: number;
  totalTimeSpent: string; // Format: "HH:MM:SS"
  favoriteCategories: string[];
  lastActivity?: Date;
}

/**
 * Reading history entry
 */
export interface ReadingHistoryEntry {
  bookId: string;
  startTime: Date;
  endTime?: Date;
  progress: number; // 0-100 percentage
  isComplete: boolean;
}

/**
 * Reader with detailed statistics
 */
export interface ReaderWithStats extends Reader {
  stats: ReaderStats;
  history?: ReadingHistoryEntry[];
} 