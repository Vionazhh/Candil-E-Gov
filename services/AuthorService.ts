import { COLLECTIONS } from "@/config/firestore";
import { DocumentData, query as firebaseQuery, getDocs as firestoreGetDocs, getDoc, limit, orderBy, QuerySnapshot, where } from "firebase/firestore";
import { BaseService, ListResponse } from "./BaseService";

/**
 * Author interface representing an author entity
 */
export interface Author {
  id?: string;
  name: string;
  biography?: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Service for managing author data
 */
export class AuthorService extends BaseService<Author> {
  constructor() {
    super(COLLECTIONS.AUTHORS);
    
    // Ensure root document exists
    // this.ensureRootDocumentExists().catch(err => 
    //   console.error("Failed to ensure root document", err)
    // );
  }

  /**
   * Get all authors
   */
  async getAllAuthors(page = 1, limit = 20) {
    return this.getAll({
      page,
      limit,
      orderByField: "name",
      orderDirection: "asc"
    });
  }

  /**
   * Get author by ID with override to allow undefined return type
   * @param id Author ID
   * @returns Author object or undefined if not found
   */
  async getByIdSafe(id: string): Promise<Author | undefined> {
    try {
      const docRef = this.getDocument(id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Author;
      }
      
      return undefined;
    } catch (error) {
      console.error("Error getting author by id:", error);
      throw error;
    }
  }

  /**
   * Search authors by name or text query
   * @param searchQuery Text to search for
   * @param page Page number for pagination
   * @param pageSize Number of results per page
   * @returns ListResponse with authors matching the search query
   */
  async searchAuthors(searchQuery: string, page = 1, pageSize = 10): Promise<ListResponse<Author>> {
    try {
      const queryLower = searchQuery.toLowerCase();
      const q = firebaseQuery(
        this.getCollection(),
        where("nameLower", ">=", queryLower),
        where("nameLower", "<=", queryLower + "\uf8ff"),
        orderBy("nameLower"),
        limit(pageSize)
      );
      
      const snapshot = await firestoreGetDocs(q);
      const authors: Author[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Author));
      
      return {
        items: authors,
        page,
        limit: pageSize,
        total: authors.length,
        hasMore: authors.length === pageSize
      };
    } catch (error) {
      console.error("Error searching authors:", error);
      
      // Fallback to basic search if range query fails
      try {
        const basicQuery = firebaseQuery(
          this.getCollection(),
          orderBy("name"),
          limit(pageSize)
        );
        
        const snapshot = await firestoreGetDocs(basicQuery);
        const authors: Author[] = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Author))
          .filter(author => 
            author.name.toLowerCase().includes(queryLower)
          );
        
        return {
          items: authors,
          page,
          limit: pageSize,
          total: authors.length,
          hasMore: false // Since we're filtering in memory, there's no pagination
        };
      } catch (fallbackError) {
        console.error("Fallback search also failed:", fallbackError);
        return {
          items: [],
          page,
          limit: pageSize,
          total: 0,
          hasMore: false
        };
      }
    }
  }

  /**
   * Search authors by name
   * @param name Name to search for
   * @returns Array of authors matching the search
   */
  async searchByName(name: string): Promise<Author[]> {
    try {
      const nameLower = name.toLowerCase();
      const q = firebaseQuery(
        this.getCollection(),
        where("nameLower", ">=", nameLower),
        where("nameLower", "<=", nameLower + "\uf8ff"),
        orderBy("nameLower"),
        limit(10)
      );
      
      const snapshot: QuerySnapshot<DocumentData> = await firestoreGetDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Author[];
    } catch (error) {
      console.error("Error searching authors by name:", error);
      
      // Fallback to exact match if range query fails
      try {
        const exactQ = firebaseQuery(
          this.getCollection(),
          where("name", "==", name),
          limit(10)
        );
        
        const snapshot: QuerySnapshot<DocumentData> = await firestoreGetDocs(exactQ);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Author[];
      } catch (fallbackError) {
        console.error("Fallback search also failed:", fallbackError);
        return [];
      }
    }
  }
}

/**
 * Singleton instance of AuthorService
 */
export const authorService = new AuthorService();

export default authorService;
