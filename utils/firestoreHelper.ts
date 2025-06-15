/**
 * Firestore helper utilities
 * Provides simplified access to Firestore operations
 * Note: This file is kept for backward compatibility, prefer using BaseService for new code
 */
import { db } from "@/config/firebase";
import {
    addDoc,
    collection,
    CollectionReference,
    deleteDoc,
    doc,
    DocumentReference,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
    updateDoc,
    where,
    WhereFilterOp
} from "firebase/firestore";

/**
 * Get a collection reference
 * @param path Collection path
 * @returns Collection reference
 */
export const getCollection = (path: string): CollectionReference => collection(db, path);

/**
 * Get a document reference
 * @param path Collection path
 * @param id Document ID
 * @returns Document reference
 */
export const getDocument = (path: string, id: string): DocumentReference => doc(db, path, id);

// Re-export Firestore functions for convenience
export {
    addDoc, deleteDoc, getDoc, getDocs, limit, orderBy, query, startAfter, updateDoc, where, WhereFilterOp
};

