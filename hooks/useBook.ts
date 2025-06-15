/**
 * This file contains the useBook hook, which provides book-related functionality.
 */
import { bookService, ListResponse } from "@/services";
import {
  Book,
  BookFilterOptions
} from "@/types/Book";
import { parseError } from "@/types/errors/AppError";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { Alert } from "react-native";

/**
 * Props for the useBook hook
 */
interface UseBookProps {
  categoryId?: string;
  categoryTitle?: string;
  initialPage?: number;
  pageSize?: number;
}

/**
 * State type for the book reducer
 */
interface BookState {
  books: Book[];
  filteredBooks: Book[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  searchQuery: string;
  currentPage: number;
  totalBooks: number;
  hasMorePages: boolean;
  filterOptions: BookFilterOptions | null;
}

/**
 * Action types for the book reducer
 */
type BookAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: ListResponse<Book> }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SEARCH_START'; payload: string }
  | { type: 'SEARCH_SUCCESS'; payload: ListResponse<Book> }
  | { type: 'SEARCH_ERROR'; payload: string }
  | { type: 'FILTER_START'; payload: BookFilterOptions }
  | { type: 'FILTER_SUCCESS'; payload: ListResponse<Book> }
  | { type: 'FILTER_ERROR'; payload: string }
  | { type: 'REFRESH_START' }
  | { type: 'LOAD_MORE_START' }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'CLEAR_ERROR' };

/**
 * Initial state for the book reducer
 */
const initialState: BookState = {
  books: [],
  filteredBooks: [],
  isLoading: true,
  isRefreshing: false,
  error: null,
  searchQuery: '',
  currentPage: 1,
  totalBooks: 0,
  hasMorePages: false,
  filterOptions: null,
};

/**
 * Reducer function for book state management
 */
