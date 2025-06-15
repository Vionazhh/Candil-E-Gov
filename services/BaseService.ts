import { db } from "@/config/firebase";
import {
    getSubcollectionDocRef,
    getSubcollectionPath,
    getSubcollectionRef,
    ROOT_COLLECTION,
    ROOT_DOC_ID
} from "@/config/firestore";
import { logger } from "@/utils/logger";
import {
    addDoc,
    CollectionReference,
    deleteDoc,
    doc,
    DocumentData,
    DocumentReference,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    QueryConstraint,
    QueryDocumentSnapshot,
    setDoc,
    updateDoc,
    where,
    WhereFilterOp
} from "firebase/firestore";

/**
 * Generic response structure for list operations
 */
export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Query options for filtering, pagination and sorting
 */
export interface QueryOptions {
  page?: number;
  limit?: number;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: [string, WhereFilterOp, any][];
}

/**
 * Base service class providing common CRUD operations for Firestore collections
 * Following Single Responsibility and Open/Closed principles
 */
export class BaseService<T extends { id?: string }> {
  protected collectionPath: string;
  
  constructor(collectionPath: string) {
    this.collectionPath = collectionPath;
    // logger.firestore(collectionPath, 'constructor', getSubcollectionPath(collectionPath));
  }
  
  /**
   * Get collection reference for the entity
   */
  protected getCollection(): CollectionReference<DocumentData> {
    const collection = getSubcollectionRef(this.collectionPath);
    // logger.firestore(this.collectionPath, 'getCollection', getSubcollectionPath(this.collectionPath));
    return collection;
  }
  
  /**
   * Get document reference for the entity
   */
  protected getDocument(id: string): DocumentReference<DocumentData> {
    const docRef = getSubcollectionDocRef(this.collectionPath, id);
    // logger.firestore(
    //   this.collectionPath, 
    //   'getDocument', 
    //   `${getSubcollectionPath(this.collectionPath)}/${id}`
    // );
    return docRef;
  }
  
  /**
   * Map document data to entity type
   */
  protected mapDocumentData(doc: QueryDocumentSnapshot<DocumentData>): T {
    return { id: doc.id, ...doc.data() } as T;
  }
  
  /**
   * Get all entities with optional filtering, pagination and sorting
   */
  async getAll(options: QueryOptions = {}): Promise<ListResponse<T>> {
    const {
      page = 1,
      limit: pageLimit = 10,
      orderByField = 'createdAt',
      orderDirection = 'desc',
      filters = []
    } = options;
    
    const queryConstraints: QueryConstraint[] = [
      orderBy(orderByField, orderDirection),
      limit(pageLimit)
    ];
    
    // Add filters if any
    filters.forEach(([field, operator, value]) => {
      queryConstraints.push(where(field, operator, value));
    });
    
    // logger.firestore(
    //   this.collectionPath, 
    //   'getAll', 
    //   getSubcollectionPath(this.collectionPath),
    //   { page, pageLimit, orderBy: orderByField, direction: orderDirection, filters }
    // );
    
    const q = query(this.getCollection(), ...queryConstraints);
    const snapshot = await getDocs(q);
    
    const items: T[] = [];
    snapshot.forEach((doc) => {
      items.push(this.mapDocumentData(doc));
    });

    // logger.firestore(
    //   this.collectionPath, 
    //   'getAll:result', 
    //   getSubcollectionPath(this.collectionPath),
    //   { count: items.length }
    // );
    
    return {
      items,
      page,
      limit: pageLimit,
      total: items.length,
      hasMore: items.length === pageLimit
    };
  }
  
  /**
   * Get entity by ID
   */
  async getById(id: string): Promise<T> {
    const docRef = this.getDocument(id);
    
    // logger.firestore(
    //   this.collectionPath, 
    //   'getById', 
    //   `${getSubcollectionPath(this.collectionPath)}/${id}`
    // );
    
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      const error = `Document not found in ${this.collectionPath} with ID: ${id}`;
      logger.error(this.collectionPath, 'getById', error);
      throw new Error(error);
    }
    
    const result = { id: docSnap.id, ...docSnap.data() } as T;
    
    // logger.firestore(
    //   this.collectionPath, 
    //   'getById:result', 
    //   `${getSubcollectionPath(this.collectionPath)}/${id}`,
    //   { exists: true }
    // );
    
