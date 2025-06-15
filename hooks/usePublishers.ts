import { publisherService } from '@/services';
import { Publisher } from '@/types/Book';
import { parseError } from '@/types/errors/AppError';
import { useCallback, useEffect, useState } from 'react';

interface UsePublishersResult {
  publishers: Publisher[];
  isLoading: boolean;
  error: string | null;
  searchPublishersByName: (name: string) => Promise<Publisher[]>;
  getPublisherById: (id: string) => Promise<Publisher | undefined>;
  refreshPublishers: () => Promise<void>;
}

export const usePublishers = (): UsePublishersResult => {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchPublishers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await publisherService.getAll();
      setPublishers(result.items);
    } catch (err) {
      const appError = parseError(err);
      setError(appError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchPublishers();
  }, [fetchPublishers]);
  
  const searchPublishersByName = useCallback(async (name: string): Promise<Publisher[]> => {
    try {
      return await publisherService.searchByName(name);
    } catch (err) {
      const appError = parseError(err);
      setError(appError.message);
      return [];
    }
  }, []);
  
  const getPublisherById = useCallback(async (id: string): Promise<Publisher | undefined> => {
    try {
      return await publisherService.getById(id);
    } catch (err) {
      const appError = parseError(err);
      setError(appError.message);
      return undefined;
    }
  }, []);
  
  const refreshPublishers = useCallback(async () => {
    await fetchPublishers();
  }, [fetchPublishers]);
  
  return {
    publishers,
    isLoading,
    error,
    searchPublishersByName,
    getPublisherById,
    refreshPublishers
  };
};

export default usePublishers; 