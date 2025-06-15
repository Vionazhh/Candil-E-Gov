import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { FirestoreInitializer, setupNetworkListeners } from '@/utils/firestoreInitializer';
import React, { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from './ErrorBoundary';

interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * Main application provider that combines all context providers
 * This ensures proper context hierarchy and organization
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Reference to track if initialization has been done
  const initializedRef = useRef(false);

  // Initialize Firestore on mount
  useEffect(() => {
    // Prevent multiple initializations
    if (initializedRef.current) {
      return;
    }
    
    initializedRef.current = true;
    
    // Initialize Firestore
    FirestoreInitializer().catch(err => {
      console.error('Failed to initialize Firestore:', err);
    });
    
    // Setup network listeners untuk mengatur koneksi Firestore
    const unsubscribeNetworkListener = setupNetworkListeners();
    
    // Cleanup when component unmounts
    return () => {
      if (unsubscribeNetworkListener) {
        unsubscribeNetworkListener();
      }
    };
  }, []);
  
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            {children}
          </GestureHandlerRootView>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}; 