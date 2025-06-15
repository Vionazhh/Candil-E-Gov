/**
 * Authentication context for managing user authentication state
 * Provides login, register, logout and other auth-related functionalities
 * Follows the Context API pattern for state management
 */
import { auth, getCurrentUser } from "@/config/firebase";
import { parseError } from "@/types/errors/AppError";
import { showDialogError, showDialogSuccess, showDialogWarning } from "@/utils/alert";
import { logger } from "@/utils/logger";
import { validateEmail, validatePassword } from "@/utils/validation";
import {
  User,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

/**
 * User type for authentication
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

/**
 * Authentication credentials
 */
export interface AuthCredentials {
  email: string;
  password: string;
}

/**
 * Registration data extending auth credentials
 */
export interface RegistrationData extends AuthCredentials {
  displayName?: string;
}

/**
 * Authentication context type definition
 */
export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: AuthCredentials) => Promise<boolean>;
  register: (data: RegistrationData) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Auth state type for reducer
 */
interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Auth action types for reducer
 */
type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AuthUser | null }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_RESET' }
  | { type: 'CLEAR_ERROR' };

/**
 * Initial auth state
 */
const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
};

/**
 * Reducer function for auth state management
 */
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return { ...state, isLoading: false, user: action.payload, error: null };
    case 'AUTH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'AUTH_RESET':
      return { ...state, user: null, error: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Create the context with a undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Maps a Firebase User to our AuthUser type
 */
const mapFirebaseUser = (user: User | null): AuthUser | null => {
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };
};

/**
 * Provider component for authentication state
 * Provides authentication functionality to the component tree
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  /**
   * Handle any API errors
   */
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const appError = parseError(error);
    const errorMessage = customMessage || appError.message;
    
    dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
    showDialogError("Error", errorMessage);
  }, []);

  /**
   * Check for authentication status on mount and subscribe to auth changes
   */
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const currentUser = await getCurrentUser();
        dispatch({ type: 'AUTH_SUCCESS', payload: mapFirebaseUser(currentUser) });
      } catch (error) {
        console.error('Auth status check error:', error);
        dispatch({ type: 'AUTH_SUCCESS', payload: null });
      }
    };

    checkAuthStatus();
    
    // Subscribe to auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      dispatch({ type: 'AUTH_SUCCESS', payload: mapFirebaseUser(user) });
    });
    
    // Clean up subscription
    return () => unsubscribe();
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async ({ email, password }: AuthCredentials): Promise<boolean> => {
    // Validation
    if (!email || !password) {
      showDialogError("Error", "Mohon isi semua field");
      return false;
    }

    if (!validateEmail(email)) {
      showDialogError("Error", "Format email tidak valid");
      return false;
    }

    if (!validatePassword(password)) {
      showDialogError("Error", "Password minimal 6 karakter");
      return false;
    }

    dispatch({ type: 'AUTH_START' });

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      dispatch({ type: 'AUTH_SUCCESS', payload: mapFirebaseUser(userCredential.user) });
      showDialogSuccess("Success", "Login berhasil!");
      return true;
    } catch (error: any) {
      logger.error("Error Login:", error)
      const errorMessage = error.code === "auth/invalid-credential" 
        ? "Email atau password salah" 
        : "Terjadi kesalahan saat login";
      
      handleError(error, errorMessage);
      return false;
    }
  }, [handleError]);

  /**
   * Register a new user
   */
  const register = useCallback(async ({ email, password, displayName }: RegistrationData): Promise<boolean> => {
    // Validation
    if (!email || !password) {
      showDialogError("Error", "Mohon isi semua field");
      return false;
    }

    if (!validateEmail(email)) {
      showDialogError("Error", "Format email tidak valid");
      return false;
    }

    if (!validatePassword(password)) {
      showDialogError("Error", "Password minimal 6 karakter");
      return false;
    }

    dispatch({ type: 'AUTH_START' });

    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      dispatch({ type: 'AUTH_SUCCESS', payload: mapFirebaseUser(userCredential.user) });
      showDialogSuccess("Success", "Registrasi berhasil!");
      return true;
    } catch (error: any) {
      let errorMessage = "Terjadi kesalahan saat registrasi";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email sudah terdaftar";
      }
      
      handleError(error, errorMessage);
      return false;
    }
  }, [handleError]);

  /**
   * Send password reset email
   */
  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    if (!email) {
      showDialogWarning("Info", "Mohon isi email");
      return false;
    }

    if (!validateEmail(email)) {
      showDialogError("Error", "Format email tidak valid");
      return false;
    }

    dispatch({ type: 'AUTH_START' });

    try {
      await sendPasswordResetEmail(auth, email);
      dispatch({ type: 'AUTH_SUCCESS', payload: null });
      showDialogSuccess(
        "Email Terkirim", 
        "Instruksi reset password telah dikirim ke email Anda"
      );
      return true;
    } catch (error) {
      handleError(error, "Gagal mengirim email reset password");
      return false;
    }
  }, [handleError]);

  /**
   * Logout user
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await auth.signOut();
      dispatch({ type: 'AUTH_RESET' });
    } catch (error) {
      handleError(error, "Gagal logout");
    }
  }, [handleError]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  /**
   * Computed authentication status
   */
  const isAuthenticated = useMemo(() => !!state.user, [state.user]);

  /**
   * Context value
   */
  const value = useMemo(
    () => ({
      user: state.user,
      isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
      login,
      register,
      logout,
      forgotPassword,
      clearError,
    }),
    [
      state.user,
      state.isLoading,
      state.error,
      isAuthenticated,
      login,
      register,
      logout,
      forgotPassword,
      clearError,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook for accessing the auth context
 * Throws an error if used outside of an AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 