import {
  COLLECTIONS,
  getSubcollectionRef
} from "@/config/firestore";
import { Author, Book, BookFilterOptions, Publisher } from "@/types/Book";
import { Category } from "@/types/Category";
import { logger } from "@/utils/logger";
import {
  CollectionReference,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  WhereFilterOp
} from "firebase/firestore";
import { BaseService, ListResponse } from "./BaseService";

/**
 * Service for handling book operations with Firestore
 * Follows the Single Responsibility Principle by focusing only on book-related operations
 */
export class BookService extends BaseService<Book> {
  private authorsCollection: CollectionReference;
  private publishersCollection: CollectionReference;
  private categoriesCollection: CollectionReference;
  private borrowsCollection: CollectionReference;

  constructor() {
    super(COLLECTIONS.BOOKS);
    this.authorsCollection = getSubcollectionRef(COLLECTIONS.AUTHORS);
    this.publishersCollection = getSubcollectionRef(COLLECTIONS.PUBLISHERS);
    this.categoriesCollection = getSubcollectionRef(COLLECTIONS.CATEGORIES);
    this.borrowsCollection = getSubcollectionRef(COLLECTIONS.BORROWS);
    
    // Ensure root document exists
    // this.ensureRootDocumentExists().then(success => {
    //   if (success) {
    //     logger.log('BookService', 'Root document ensured', 'Firestore structure is ready');
    //   } else {
    //     logger.error('BookService', 'Failed to ensure root document', 'Check Firestore permissions');
    //   }
    // });
  }

  /**
   * Get all categories
   * @returns List of all categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const q = query(
        this.categoriesCollection,
        orderBy("title", "asc")
      );
      
      const snapshot = await getDocs(q);
      const categories: Category[] = [];
      
      snapshot.forEach((doc) => {
        categories.push({
          id: doc.id,
          ...doc.data()
        } as Category);
      });
      
      return categories;
    } catch (error) {
      logger.error('BookService', 'Failed to get categories', error);
      return [];
    }
  }

  /**
   * Get all books with pagination and related entities
   */
  async getAllBooks(page = 1, pageSize = 10): Promise<ListResponse<Book>> {
    const response = await this.getAll({
      page,
      limit: pageSize,
      orderByField: "title",
      orderDirection: "asc",
    });

    // Enhance books with related entities
    const enhancedBooks = await Promise.all(
      response.items.map(async (book) => {
        return this.enhanceBookWithRelations(book);
      })
    );

    return {
      ...response,
      items: enhancedBooks
    };
  }

  /**
   * Enhance a book with its related entities (author, category, publisher)
   * @param book The book to enhance
   * @returns Book with related entities
   */
  private async enhanceBookWithRelations(book: Book): Promise<Book> {
    // Create a copy of the book object
    const enhancedBook = { ...book };
    
    // Get related category
    if (enhancedBook.categoryId) {
      try {
        const categoryDocRef = doc(this.categoriesCollection, enhancedBook.categoryId);
        const categorySnap = await getDoc(categoryDocRef);
        if (categorySnap.exists()) {
          enhancedBook.category = { 
            id: categorySnap.id, 
            ...categorySnap.data() as DocumentData 
          } as Category;
        } else {
          // If category doesn't exist, set a default
          enhancedBook.category = { 
            id: enhancedBook.categoryId,
            title: 'Unknown Category' 
          } as Category;
        }
      } catch (err) {
        logger.error('BookService', `Failed to get category for book ${enhancedBook.id}`, err);
        // Set default category on error
        enhancedBook.category = { 
          id: enhancedBook.categoryId,
          title: 'Error Loading Category' 
        } as Category;
      }
    }

    // Get related author
    if (enhancedBook.authorId) {
      try {
        const authorDocRef = doc(this.authorsCollection, enhancedBook.authorId);
        const authorSnap = await getDoc(authorDocRef);
        if (authorSnap.exists()) {
          enhancedBook.author = { 
            id: authorSnap.id, 
            ...authorSnap.data() as DocumentData 
          } as Author;
        } else {
          // If author doesn't exist, set a default
          enhancedBook.author = { 
            id: enhancedBook.authorId,
            name: 'Unknown Author' 
          } as Author;
        }
      } catch (err) {
        logger.error('BookService', `Failed to get author for book ${enhancedBook.id}`, err);
        // Set default author on error
        enhancedBook.author = { 
          id: enhancedBook.authorId,
          name: 'Error Loading Author' 
        } as Author;
      }
    } else {
      // Handle the case where authorId is missing
      enhancedBook.author = {
        id: 'unknown',
        name: 'No Author Specified'
      } as Author;
    }

    // Get related publisher
    if (enhancedBook.publisherId) {
      try {
        const publisherDocRef = doc(this.publishersCollection, enhancedBook.publisherId);
        const publisherSnap = await getDoc(publisherDocRef);
        if (publisherSnap.exists()) {
          enhancedBook.publisher = { 
            id: publisherSnap.id, 
            ...publisherSnap.data() as DocumentData 
          } as Publisher;
        } else {
          // If publisher doesn't exist, set a default
          enhancedBook.publisher = { 
            id: enhancedBook.publisherId,
            name: 'Unknown Publisher' 
          } as Publisher;
        }
      } catch (err) {
        logger.error('BookService', `Failed to get publisher for book ${enhancedBook.id}`, err);
        // Set default publisher on error
        enhancedBook.publisher = { 
          id: enhancedBook.publisherId,
          name: 'Error Loading Publisher' 
        } as Publisher;
      }
    }

    return enhancedBook;
  }

