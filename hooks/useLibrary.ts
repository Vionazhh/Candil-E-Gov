/**
 * This file is deprecated and its functionality has been split into more focused hooks.
 * Use the hooks below instead:
 * - useNavigationTabs for tab navigation
 * - useHomeScreen for home screen state
 * - useSearch from useSearchBooks for search functionality
 */

import { useHomeScreen } from './useHomeScreen';
import { useNavigationTabs } from './useNavigationTabs';
import { useSearchBooks } from './useSearchBooks';

/**
 * @deprecated Use more specialized hooks instead
 */
export const useLibrary = () => {
  console.warn('useLibrary is deprecated. Use specialized hooks instead.');
  
  const navigationTabs = useNavigationTabs();
  const homeScreen = useHomeScreen();
  const { search } = useSearchBooks();
  
  return {
    ...navigationTabs,
    ...homeScreen,
    handleSearch: search,
  };
};
