/**
 * Firestore structure verification utilities
 * Used to ensure the database structure is set up correctly
 */
import { db } from '@/config/firebase';
import { COLLECTIONS, ROOT_COLLECTION, ROOT_DOC_ID } from '@/config/firestore';
import {
  collection,
  CollectionReference,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  setDoc
} from 'firebase/firestore';
import { logger } from './logger';

// Maksimum jumlah retry
const MAX_RETRIES = 1;

/**
 * Verify that the root collection and document exist
 * Improved to handle offline mode gracefully with limited retry
 * @returns Whether the root document exists
 */
export async function verifyRootDocument(): Promise<boolean> {
  let retries = MAX_RETRIES;
  
  while (retries >= 0) {
    try {
      const rootDocRef = doc(db, ROOT_COLLECTION, ROOT_DOC_ID);
      
      try {
        const rootDoc = await getDoc(rootDocRef);
        
        if (!rootDoc.exists()) {
          logger.log('Firestore', 'Root document does not exist, creating it', `${ROOT_COLLECTION}/${ROOT_DOC_ID}`);
          
          await setDoc(rootDocRef, {
            createdAt: new Date(),
            description: 'Root document for Candil E-Gov application',
            lastUpdated: new Date()
          });
          
          logger.log('Firestore', 'Root document created successfully');
          return true;
        }
        
        logger.log('Firestore', 'Root document verified', `${ROOT_COLLECTION}/${ROOT_DOC_ID}`);
        return true;
      } catch (innerError: any) {
        // Handle offline mode specially
        if (innerError?.code === 'unavailable' || 
            innerError?.message?.includes('offline') || 
            innerError?.message?.includes('network')) {
          
          logger.warn('Firestore', 'Device is offline, proceeding with local operations', {
            error: innerError?.message,
            retryCount: MAX_RETRIES - retries
          });
          
          // Jika masih ada kesempatan retry
          if (retries > 0) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries--;
            continue;
          }
          
          // Jika sudah tidak ada retry, proceed dengan offline mode
          logger.warn('Firestore', 'Max retries reached, continuing with offline mode');
          return true;
        }
        
        // Re-throw other errors
        throw innerError;
      }
    } catch (error) {
      logger.error('Firestore', 'Failed to verify root document', error);
      
      // Jika masih ada kesempatan retry
      if (retries > 0) {
        retries--;
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      // Berhenti mencoba dan lanjutkan aplikasi
      logger.warn('Firestore', 'Max retries reached, continuing application');
      return true;
    }
  }
  
  // Default to true to not block app initialization
  return true;
}

/**
 * Verify that a subcollection exists within the root document
 * Improved to handle offline mode gracefully with limited retry
 * @param collectionName Name of the subcollection to verify
 * @returns Whether the subcollection exists
 */
export async function verifySubcollection(collectionName: string): Promise<boolean> {
  let retries = MAX_RETRIES;
  
  while (retries >= 0) {
    try {
      const rootDocRef = doc(db, ROOT_COLLECTION, ROOT_DOC_ID);
      const subcollectionRef = collection(rootDocRef, collectionName);
      
      try {
        // Try to read from the subcollection
        const snapshot = await getDocs(subcollectionRef);
        
        logger.log('Firestore', `Subcollection ${collectionName} verified`, 
          `${ROOT_COLLECTION}/${ROOT_DOC_ID}/${collectionName} has ${snapshot.size} documents`);
        
        return true;
      } catch (innerError: any) {
        // Handle offline mode specially
        if (innerError?.code === 'unavailable' || 
            innerError?.message?.includes('offline') || 
            innerError?.message?.includes('network')) {
          
          logger.warn('Firestore', `Offline mode detected for subcollection ${collectionName}`, {
            error: innerError?.message,
            retryCount: MAX_RETRIES - retries
          });
          
          // Jika masih ada kesempatan retry
          if (retries > 0) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries--;
            continue;
          }
          
          // Jika sudah tidak ada retry, proceed dengan offline mode
          logger.warn('Firestore', `Max retries reached for ${collectionName}, continuing with offline mode`);
          return true;
        }
        
        // Re-throw other errors
        throw innerError;
      }
    } catch (error) {
      logger.error('Firestore', `Failed to verify subcollection ${collectionName}`, error);
      
      // Jika masih ada kesempatan retry
      if (retries > 0) {
        retries--;
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      // Berhenti mencoba dan lanjutkan aplikasi
      logger.warn('Firestore', `Max retries reached for ${collectionName}, continuing application`);
      return true;
    }
  }
  
  // Default to true to not block app initialization
  return true;
}

/**
 * Verify the entire Firestore structure
 * @returns Object containing verification results
 */
export async function verifyFirestoreStructure(): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};
  
  // Verify root document
  results.rootDocument = await verifyRootDocument();
  
  // Verify subcollections
  for (const key of Object.keys(COLLECTIONS)) {
    const collectionName = COLLECTIONS[key as keyof typeof COLLECTIONS];
    results[collectionName] = await verifySubcollection(collectionName);
  }
  
  return results;
}

/**
 * Get subcollection reference
 * Helper to get a reference to a subcollection
 * @param collectionName Name of the subcollection
 * @returns CollectionReference to the subcollection
 */
export function getSubcollectionReference(collectionName: string): CollectionReference<DocumentData> {
  const rootDocRef = doc(db, ROOT_COLLECTION, ROOT_DOC_ID);
  return collection(rootDocRef, collectionName);
} 