    return result;
  }
  
  /**
   * Create new entity
   */
  async create(data: Omit<T, 'id'>): Promise<T> {
    // logger.firestore(
    //   this.collectionPath, 
    //   'create', 
    //   getSubcollectionPath(this.collectionPath),
    //   data
    // );
    
    // Add timestamps
    const dataWithTimestamps = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(this.getCollection(), dataWithTimestamps);
    const result = { id: docRef.id, ...dataWithTimestamps } as unknown as T;
    
    // logger.firestore(
    //   this.collectionPath, 
    //   'create:result', 
    //   `${getSubcollectionPath(this.collectionPath)}/${docRef.id}`,
    //   { id: docRef.id }
    // );
    
    return result;
  }
  
  /**
   * Update existing entity
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    // logger.firestore(
    //   this.collectionPath, 
    //   'update', 
    //   `${getSubcollectionPath(this.collectionPath)}/${id}`,
    //   data
    // );
    
    const docRef = this.getDocument(id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    } as any);
    
    // Get the updated document
    const updatedDoc = await this.getById(id);
    
    // logger.firestore(
    //   this.collectionPath, 
    //   'update:result', 
    //   `${getSubcollectionPath(this.collectionPath)}/${id}`,
    //   { success: true }
    // );
    
    return updatedDoc;
  }
  
  /**
   * Delete entity by ID
   */
  async delete(id: string): Promise<void> {
    // logger.firestore(
    //   this.collectionPath, 
    //   'delete', 
    //   `${getSubcollectionPath(this.collectionPath)}/${id}`
    // );
    
    const docRef = this.getDocument(id);
    await deleteDoc(docRef);
    
    logger.firestore(
      this.collectionPath, 
      'delete:result', 
      `${getSubcollectionPath(this.collectionPath)}/${id}`,
      { success: true }
    );
  }
  
  /**
   * Search entities by field value
   */
  async search(searchField: string, searchTerm: string, options: QueryOptions = {}): Promise<ListResponse<T>> {
    // logger.firestore(
    //   this.collectionPath, 
    //   'search', 
    //   getSubcollectionPath(this.collectionPath),
    //   { field: searchField, term: searchTerm, options }
    // );
    
    // Basic implementation for case-insensitive search
    // Note: Firestore doesn't support real full-text search, for more complex search use Algolia or similar
    const searchOptions = {
      ...options,
      filters: [
        [searchField, '>=', searchTerm] as [string, WhereFilterOp, any],
        [searchField, '<=', searchTerm + '\uf8ff'] as [string, WhereFilterOp, any]
      ]
    };
    
    return this.getAll(searchOptions);
  }

  /**
   * Check if the root document exists and create it if it doesn't
   * Modified to handle offline mode more gracefully with retry
   */
  // async ensureRootDocumentExists(): Promise<boolean> {
  //   let retries = 3;
    
  //   while (retries > 0) {
  //     try {
  //       const rootDocRef = doc(db, ROOT_COLLECTION, ROOT_DOC_ID);
        
  //       try {
  //         const rootDoc = await getDoc(rootDocRef);
          
  //         if (!rootDoc.exists()) {
  //           logger.log('BaseService', 'Creating root document', `${ROOT_COLLECTION}/${ROOT_DOC_ID}`);
  //           await setDoc(rootDocRef, {
  //             createdAt: new Date(),
  //             description: 'Root document for Candil E-Gov application',
  //             lastUpdated: new Date()
  //           });
  //           logger.log('BaseService', 'Root document created successfully');
  //         } else {
  //           logger.log('BaseService', 'Root document exists', `${ROOT_COLLECTION}/${ROOT_DOC_ID}`);
  //         }
  //         return true;
  //       } catch (innerError: any) {
  //         // Handle offline mode specially
  //         if (innerError?.code === 'unavailable' || 
  //             innerError?.message?.includes('offline') || 
  //             innerError?.message?.includes('network')) {
            
  //           logger.warn('BaseService', 'Device is offline, proceeding with local operations', {
  //             collection: this.collectionPath,
  //             error: innerError?.message,
  //             retryCount: 3 - retries
  //           });
            
  //           // Try check network status using timeout
  //           await new Promise(resolve => setTimeout(resolve, 1000));
  //           retries--;
            
  //           // If we're out of retries, proceed anyway in offline mode
  //           if (retries === 0) {
  //             return true;
  //           }
            
  //           // Try again
  //           continue;
  //         }
          
  //         // Re-throw other errors
  //         throw innerError;
  //       }
  //     } catch (error) {
  //       logger.error('BaseService', 'ensureRootDocumentExists failed', error);
  //       retries--;
        
  //       if (retries === 0) {
  //         // Don't block app initialization due to Firestore issues
  //         return true;
  //       }
        
  //       // Wait before retrying
  //       await new Promise(resolve => setTimeout(resolve, 1000));
  //     }
  //   }
    
  //   // Default to true to not block app initialization
  //   return true;
  // }
}