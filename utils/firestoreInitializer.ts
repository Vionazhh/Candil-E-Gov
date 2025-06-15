/**
 * Firestore initialization utility
 * Used to initialize Firestore structure on app startup
 */
import { disableFirestoreNetwork, enableFirestoreNetwork } from '@/config/firebase';
import { verifyFirestoreStructure } from '@/utils/firestoreVerifier';
import { logger } from '@/utils/logger';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// Max jumlah percobaan koneksi
const MAX_RETRIES = 1;

// Prevent too frequent network state changes
let lastNetworkState: boolean | null = null;
let networkChangeTimerId: ReturnType<typeof setTimeout> | null = null;

/**
 * Initialize Firestore database structure
 * Sets up required collections and documents
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function initializeFirestore(): Promise<boolean> {
  try {
    // Check network status first
    const netInfo = await NetInfo.fetch();
    const isNetworkAvailable = netInfo.isConnected && netInfo.isInternetReachable;
    
    if (!isNetworkAvailable) {
      logger.warn('Firestore', 'Network is not available, switching to offline mode', {
        isConnected: netInfo.isConnected,
        isInternetReachable: netInfo.isInternetReachable,
        type: netInfo.type
      });
      
      // Disable network connection to prevent continuous retries
      await disableFirestoreNetwork();
      
      // Return immediately, no verification needed in offline mode
      return true;
    } else {
      logger.log('Firestore', 'Network is available, initializing Firestore', {
        isConnected: netInfo.isConnected, 
        type: netInfo.type
      });
      
      // Enable network connection
      await enableFirestoreNetwork();
    }
    
    // Try to verify Firestore structure with limited retries
    logger.log('Firestore', `Initializing Firestore structure (max ${MAX_RETRIES} retry)`);
    
    try {
      const results = await verifyFirestoreStructure();
      
      const hasErrors = Object.values(results).some(result => !result);
      if (hasErrors) {
        const failedCollections = Object.entries(results)
          .filter(([_, success]) => !success)
          .map(([collection]) => collection)
          .join(', ');
        
        logger.warn('Firestore', `Failed to verify collections: ${failedCollections}`);
        
        // Even with errors, continue using app
        return true;
      } else {
        logger.log('Firestore', 'Structure verified successfully', results);
        return true;
      }
    } catch (verifyError) {
      logger.error('Firestore', 'Error verifying Firestore structure', verifyError);
      
      // Check network again after error
      const newNetInfo = await NetInfo.fetch();
      if (!newNetInfo.isConnected || !newNetInfo.isInternetReachable) {
        // Switch to offline mode if network became unavailable
        logger.warn('Firestore', 'Network lost during verification, switching to offline mode');
        await disableFirestoreNetwork();
      }
      
      // Continue with app despite errors
      return true;
    }
  } catch (error) {
    logger.error('Firestore', 'Error initializing Firestore', error);
    // Continue with app despite errors
    return true;
  }
}

/**
 * Handle network state change with debounce
 * @param state Current network state
 */
function handleNetworkStateChange(state: NetInfoState): void {
  // Safely check and transform values
  const isConnected = state.isConnected === true && state.isInternetReachable === true;
  
  // Only process changes or initial setup
  if (lastNetworkState === isConnected) {
    return;
  }
  
  // Clear any pending timer
  if (networkChangeTimerId !== null) {
    clearTimeout(networkChangeTimerId);
  }
  
  // Set a debounce timer to prevent rapid state changes
  networkChangeTimerId = setTimeout(() => {
    try {
      // Don't update if state has changed while debouncing
      if (lastNetworkState !== isConnected) {
        // Update the last state
        lastNetworkState = isConnected;
        
        if (isConnected) {
          logger.log('Firestore', 'Network connected, enabling Firestore network');
          enableFirestoreNetwork().catch(err => 
            logger.error('Firestore', 'Failed to enable network', err)
          );
        } else {
          logger.warn('Firestore', 'Network disconnected, disabling Firestore network');
          disableFirestoreNetwork().catch(err => 
            logger.error('Firestore', 'Failed to disable network', err)
          );
        }
      }
    } catch (error) {
      logger.error('Firestore', 'Error handling network state change', error);
    } finally {
      networkChangeTimerId = null;
    }
  }, 2000); // 2 second debounce to make sure the network state is stable
}

/**
 * Configure NetworkState listener to automatically switch between online and offline mode
 */
export function setupNetworkListeners(): () => void {
  // Set initial state
  NetInfo.fetch().then(state => {
    lastNetworkState = !!state.isConnected && !!state.isInternetReachable;
  }).catch(err => {
    logger.error('Firestore', 'Failed to get initial network state', err);
  });
  
  // Return unsubscribe function
  return NetInfo.addEventListener(handleNetworkStateChange);
}

/**
 * Initialize Firestore on app startup
 * Call this from your root component
 */
export const FirestoreInitializer = initializeFirestore;

export default FirestoreInitializer; 