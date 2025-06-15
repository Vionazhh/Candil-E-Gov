/**
 * Enhanced custom hook for searching books with debounce and realtime capabilities
 */
import { SearchConstants } from "@/constants/Search";
import { bookService } from "@/services";
import { Book } from "@/types/Book";
import { useCallback, useEffect, useState, useRef } from "react";

/**
 * Type defining the search type: general or specific search
 */
type SearchType = "general" | "phrase" | "title" | "category";

/**
 * Interface for category results
 */
interface CategoryResult {
  id: string;
  title: string;
}

/**
 * Interface for book results with additional metadata
 */
interface BookResult {
  id: string;
  title: string;
  author: Array<{
    name: string;
  }>;
  isbn?: string;
  publishedDate?: string;
  category?: string;
  thumbnail?: string;
  description?: string;
}

/**
 * Interface for the return value of the useSearchBooks hook
 */
interface UseSearchBooksResult {
  searchQuery: string;
  searchResults: Book[];
  isLoading: boolean;
  error: string | null;
  handleSearch: (searchQuery: string) => void;
  clearResults: () => void;
  categoryResults: CategoryResult[];
  bookResults: BookResult[]; // Added book results
  hasResults: boolean;
  hasBookResults: boolean; // Added separate check for book results
  hasCategoryResults: boolean; // Added separate check for category results
  searchType: SearchType;
}

/**
 * Enhanced custom hook for searching books with debounce and realtime search capabilities
 * Provides search capability with debouncing to prevent excessive API calls
 */