function bookReducer(state: BookState, action: BookAction): BookState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return { 
        ...state, 
        isLoading: false, 
        isRefreshing: false,
        books: action.payload.items, 
        filteredBooks: state.searchQuery ? state.filteredBooks : action.payload.items,
        totalBooks: action.payload.total,
        currentPage: action.payload.page,
        hasMorePages: action.payload.hasMore,
        error: null 
      };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, isRefreshing: false, error: action.payload };
    case 'SEARCH_START':
      return { ...state, isLoading: true, searchQuery: action.payload, error: null };
    case 'SEARCH_SUCCESS':
      return { 
        ...state, 
        isLoading: false, 
        filteredBooks: action.payload.items,
        totalBooks: action.payload.total,
        currentPage: action.payload.page,
        hasMorePages: action.payload.hasMore,
        error: null 
      };
    case 'SEARCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'FILTER_START':
      return { ...state, isLoading: true, filterOptions: action.payload, error: null };
    case 'FILTER_SUCCESS':
      return { 
        ...state, 
        isLoading: false, 
        filteredBooks: action.payload.items,
        totalBooks: action.payload.total,
        currentPage: action.payload.page,
        hasMorePages: action.payload.hasMore,
        error: null 
      };
    case 'FILTER_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'REFRESH_START':
      return { ...state, isRefreshing: true, error: null };
    case 'LOAD_MORE_START':
      return { ...state, isLoading: true, error: null };
    case 'CLEAR_SEARCH':
      return { 
        ...state, 
        searchQuery: '', 
        filteredBooks: state.filterOptions ? state.filteredBooks : state.books 
      };
    case 'CLEAR_FILTERS':
      return { 
        ...state, 
        filterOptions: null, 
        filteredBooks: state.searchQuery ? state.filteredBooks : state.books 
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

/**
 * Return type for the useBook hook
 */
interface UseBookReturn {
  books: Book[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasMorePages: boolean;
  totalBooks: number;
  handleBookPress: (book: Book) => void;
  handleMenuPress: () => void;
  refreshBooks: () => Promise<void>;
  loadMoreBooks: () => Promise<void>;
  searchBooks: (query: string) => Promise<void>;
  clearSearch: () => void;
  filterBooks: (options: BookFilterOptions) => Promise<void>;
  clearFilters: () => void;
  clearError: () => void;
  categoryTitle?: string;
  getBookById: (id: string) => Promise<Book>;
}

/**
 * Hook for managing book-related state and operations
 * Follows separation of concerns by handling UI state separately from data fetching
 */
export const useBook = ({
  categoryId,
  categoryTitle,
  initialPage = 1,
  pageSize = 20
}: UseBookProps = {}): UseBookReturn => {
  const [state, dispatch] = useReducer(bookReducer, {
    ...initialState,
    currentPage: initialPage
  });
  
  const router = useRouter();

  /**
   * Load books based on category or all books
   */
  const loadBooks = useCallback(async (page = state.currentPage) => {
    try {
      if (page === 1) {
        dispatch({ type: 'FETCH_START' });
      } else {
        dispatch({ type: 'LOAD_MORE_START' });
      }

      let response: ListResponse<Book>;
      
      if (categoryId) {
        // Get books by category with pagination
        response = await bookService.getBooksByCategory(categoryId, page, pageSize);
      } else {
        // Get all books with pagination
        response = await bookService.getAllBooks(page, pageSize);
      }
      
      dispatch({ type: 'FETCH_SUCCESS', payload: response });
    } catch (error) {
      const appError = parseError(error);
      dispatch({ type: 'FETCH_ERROR', payload: appError.message });
    }
  }, [categoryId, pageSize, state.currentPage]);

  // Load books when component mounts
  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  /**
   * Refresh books
   */
  const refreshBooks = useCallback(async () => {
    dispatch({ type: 'REFRESH_START' });
    try {
      await loadBooks(1);
    } catch (error) {
      console.error('Error refreshing books:', error);
    }
  }, [loadBooks]);

  /**
   * Load more books
   */
  const loadMoreBooks = useCallback(async () => {
    if (state.hasMorePages && !state.isLoading) {
      const nextPage = state.currentPage + 1;
      
      try {
        dispatch({ type: 'LOAD_MORE_START' });
        
        let response: ListResponse<Book>;
        
        if (state.searchQuery) {
          // Load more search results
          response = await bookService.searchBooks(
            state.searchQuery, 
            nextPage, 
            pageSize
          );
          dispatch({ type: 'SEARCH_SUCCESS', payload: response });
        } else if (state.filterOptions) {
          // Load more filtered results
          response = await bookService.getBooks(
            state.filterOptions, 
            nextPage, 
            pageSize
          );
          dispatch({ type: 'FILTER_SUCCESS', payload: response });
        } else if (categoryId) {
          // Load more books from category
          response = await bookService.getBooksByCategory(
            categoryId, 
            nextPage, 
            pageSize
          );
          dispatch({ type: 'FETCH_SUCCESS', payload: response });
        } else {
          // Load more books
          response = await bookService.getAllBooks(nextPage, pageSize);
          dispatch({ type: 'FETCH_SUCCESS', payload: response });
        }
      } catch (error) {
        const appError = parseError(error);
        dispatch({ type: 'FETCH_ERROR', payload: appError.message });
      }
    }
  }, [
    categoryId, 
    pageSize, 
    state.currentPage, 
    state.filterOptions, 
    state.hasMorePages, 
    state.isLoading, 
    state.searchQuery
  ]);

  /**
   * Search books by query
   */
  const searchBooks = useCallback(async (query: string) => {
    try {
      // If query is empty, clear search and show all books
      if (!query.trim()) {
        dispatch({ type: 'CLEAR_SEARCH' });
        return;
      }
      
      dispatch({ type: 'SEARCH_START', payload: query });
      
      // Search books with the query
      const response = await bookService.searchBooks(query, 1, pageSize);
      
      dispatch({ type: 'SEARCH_SUCCESS', payload: response });
    } catch (error) {
      const appError = parseError(error);
      dispatch({ type: 'SEARCH_ERROR', payload: appError.message });
    }
  }, [pageSize]);

  /**
   * Clear search query
   */
  const clearSearch = useCallback(() => {
    dispatch({ type: 'CLEAR_SEARCH' });
  }, []);

  /**
   * Filter books by options
   */
  const filterBooks = useCallback(async (options: BookFilterOptions) => {
    try {
      dispatch({ type: 'FILTER_START', payload: options });
      
      // If category is provided in props, add it to filter options
      if (categoryId) {
        options.categories = options.categories || [];
        if (!options.categories.includes(categoryId)) {
          options.categories.push(categoryId);
        }
      }
      
      const response = await bookService.getBooks(options, 1, pageSize);
      dispatch({ type: 'FILTER_SUCCESS', payload: response });
    } catch (error) {
      const appError = parseError(error);
      dispatch({ type: 'FILTER_ERROR', payload: appError.message });
    }
  }, [categoryId, pageSize]);

  /**
   * Clear filters
   */
  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  /**
   * Handle book press to navigate to detail screen
   */
  const handleBookPress = useCallback((book: Book) => {
    router.push(`/books/${book.id}`);
  }, [router]);

  /**
   * Handle menu press with options
   */
  const handleMenuPress = useCallback(() => {
    Alert.alert("Library Menu", "Choose an option:", [
      {
        text: "Search",
        onPress: () => console.log("Open search for category:", categoryId),
      },
      {
        text: "Filter",
        onPress: () => console.log("Open filter"),
      },
      {
        text: "Sort",
        onPress: () => console.log("Open sort options"),
      },
      {
        text: "Refresh",
        onPress: () => refreshBooks(),
      },
      { text: "Close", style: "cancel" },
    ]);
  }, [categoryId, refreshBooks]);

  /**
   * Determine which books to display based on state
   */
  const displayedBooks = useMemo(() => {
    return state.searchQuery || state.filterOptions 
      ? state.filteredBooks 
      : state.books;
  }, [
    state.books, 
    state.filteredBooks, 
    state.filterOptions, 
    state.searchQuery
  ]);

  /**
   * Gets a book by ID
   */
  const getBookById = async (id: string) => {
    try {
      return await bookService.getBookById(id);
    } catch (error) {
      const appError = parseError(error);
      dispatch({ type: 'FETCH_ERROR', payload: appError.message });
      throw appError;
    }
  };

  return {
    books: displayedBooks,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,
    hasMorePages: state.hasMorePages,
    totalBooks: state.totalBooks,
    handleBookPress,
    handleMenuPress,
    refreshBooks,
    loadMoreBooks,
    searchBooks,
    clearSearch,
    filterBooks,
    clearFilters,
    clearError,
    categoryTitle,
    getBookById,
  };
};
