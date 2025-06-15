import { db } from '@/config/firebase';
import { COLLECTIONS, getSubcollectionRef } from '@/config/firestore';
import { CommonColors } from '@/constants/Colors';
import { logger } from '@/utils/logger';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface BulkUploadData {
  books?: {
    title: string;
    author: string;
    category: string;
    publisher: string;
    description?: string;
    isbn?: string;
    publicationDate?: string;
    pageCount?: number;
    language?: string;
    coverImage?: string;
  }[];
  authors?: {
    name: string;
    bio?: string;
    photoURL?: string;
    website?: string;
    birthDate?: string;
    nationality?: string;
  }[];
  categories?: {
    name: string;
    description?: string;
  }[];
  publishers?: {
    name: string;
    location?: string;
    website?: string;
    description?: string;
  }[];
}

interface BulkUploaderProps {
  onComplete?: (results: UploadResults) => void;
  entityType?: 'books' | 'authors' | 'categories' | 'publishers';
}

interface UploadResults {
  success: boolean;
  totalItems: number;
  uploadedItems: number;
  errors: string[];
  uploadedIds: Record<string, string[]>; // Map of entity type to array of document IDs
}

const BulkUploader: React.FC<BulkUploaderProps> = ({ onComplete, entityType }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<UploadResults | null>(null);

  // Handle file picking
  const pickAndProcessFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      // Process the selected file
      await processJSONFile(result.assets[0].uri);
    } catch (error) {
      logger.error('BulkUploader', 'Error picking file', error);
      Alert.alert('Error', 'Failed to pick file. Please try again.');
    }
  };

  // Process JSON file and upload to Firestore
  const processJSONFile = async (fileUri: string) => {
    setLoading(true);
    setResults(null);

    try {
      // Read file contents
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const jsonData: BulkUploadData = JSON.parse(fileContent);

      // Validate data
      if (!jsonData || typeof jsonData !== 'object') {
        throw new Error('Invalid JSON format');
      }

      // Filter data based on entityType if specified
      let filteredData: BulkUploadData = { ...jsonData };
      if (entityType) {
        // Clear other entity types if specific type is requested
        Object.keys(filteredData).forEach(key => {
          if (key !== entityType) {
            filteredData[key] = [];
          }
        });
      }

      const results = await uploadDataToFirestore(filteredData);
      setResults(results);
      
      if (onComplete) {
        onComplete(results);
      }

      // Show success message
      if (results.success) {
        Alert.alert('Success', `Successfully uploaded ${results.uploadedItems} items.`);
      } else {
        Alert.alert(
          'Upload Completed with Errors',
          `Uploaded ${results.uploadedItems} out of ${results.totalItems} items.`,
        );
      }
    } catch (error) {
      logger.error('BulkUploader', 'Error processing file', error);
      
      const errorResults: UploadResults = {
        success: false,
        totalItems: 0,
        uploadedItems: 0,
        errors: [error.message || 'Unknown error occurred'],
        uploadedIds: {}
      };
      
      setResults(errorResults);
      
      if (onComplete) {
        onComplete(errorResults);
      }
      
      Alert.alert('Error', 'Failed to process file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Upload data to Firestore using batched writes
  const uploadDataToFirestore = async (data: BulkUploadData): Promise<UploadResults> => {
    const errors: string[] = [];
    let totalItems = 0;
    let uploadedItems = 0;
    const uploadedIds: Record<string, string[]> = {
      categories: [],
      publishers: [],
      authors: [],
      books: []
    };

    try {
      // Process categories first (they don't depend on other entities)
      if (data.categories && data.categories.length > 0) {
        totalItems += data.categories.length;
        const categoriesRef = getSubcollectionRef(COLLECTIONS.CATEGORIES);
        const categoryBatch = writeBatch(db);
        
        data.categories.forEach((category, index) => {
          if (!category.name) {
            errors.push(`Category at index ${index} is missing a name`);
            return;
          }
          
          // Create a document with the category data
          const newCategoryRef = doc(categoriesRef);
          const docId = newCategoryRef.id;
          
          categoryBatch.set(newCategoryRef, {
            id: docId, // Include the document ID in the data
            title: category.name,
            description: category.description || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          // Track the uploaded document ID
          uploadedIds.categories.push(docId);
        });

        await categoryBatch.commit();
        uploadedItems += data.categories.length;
        logger.log('BulkUploader', `Uploaded ${data.categories.length} categories`);
      }

      // Process publishers
      if (data.publishers && data.publishers.length > 0) {
        totalItems += data.publishers.length;
        const publishersRef = getSubcollectionRef(COLLECTIONS.PUBLISHERS);
        const publisherBatch = writeBatch(db);
        
        data.publishers.forEach((publisher, index) => {
          if (!publisher.name) {
            errors.push(`Publisher at index ${index} is missing a name`);
            return;
          }
          
          const newPublisherRef = doc(publishersRef);
          const docId = newPublisherRef.id;
          
          publisherBatch.set(newPublisherRef, {
            id: docId, // Include the document ID in the data
            name: publisher.name,
            location: publisher.location || '',
            website: publisher.website || '',
            description: publisher.description || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          // Track the uploaded document ID
          uploadedIds.publishers.push(docId);
        });

        await publisherBatch.commit();
        uploadedItems += data.publishers.length;
        logger.log('BulkUploader', `Uploaded ${data.publishers.length} publishers`);
      }

      // Process authors
      if (data.authors && data.authors.length > 0) {
        totalItems += data.authors.length;
        const authorsRef = getSubcollectionRef(COLLECTIONS.AUTHORS);
        const authorBatch = writeBatch(db);
        
        data.authors.forEach((author, index) => {
          if (!author.name) {
            errors.push(`Author at index ${index} is missing a name`);
            return;
          }
          
          const newAuthorRef = doc(authorsRef);
          const docId = newAuthorRef.id;
          
          authorBatch.set(newAuthorRef, {
            id: docId, // Include the document ID in the data
            name: author.name,
            bio: author.bio || '',
            photoURL: author.photoURL || '',
            website: author.website || '',
            birthDate: author.birthDate || null,
            nationality: author.nationality || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          // Track the uploaded document ID
          uploadedIds.authors.push(docId);
        });

        await authorBatch.commit();
        uploadedItems += data.authors.length;
        logger.log('BulkUploader', `Uploaded ${data.authors.length} authors`);
      }

      // Process books last (they depend on other entities)
      if (data.books && data.books.length > 0) {
        totalItems += data.books.length;
        const booksRef = getSubcollectionRef(COLLECTIONS.BOOKS);
        
        // Process books in smaller batches to avoid Firestore limitations
        const BATCH_SIZE = 20;
        
        for (let i = 0; i < data.books.length; i += BATCH_SIZE) {
          const bookBatch = writeBatch(db);
          const booksSlice = data.books.slice(i, i + BATCH_SIZE);
          
          booksSlice.forEach((book, index) => {
            if (!book.title) {
              errors.push(`Book at index ${i + index} is missing a title`);
              return;
            }
            
            const newBookRef = doc(booksRef);
            const docId = newBookRef.id;
            
            // Transform book data for Firestore
            const bookData = {
              id: docId, // Include the document ID in the data
              title: book.title,
              titleLowerCase: book.title.toLowerCase(), // For case-insensitive search
              description: book.description || '',
              isbn: book.isbn || '',
              pageCount: book.pageCount ? Number(book.pageCount) : 0,
              language: book.language || 'id',
              coverImage: book.coverImage || '',
              publicationDate: book.publicationDate || null,
              
              // Referenced entities - these would normally store IDs,
              // but for bulk import we'll just store the names
              authorNames: [book.author || 'Unknown'],
              authorNamesLowerCase: [book.author ? book.author.toLowerCase() : 'unknown'],
              categories: [book.category || 'Uncategorized'],
              publisher: book.publisher || 'Unknown',
              
              // Default metadata
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              
              // Default inventory values
              inventory: {
                totalStock: 1,
                availableStock: 1, 
                borrowedCount: 0
              }
            };
            
            bookBatch.set(newBookRef, bookData);
            
            // Track the uploaded document ID
            uploadedIds.books.push(docId);
          });
          
          await bookBatch.commit();
          uploadedItems += booksSlice.length;
          logger.log('BulkUploader', `Uploaded ${booksSlice.length} books (batch ${i / BATCH_SIZE + 1})`);
        }
      }

      return {
        success: errors.length === 0,
        totalItems,
        uploadedItems,
        errors,
        uploadedIds
      };
    } catch (error) {
      logger.error('BulkUploader', 'Error uploading to Firestore', error);
      return {
        success: false,
        totalItems,
        uploadedItems,
        errors: [...errors, error.message || 'Unknown error during upload'],
        uploadedIds
      };
    }
  };

  // Get title based on entity type
  const getTitle = () => {
    if (entityType) {
      const titles = {
        books: 'Upload Books',
        authors: 'Upload Authors',
        categories: 'Upload Categories',
        publishers: 'Upload Publishers'
      };
      return titles[entityType];
    }
    return 'Upload JSON File';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.uploadButton} 
        onPress={pickAndProcessFile}
        disabled={loading}
      >
        <Ionicons name="cloud-upload-outline" size={24} color="white" />
        <Text style={styles.buttonText}>
          {loading ? 'Uploading...' : getTitle()}
        </Text>
      </TouchableOpacity>
      
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={CommonColors.primary} />
          <Text style={styles.loadingText}>Processing file...</Text>
        </View>
      )}
      
      {results && (
        <View style={styles.resultsContainer}>
          <Text style={[
            styles.resultTitle,
            {color: results.success ? CommonColors.success : CommonColors.error}
          ]}>
            {results.success ? 'Upload Complete' : 'Upload Completed with Errors'}
          </Text>
          
          <Text style={styles.resultSummary}>
            Uploaded {results.uploadedItems} of {results.totalItems} items
          </Text>
          
          {results.errors.length > 0 && (
            <View style={styles.errorsContainer}>
              <Text style={styles.errorsTitle}>Errors:</Text>
              {results.errors.map((error, index) => (
                <Text key={index} style={styles.errorText}>• {error}</Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CommonColors.primary,
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  loaderContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: CommonColors.gray600,
  },
  resultsContainer: {
    marginTop: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: CommonColors.gray300,
    borderRadius: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultSummary: {
    fontSize: 16,
    marginBottom: 10,
  },
  errorsContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: CommonColors.errorLight,
    borderRadius: 6,
  },
  errorsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: CommonColors.error,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 3,
    color: CommonColors.error,
  }
});

export default BulkUploader; 
