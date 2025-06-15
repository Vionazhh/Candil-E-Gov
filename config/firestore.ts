/**
 * Firestore database structure configuration
 */
import { collection, doc, DocumentData, DocumentReference } from 'firebase/firestore';
import { db } from './firebase';
import { FIRESTORE_ROOT_COLLECTION, FIRESTORE_ROOT_DOC_ID } from '@env';



/**
 * Get the root document reference
 * @returns Reference to the root document
 */
export const getRootDocRef = (): DocumentReference<DocumentData> => {
  const ref = doc(db, FIRESTORE_ROOT_COLLECTION, FIRESTORE_ROOT_DOC_ID);
  // logger.firestore('config', 'getRootDocRef', `${FIRESTORE_ROOT_COLLECTION}/${FIRESTORE_ROOT_DOC_ID}`);
  return ref;
};

/**
 * Get a subcollection reference from the root document
 * @param collectionName Name of the subcollection
 * @returns Reference to the subcollection
 */
export const getSubcollectionRef = (collectionName: string) => {
  const rootDocRef = getRootDocRef();
  const ref = collection(rootDocRef, collectionName);
  // logger.firestore('config', 'getSubcollectionRef', `${FIRESTORE_ROOT_COLLECTION}/${FIRESTORE_ROOT_DOC_ID}/${collectionName}`);
  return ref;
};

/**
 * Get a document reference from a subcollection
 * @param collectionName Name of the subcollection
 * @param docId Document ID
 * @returns Reference to the document
 */
export const getSubcollectionDocRef = (collectionName: string, docId: string) => {
  const ref = doc(db, FIRESTORE_ROOT_COLLECTION, FIRESTORE_ROOT_DOC_ID, collectionName, docId);
  // logger.firestore('config', 'getSubcollectionDocRef', `${FIRESTORE_ROOT_COLLECTION}/${FIRESTORE_ROOT_DOC_ID}/${collectionName}/${docId}`);
  return ref;
};

/**
 * Get path to a subcollection
 * @param collectionName Name of the subcollection
 * @returns Path to the subcollection
 */
export const getSubcollectionPath = (collectionName: string) => {
  return `${FIRESTORE_ROOT_COLLECTION}/${FIRESTORE_ROOT_DOC_ID}/${collectionName}`;
};

/**
 * Collection names used in the application
 */
export const COLLECTIONS = {
  BOOKS: 'books',
  AUTHORS: 'authors',
  PUBLISHERS: 'publishers',
  CATEGORIES: 'categories',
  BORROWS: 'borrows',
  USERS: 'users',
}; 