  /**
   * Get books with optional filtering and pagination
   */
  async getBooks(
    filters?: BookFilterOptions,
    page: number = 1,
    pageLimit: number = 10
  ): Promise<ListResponse<Book>> {
    const queryConstraints = [];

    if (filters) {
      if (filters.categories && filters.categories.length) {
        queryConstraints.push(where("categoryId", "in", filters.categories));
      }

      if (filters.availability && filters.availability.length) {
        queryConstraints.push(where("availability", "in", filters.availability));
      }

      if (filters.languages && filters.languages.length) {
        queryConstraints.push(where("language", "in", filters.languages));
      }

      // if (filters.formats && filters.formats.length) {
      //   queryConstraints.push(where("format", "in", filters.formats));
      // }

      if (filters.fromYear) {
        queryConstraints.push(where("publishYear", ">=", filters.fromYear));
      }

      if (filters.toYear) {
        queryConstraints.push(where("publishYear", "<=", filters.toYear));
      }

      if (filters.minRating) {
        queryConstraints.push(where("rating", ">=", filters.minRating));
      }

      // if (filters.tags && filters.tags.length) {
      //   // Note: array-contains-any can only include max 10 values
      //   const limitedTags = filters.tags.slice(0, 10);
      //   queryConstraints.push(where("tags", "array-contains-any", limitedTags));
      // }
    }

    // Add sorting and pagination
    queryConstraints.push(orderBy("title"));
    queryConstraints.push(limit(pageLimit));

    const q = query(this.getCollection(), ...queryConstraints);
    const snapshot = await getDocs(q);

    const books: Book[] = [];
    snapshot.forEach((doc) => {
      books.push(this.mapDocumentData(doc));
    });

    return {
      items: books,
      page,
      limit: pageLimit,
      total: books.length,
      hasMore: books.length === pageLimit,
    };
  }

  /**
   * Get a book by ID with related entities
   * @param id Book ID
   * @returns Book details with related entities
   */
  async getBookById(id: string): Promise<Book> {
    const docRef = this.getDocument(id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) throw new Error("Book not found");
    
    const bookData = { id: docSnap.id, ...docSnap.data() } as Book;
    return this.enhanceBookWithRelations(bookData);
  }

  /**
   * Search books by query string
   */
  async searchBooks(
    query: string,
    page: number = 1,
    pageLimit: number = 10,
    isPhraseSearch: boolean = false
  ): Promise<ListResponse<Book>> {
    // For full-text search in a real app, consider using Algolia or similar
    // This is a simple implementation using field starts with
    const titleQuery = isPhraseSearch ? query : query.toLowerCase();
    const result = await this.search("titleLower", titleQuery, {
      page,
      limit: pageLimit,
    });

    return result;
  }

  /**
   * Get books by category with relations
   */
  async getBooksByCategory(
    categoryId: string,
    page: number = 1,
    pageLimit: number = 10
  ): Promise<ListResponse<Book>> {
    const response = await this.getAll({
      page,
      limit: pageLimit,
      orderByField: "title",
      orderDirection: "asc",
      filters: [["categoryId", "==", categoryId] as [string, WhereFilterOp, any]],
    });

    // Enhance books with related entities
    const enhancedBooks = await Promise.all(
      response.items.map(async (book) => {
        return this.enhanceBookWithRelations(book);
      })
    );

    return {
      ...response,
      items: enhancedBooks
    };
  }

  /**
   * Get books by author
   */
  async getBooksByAuthor(
    authorId: string,
    page: number = 1,
    pageLimit: number = 10
  ): Promise<ListResponse<Book>> {
    const response = await this.getAll({
      page,
      limit: pageLimit,
      orderByField: "title",
      orderDirection: "asc",
      filters: [["authorId", "==", authorId] as [string, WhereFilterOp, any]],
    });

    // Enhance books with related entities
    const enhancedBooks = await Promise.all(
      response.items.map(async (book) => {
        return this.enhanceBookWithRelations(book);
      })
    );

    return {
      ...response,
      items: enhancedBooks
    };
  }

  /**
   * Get books by publisher
   */
  async getBooksByPublisher(
    publisherId: string,
    page: number = 1,
    pageLimit: number = 10
  ): Promise<ListResponse<Book>> {
    const response = await this.getAll({
      page,
      limit: pageLimit,
      orderByField: "title",
      orderDirection: "asc",
      filters: [["publisherId", "==", publisherId] as [string, WhereFilterOp, any]],
    });

    // Enhance books with related entities
    const enhancedBooks = await Promise.all(
      response.items.map(async (book) => {
        return this.enhanceBookWithRelations(book);
      })
    );

    return {
      ...response,
      items: enhancedBooks
    };
  }
}

// Export singleton instance
export const bookService = new BookService();

export default bookService;