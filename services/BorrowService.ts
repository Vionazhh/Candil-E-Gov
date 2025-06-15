import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/config/firestore";
import { Book } from "@/types/Book";
import { logger } from "@/utils/logger";
import {
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  QueryDocumentSnapshot,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { BaseService } from "./BaseService";
import { BookService } from "./BookService";

/**
 * User simplified interface for borrow relations
 */
export interface User {
  id: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
}

/**
 * Status types for book borrowing
 */
export type BorrowStatus = "active" | "returned" | "overdue" | "reserved";

/**
 * Borrow interface representing a book borrow entity
 */
export interface Borrow {
  id?: string;
  bookId: string;
  userId: string;
  borrowDate: Date | Timestamp;
  dueDate: Date | Timestamp;
  returnDate?: Date | Timestamp | null;
  status: BorrowStatus;
  notes?: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  // References to related entities
  book?: Book;
  user?: User;
}

/**
 * Service for managing book borrow operations
 */
export class BorrowService extends BaseService<Borrow> {
  // Standard lending period in days
  private STANDARD_LENDING_PERIOD = 7;
  private bookService: BookService;

  constructor() {
    super(COLLECTIONS.BORROWS);
    this.bookService = new BookService();

    // Ensure root document exists
    // this.ensureRootDocumentExists().catch(err => {
    //   logger.error('BorrowService', 'Failed to ensure root document', err);
    // });
  }

  /**
   * Get user's active borrows with book data
   * @param userId User ID
   * @returns List of active borrows for the user with book data
   */
  async getUserActiveBorrows(userId: string): Promise<Borrow[]> {
    // Check for overdue books first and auto-return them
    await this.checkAndReturnOverdueBorrows(userId);

    const q = query(
      this.getCollection(),
      where("userId", "==", userId),
      where("status", "==", "active"),
      orderBy("dueDate", "asc") // Sort by due date so closest ones appear first
    );

    const snapshot = await getDocs(q);
    const borrows: Borrow[] = [];

    // Fetch book data for each borrow
    const bookPromises = snapshot.docs.map(
      async (docSnap: QueryDocumentSnapshot) => {
        const borrow = this.mapDocumentData(docSnap);
        try {
          const book = await this.bookService.getBookById(borrow.bookId);
          if (book) {
            borrow.book = book;
          }
        } catch (error) {
          logger.error(
            "BorrowService",
            `Failed to fetch book data for borrow ${docSnap.id}`,
            error
          );
        }
        borrows.push(borrow);
      }
    );

    await Promise.all(bookPromises);
    return borrows;
  }

  /**
   * Get all borrows for a book with user data
   * @param bookId Book ID
   * @returns List of all borrows for the book with user data
   */
  async getBookBorrows(bookId: string): Promise<Borrow[]> {
    const q = query(
      this.getCollection(),
      where("bookId", "==", bookId),
      orderBy("borrowDate", "desc")
    );

    const snapshot = await getDocs(q);
    const borrows: Borrow[] = [];

    // Fetch user data for each borrow
    const userPromises = snapshot.docs.map(
      async (docSnap: QueryDocumentSnapshot) => {
        const borrow = this.mapDocumentData(docSnap);
        try {
          // Use db instance and proper doc function
          const userRef = doc(db, COLLECTIONS.USERS, borrow.userId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            borrow.user = {
              id: userDoc.id,
              displayName: userDoc.data().displayName,
              email: userDoc.data().email,
              photoURL: userDoc.data().photoURL,
            };
          }
        } catch (error) {
          logger.error(
            "BorrowService",
            `Failed to fetch user data for borrow ${docSnap.id}`,
            error
          );
        }
        borrows.push(borrow);
      }
    );

    await Promise.all(userPromises);
    return borrows;
  }

  /**
   * Check if book is available for borrowing
   * @param bookId Book ID
   * @returns True if book is available, false otherwise
   */
  async isBookAvailable(bookId: string): Promise<boolean> {
    const q = query(
      this.getCollection(),
      where("bookId", "==", bookId),
      where("status", "==", "active")
    );

    const snapshot = await getDocs(q);
    return snapshot.empty;
  }

  /**
   * Borrow a book
   * @param bookId Book ID
   * @param userId User ID
   * @returns The created borrow record with 7-day due date
   */
  async borrowBook(bookId: string, userId: string): Promise<Borrow> {
    try {
      console.log("Attempting to borrow book with ID:", bookId);

      // Get book document directly from Firestore
      const bookRef = doc(db, COLLECTIONS.BOOKS, bookId);
      const bookDoc = await getDoc(bookRef);


      // if (!bookDoc.exists()) {
      //   console.error("Book document does not exist in Firestore:", bookId);
      //   throw new Error("Buku tidak ditemukan");
      // }

      const bookData = bookDoc.data();
      console.log("Book data found:", bookData);

      // Check inventory if present
      if (bookData?.stock) {
        if (bookData?.stock.availableStock <= 0) {
          throw new Error("Tidak ada stok buku yang tersedia untuk dipinjam");
        }
      }

      // Check if book is available (not currently borrowed)
      const isAvailable = await this.isBookAvailable(bookId);
      if (!isAvailable) {
        throw new Error("Buku sedang dipinjam dan tidak tersedia");
      }

      // Update book inventory if it exists
      if (bookData?.stock) {
        await updateDoc(bookRef, {
          "inventory.availableStock": increment(-1),
          "inventory.borrowedCount": increment(1),
        });
      }

      // Set due date to 7 days from now
      const now = new Date();
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + this.STANDARD_LENDING_PERIOD);

      const borrow: Omit<Borrow, "id"> = {
        bookId,
        userId,
        borrowDate: Timestamp.now(),
        dueDate: Timestamp.fromDate(dueDate),
        status: "active",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      console.log("Creating borrow record:", borrow);
      return this.create(borrow);
    } catch (error) {
      logger.error("BorrowService", "Error borrowing book", error);
      throw error;
    }
  }

  /**
   * Return a book
   * @param borrowId Borrow ID
   * @returns The updated borrow record
   */
  async returnBook(borrowId: string): Promise<Borrow> {
    try {
      // Get the borrow record first
      const borrowRecord = await this.getById(borrowId);

      if (!borrowRecord) {
        throw new Error("Peminjaman tidak ditemukan");
      }

      // Update book inventory - fix reference to use db instance
      try {
        // Check if the book exists first before updating it
        const bookRef = doc(db, COLLECTIONS.BOOKS, borrowRecord.bookId);
        const bookDoc = await getDoc(bookRef);

        if (bookDoc.exists()) {
          // Only update if the book exists
          await updateDoc(bookRef, {
            "inventory.availableStock": increment(1),
          });
        } else {
          // Log warning but don't fail the operation
          logger.warn(
            "BorrowService",
            `Book not found during return: ${borrowRecord.bookId}`
          );
        }
      } catch (inventoryError) {
        // Log the inventory update error but continue with return process
        logger.error(
          "BorrowService",
          `Error updating book inventory: ${borrowRecord.bookId}`,
          inventoryError
        );
        // Don't throw, as we still want to update the borrow status
      }

      // Update borrow record
      return this.update(borrowId, {
        returnDate: Timestamp.now(),
        status: "returned",
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      logger.error("BorrowService", "Error returning book", error);
      throw error;
    }
  }

  /**
   * Check for and return all overdue books for a user
   * This should be called when user opens the app
   * @param userId User ID
   */
  private async checkAndReturnOverdueBorrows(userId: string): Promise<void> {
    try {
      // Get all active borrows for the user
      const q = query(
        this.getCollection(),
        where("userId", "==", userId),
        where("status", "==", "active")
      );

      const snapshot = await getDocs(q);
      const now = Timestamp.now();

      // Process each borrow
      const updatePromises: Promise<Borrow>[] = [];

      snapshot.forEach((doc: QueryDocumentSnapshot) => {
        const borrow = this.mapDocumentData(doc);
        const dueDate = borrow.dueDate as Timestamp;

        // If due date is before now, it's overdue, auto-return it
        if (dueDate.toDate() < now.toDate()) {
          updatePromises.push(
            this.update(doc.id, {
              returnDate: now,
              status: "returned",
              notes: "Buku otomatis dikembalikan karena melewati tenggat waktu",
              updatedAt: now,
            })
          );
        }
      });

      // Wait for all updates to complete
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        logger.log(
          "BorrowService",
          "Auto-returned overdue books",
          `${updatePromises.length} books returned for user ${userId}`
        );
      }
    } catch (error) {
      logger.error("BorrowService", "Error checking overdue borrows", error);
      // Don't throw, as we don't want this to block the main flow
    }
  }

  /**
   * Check for and return all overdue books across all users
   * This should be run as a scheduled job
   */
  async checkAllOverdueBorrows(): Promise<number> {
    try {
      // Get all active borrows
      const q = query(this.getCollection(), where("status", "==", "active"));

      const snapshot = await getDocs(q);
      const now = Timestamp.now();

      // Process each borrow
      const updatePromises: Promise<Borrow>[] = [];

      snapshot.forEach((doc: QueryDocumentSnapshot) => {
        const borrow = this.mapDocumentData(doc);
        const dueDate = borrow.dueDate as Timestamp;

        // If due date is before now, it's overdue, auto-return it
        if (dueDate.toDate() < now.toDate()) {
          updatePromises.push(
            this.update(doc.id, {
              returnDate: now,
              status: "returned",
              notes: "Buku otomatis dikembalikan karena melewati tenggat waktu",
              updatedAt: now,
            })
          );
        }
      });

      // Wait for all updates to complete
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        logger.log(
          "BorrowService",
          "Auto-returned all overdue books",
          `${updatePromises.length} books returned`
        );
      }

      return updatePromises.length;
    } catch (error) {
      logger.error(
        "BorrowService",
        "Error checking all overdue borrows",
        error
      );
      return 0;
    }
  }

  /**
   * Get user's borrow history with book data
   * @param userId User ID
   * @returns List of all borrows for the user with book data
   */
  async getUserBorrowHistory(userId: string): Promise<Borrow[]> {
    const q = query(
      this.getCollection(),
      where("userId", "==", userId),
      orderBy("borrowDate", "desc")
    );

    const snapshot = await getDocs(q);
    const borrows: Borrow[] = [];

    // Fetch book data for each borrow
    const bookPromises = snapshot.docs.map(
      async (doc: QueryDocumentSnapshot) => {
        const borrow = this.mapDocumentData(doc);
        try {
          const book = await this.bookService.getBookById(borrow.bookId);
          if (book) {
            borrow.book = book;
          }
        } catch (error) {
          logger.error(
            "BorrowService",
            `Failed to fetch book data for borrow ${doc.id}`,
            error
          );
        }
        borrows.push(borrow);
      }
    );

    await Promise.all(bookPromises);
    return borrows;
  }

  /**
   * Get a specific borrow by ID with book and user data
   * @param borrowId Borrow ID
   * @returns The borrow record with book and user data or null if not found
   */
  async getBorrowById(borrowId: string): Promise<Borrow | null> {
    try {
      const borrow = await this.getById(borrowId);
      if (!borrow) return null;

      // Fetch book data
      try {
        const book = await this.bookService.getBookById(borrow.bookId);
        if (book) {
          borrow.book = book;
        }
      } catch (error) {
        logger.error(
          "BorrowService",
          `Failed to fetch book data for borrow ${borrowId}`,
          error
        );
      }

      // Fetch user data
      try {
        const userRef = doc(db, COLLECTIONS.USERS, borrow.userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          borrow.user = {
            id: userDoc.id,
            displayName: userDoc.data().displayName,
            email: userDoc.data().email,
            photoURL: userDoc.data().photoURL,
          };
        }
      } catch (error) {
        logger.error(
          "BorrowService",
          `Failed to fetch user data for borrow ${borrowId}`,
          error
        );
      }

      return borrow;
    } catch (error) {
      logger.error(
        "BorrowService",
        `Error getting borrow with ID: ${borrowId}`,
        error
      );
      return null;
    }
  }
}

// Export singleton instance
export const borrowService = new BorrowService();

export default borrowService;
