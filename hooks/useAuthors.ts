import { Author, authorService } from '@/services/AuthorService';
import { parseError } from '@/types/errors/AppError';
import { useCallback, useEffect, useState } from 'react';

interface UseAuthorsResult {
  authors: Author[];
  isLoading: boolean;
  error: string | null;
  searchAuthorsByName: (name: string) => Promise<Author[]>;
  getAuthorById: (id: string) => Promise<Author | undefined>;
  refreshAuthors: () => Promise<void>;
}

export const useAuthors = (): UseAuthorsResult => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchAuthors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authorService.getAll();
      setAuthors(result.items);
    } catch (err) {
      const appError = parseError(err);
      setError(appError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);
  
  const searchAuthorsByName = useCallback(async (name: string): Promise<Author[]> => {
    try {
      return await authorService.searchByName(name);
    } catch (err) {
      const appError = parseError(err);
      setError(appError.message);
      return [];
    }
  }, []);
  
  const getAuthorById = useCallback(async (id: string): Promise<Author | undefined> => {
    try {
      return await authorService.getByIdSafe(id);
    } catch (err) {
      const appError = parseError(err);
      setError(appError.message);
      return undefined;
    }
  }, []);
  
  const refreshAuthors = useCallback(async () => {
    await fetchAuthors();
  }, [fetchAuthors]);
  
  return {
    authors,
    isLoading,
    error,
    searchAuthorsByName,
    getAuthorById,
    refreshAuthors
  };
};

export default useAuthors; 