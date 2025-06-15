/**
 * Firebase configuration and initialization
 * Provides Firebase authentication and Firestore database services
 */
import { logger } from "@/utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { Platform } from 'react-native';
//@ts-ignore
import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MEASUREMENT_ID,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
} from "@env";
// Have to do ts-ignore as getReactNativePersistence is not detected by ts compiler with firebase 10.3.0
// @ts-ignore 
import {
  browserSessionPersistence,
  getReactNativePersistence,
  initializeAuth,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  disableNetwork,
  enableNetwork,
  getFirestore,
} from "firebase/firestore";

/**
 * Firebase configuration
 * Replace with your own Firebase project configuration
 */
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

/**
 * Initialize Firebase Authentication with AsyncStorage persistence
 */
export const auth = initializeAuth(app, {
  persistence:
    Platform.OS === "web"
      ? browserSessionPersistence
      : getReactNativePersistence(AsyncStorage),
});

/**
 * Initialize Firestore database with improved offline support
 * Menggunakan konfigurasi dengan retry terbatas dan disableNetwork saat offline
 */
export const db = getFirestore(app);

// Log that Firebase has been initialized
logger.log("Firebase", "Initialized Firebase", {
  projectId: firebaseConfig.projectId,
});

// Track current network status to prevent duplicate calls
let isNetworkEnabled = true;

/**
 * Fungsi untuk mengaktifkan network koneksi Firestore (online mode)
 */
export const enableFirestoreNetwork = async (): Promise<void> => {
  if (!isNetworkEnabled) {
    try {
      logger.log("Firebase", "Enabling Firestore network connection");
      await enableNetwork(db);
      isNetworkEnabled = true;
    } catch (error) {
      logger.error("Firebase", "Failed to enable Firestore network", error);
    }
  } else {
    logger.log("Firebase", "Firestore network already enabled", {});
  }
};

/**
 * Fungsi untuk menonaktifkan network koneksi Firestore (offline mode)
 */
export const disableFirestoreNetwork = async (): Promise<void> => {
  if (isNetworkEnabled) {
    try {
      logger.log("Firebase", "Disabling Firestore network connection", {});
      await disableNetwork(db);
      isNetworkEnabled = false;
    } catch (error) {
      logger.error("Firebase", "Failed to disable Firestore network", error);
    }
  } else {
    logger.log("Firebase", "Firestore network already disabled", {});
  }
};

/**
 * Helper function to get current user
 * @returns Promise resolving to the current user or null
 */
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Helper function to check if user is authenticated
 * @returns Promise resolving to authentication status
 */
export const isAuthenticated = (): Promise<boolean> => {
  return getCurrentUser().then((user) => !!user);
};