export function useSearchBooks(initialQuery: string = ""): UseSearchBooksResult {
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(initialQuery);
  const [categoryResults, setCategoryResults] = useState<CategoryResult[]>([]);
  const [bookResults, setBookResults] = useState<BookResult[]>([]); // Added book results state
  const [searchType, setSearchType] = useState<SearchType>("general");
  
  // Use ref to track the current request and prevent race conditions
  const abortControllerRef = useRef<AbortController | null>(null);
  const categoriesCache = useRef<CategoryResult[]>([]);
  const booksCache = useRef<BookResult[]>([]); // Added books cache
  const lastFetchTime = useRef<number>(0);
  const lastBooksFetchTime = useRef<number>(0); // Added books fetch time tracking
  
  // Debounce the search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, SearchConstants.debounceDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);
  
  // Determine search type based on query
  const determineSearchType = useCallback((query: string): SearchType => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return "general";
    
    // Check if it's a phrase search (contains quotes)
    if (trimmedQuery.startsWith('"') && trimmedQuery.endsWith('"')) {
      return "phrase";
    }
    
    // Check if it's a title search (starts with "title:")
    if (trimmedQuery.toLowerCase().startsWith('title:')) {
      return "title";
    }
    
    // Check if it's a category search (starts with "category:")
    if (trimmedQuery.toLowerCase().startsWith('category:')) {
      return "category";
    }
    
    return "general";
  }, []);
  
  // Clear all results
  const clearResults = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
    setCategoryResults([]);
    setBookResults([]); // Clear book results
    setSearchType("general");
    
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);
  
  // Function to get categories with caching
  const getCategoriesWithCache = useCallback(async (signal: AbortSignal) => {
    // Return cached categories if available and fresh (less than 5 minutes old)
    const now = Date.now();
    if (categoriesCache.current.length > 0 && now - lastFetchTime.current < 300000) {
      return categoriesCache.current;
    }
    
    try {
      const categories = await bookService.getCategories({ signal });
      const mappedCategories = categories.map(category => ({
        id: category.id,
        title: category.title
      }));
      
      categoriesCache.current = mappedCategories;
      lastFetchTime.current = now;
      
      return mappedCategories;
    } catch (error) {
      // If request was aborted, don't update cache
      if (error.name === 'AbortError') {
        throw error;
      }
      
      // Return cached categories if available, otherwise throw error
      if (categoriesCache.current.length > 0) {
        return categoriesCache.current;
      }
      throw error;
    }
  }, []);
  
  // Function to get books with caching
  const getBooksWithCache = useCallback(async (signal: AbortSignal, query?: string) => {
    // For specific queries, don't use cache
    if (query) {
      const books = await bookService.getAllBooks({ signal, query });
      return books.items.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        publishedDate: book.publishedDate,
        category: book.category,
        thumbnail: book.thumbnail,
        description: book.description
      }));
    }
    
    // Return cached books if available and fresh (less than 5 minutes old)
    const now = Date.now();
    if (booksCache.current.length > 0 && now - lastBooksFetchTime.current < 300000) {
      return booksCache.current;
    }
    
    try {
      const books = await bookService.getAllBooks({ signal });
      console.log("books2:", books)
      const mappedBooks = books.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        publishedDate: book.publishedDate,
        category: book.category,
        thumbnail: book.thumbnail,
        description: book.description
      }));
      
      booksCache.current = mappedBooks;
      lastBooksFetchTime.current = now;
      
      return mappedBooks;
    } catch (error) {
      // If request was aborted, don't update cache
      if (error.name === 'AbortError') {
        throw error;
      }
      
      // Return cached books if available, otherwise throw error
      if (booksCache.current.length > 0) {
        return booksCache.current;
      }
      throw error;
    }
  }, []);
  
  // Search for books when debounced query changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      const trimmedQuery = debouncedQuery.trim();
      
      if (!trimmedQuery) {
        setSearchResults([]);
        setCategoryResults([]);
        setBookResults([]); // Clear book results
        setSearchType("general");
        return;
      }

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      
      setIsLoading(true);
      setError(null);
      
      const currentSearchType = determineSearchType(trimmedQuery);
      setSearchType(currentSearchType);

      try {
        // Perform concurrent searches for better performance
        const searchPromises: Promise<any>[] = [
          bookService.searchBooks(trimmedQuery, { signal })
        ];
        
        // Add book results search for all search types
        searchPromises.push(getBooksWithCache(signal, trimmedQuery));
        
        // Only search categories if it's a general search or category search
        if (currentSearchType === "general" || currentSearchType === "category") {
          searchPromises.push(getCategoriesWithCache(signal));
        }
        
        const results = await Promise.allSettled(searchPromises);
        
        // Check if request was aborted
        if (signal.aborted) {
          return;
        }
        
        // Handle main book search results (searchBooks API)
        const bookSearchResult = results[0];
        if (bookSearchResult.status === 'fulfilled') {
          setSearchResults(bookSearchResult.value.items || []);
        } else {
          console.error("Error searching books:", bookSearchResult.reason);
          setError(`Error searching books: ${bookSearchResult.reason?.message || 'Unknown error'}`);
        }
        
        // Handle book results (getAllBooks with filter)
        const bookResult = results[1];
        if (bookResult.status === 'fulfilled') {
          const matchingBooks = bookResult.value.filter((book: BookResult) => {
            const query = trimmedQuery.toLowerCase();
          
            return (
              (book.title?.toLowerCase()?.includes(query)) ||
              (book.author?.name?.toLowerCase()?.includes(query)) ||
              (book.category?.title?.toLowerCase()?.includes(query)) ||
              (book.isbn?.toLowerCase()?.includes(query))
            );
          });
          
          setBookResults(matchingBooks);
        } else {
          console.error("Error getting book results:", bookResult.reason);
          setBookResults([]);
        }
        
        // Handle category search results (only if categories were searched)
        if (results.length > 2) {
          const categoryResult = results[2];
          if (categoryResult.status === 'fulfilled') {
            const matchingCategories = categoryResult.value.filter(
              (category: CategoryResult) => 
                category.title.toLowerCase().includes(trimmedQuery.toLowerCase())
            );
            setCategoryResults(matchingCategories);
          } else {
            console.error("Error searching categories:", categoryResult.reason);
            setCategoryResults([]);
          }
        } else {
          setCategoryResults([]);
        }
        
      } catch (error) {
        // Only handle errors if request wasn't aborted
        if (!signal.aborted) {
          console.error("Search error:", error);
          setError(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setSearchResults([]);
          setCategoryResults([]);
          setBookResults([]); // Clear book results on error
        }
      } finally {
        // Only update loading state if request wasn't aborted
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchSearchResults();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [debouncedQuery, determineSearchType, getCategoriesWithCache, getBooksWithCache]);

  // Function to perform a search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setError(null); // Clear previous errors when starting new search
  }, []);
  
  // Computed properties to check if there are any results
  const hasResults = searchResults.length > 0 || categoryResults.length > 0 || bookResults.length > 0;
  const hasBookResults = searchResults.length > 0 || bookResults.length > 0;
  const hasCategoryResults = categoryResults.length > 0;

  return {
    searchQuery,
    searchResults,
    isLoading,
    error,
    handleSearch,
    clearResults,
    categoryResults,
    bookResults, // Added book results to return value
    hasResults,
    hasBookResults, // Added book results check
    hasCategoryResults, // Added category results check
    searchType,
  };
}