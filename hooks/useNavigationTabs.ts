/**
 * Hook for managing navigation tabs
 * Handles tab state and navigation for the bottom tabs
 */
import { useCallback, useMemo, useState } from 'react';

/**
 * Tab navigation item
 */
export interface Tab {
  id: number;
  icon: string;
  name: string;
}

/**
 * Hook return interface
 */
export interface UseNavigationTabsReturn {
  activeTab: number;
  tabs: Tab[];
  handleTabPress: (tabId: number) => void;
}

/**
 * Hook for managing navigation tabs state and interaction
 * @returns Tab navigation state and handlers
 */
export const useNavigationTabs = (): UseNavigationTabsReturn => {
  // Track active tab index
  const [activeTab, setActiveTab] = useState(0);
  
  /**
   * Tab configuration for bottom navigation
   */
  const tabs: Tab[] = useMemo(() => [
    { id: 0, icon: "home-outline", name: "Home" },
    { id: 1, icon: "book-outline", name: "Buku" },
    { id: 2, icon: "library-outline", name: "Peminjaman" },
    { id: 3, icon: "person-outline", name: "Profile" },
  ], []);
  
  /**
   * Handle tab press in bottom navigation
   * @param tabId Tab identifier
   */
  const handleTabPress = useCallback((tabId: number) => {
    setActiveTab(tabId);
  }, []);
  
  return {
    activeTab,
    tabs,
    handleTabPress,
  };
}; 