/**
 * Authentication hook for accessing the authentication context
 */
import { AuthContextType, useAuth as useAuthContext } from '@/context/AuthContext';

/**
 * Custom hook for accessing authentication context
 * 
 * Provides access to:
 * - user: Current authenticated user or null
 * - isAuthenticated: Boolean indicating if user is logged in
 * - isLoading: Boolean indicating if auth operations are in progress
 * - error: Any authentication error message
 * - login: Function to log in with email/password
 * - register: Function to create a new account
 * - logout: Function to sign out
 * - forgotPassword: Function to request password reset
 * - clearError: Function to clear any auth errors
 * 
 * @returns Authentication context
 */
export const useAuth = (): AuthContextType => {
  return useAuthContext();
};
