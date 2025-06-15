import NetInfo from '@react-native-community/netinfo';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

// Types
interface FileInfo {
  uri: string;
  name: string;
  exists: boolean;
  size?: number;
  lastModified?: number;
}

interface DownloadProgress {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
  progress: number;
}

interface UseFileDownloadResult {
  // Main operations
  downloadFile: (url: string, identifier: string) => Promise<string>;
  getLocalUri: (url: string, identifier: string) => Promise<string | null>;
  getReadableUri: (identifier: string) => Promise<string | null>; // NEW: For PDF readers
  shareFile: (uri: string, name: string) => Promise<void>;
  deleteFile: (identifier: string) => Promise<boolean>;
  
  // Status and info
  isDownloading: boolean;
  downloadProgress: DownloadProgress | null;
  fileInfo: FileInfo | null;
  error: Error | null;
  clearError: () => void;
}

/**
 * A hook for downloading, caching, and managing PDF or other files
 */
const useFileDownload = (): UseFileDownloadResult => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Get cache directory path with identifier
  const getCacheFilePath = useCallback((identifier: string) => {
    return `${FileSystem.cacheDirectory}${identifier}.pdf`;
  }, []);
  
  // Get document directory path with identifier (for Android PDF readers)
  const getDocumentFilePath = useCallback((identifier: string) => {
    return `${FileSystem.documentDirectory}${identifier}.pdf`;
  }, []);
  
  // Check if a file exists and get info
  const checkFileExists = useCallback(async (
    uri: string, 
    name: string
  ): Promise<FileInfo> => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      return {
        uri,
        name,
        exists: fileInfo.exists,
        size: fileInfo.size,
        lastModified: fileInfo.modificationTime,
      };
    } catch (err) {
      setError(err as Error);
      return {
        uri,
        name,
        exists: false
      };
    }
  }, []);
  
  // Get local URI if file exists or return null
  const getLocalUri = useCallback(async (
    url: string, 
    identifier: string
  ): Promise<string | null> => {
    try {
      const localPath = getCacheFilePath(identifier);
      const info = await checkFileExists(localPath, identifier);
      
      if (info.exists) {
        setFileInfo(info);
        return localPath;
      }
      
      return null;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  }, [getCacheFilePath, checkFileExists]);
  
  // NEW: Get readable URI for PDF readers (especially Android)
  const getReadableUri = useCallback(async (identifier: string): Promise<string | null> => {
    try {
      const cacheUri = getCacheFilePath(identifier);
      const cacheInfo = await checkFileExists(cacheUri, identifier);
      
      if (!cacheInfo.exists) {
        return null;
      }
      
      // For Android, copy to document directory for better PDF reader access
      if (Platform.OS === 'android') {
        const docUri = getDocumentFilePath(identifier);
        const docInfo = await checkFileExists(docUri, identifier);
        
        // If doesn't exist in document directory or cache is newer, copy it
        if (!docInfo.exists || 
            (cacheInfo.lastModified && docInfo.lastModified && 
             cacheInfo.lastModified > docInfo.lastModified)) {
          
          await FileSystem.copyAsync({
            from: cacheUri,
            to: docUri
          });
          
          console.log(`[File copied for reading] ${cacheUri} -> ${docUri}`);
          return docUri;
        }
        
        return docUri;
      }
      
      // For iOS, cache directory should work fine
      return cacheUri;
    } catch (err) {
      console.error('[getReadableUri error]', err);
      setError(err as Error);
      return null;
    }
  }, [getCacheFilePath, getDocumentFilePath, checkFileExists]);
  
  // Download file from URL
  const downloadFile = useCallback(async (
    url: string, 
    identifier: string
  ): Promise<string> => {
    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection');
      }
      
      // Check if already exists in cache
      const existingUri = await getLocalUri(url, identifier);
      if (existingUri) {
        console.log(`[Using cached file] ${existingUri}`);
        return existingUri;
      }
      
      // Begin download
      setIsDownloading(true);
      setDownloadProgress(null);
      setError(null);
      
      const localPath = getCacheFilePath(identifier);
      console.log(`[Downloading to] ${localPath}`);
      
      // Start the download
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        localPath,
        {},
        (progress) => {
          const totalBytesWritten = progress.totalBytesWritten;
          const totalBytesExpectedToWrite = progress.totalBytesExpectedToWrite;
          const progressValue = totalBytesExpectedToWrite > 0 
            ? totalBytesWritten / totalBytesExpectedToWrite 
            : 0;
          
          setDownloadProgress({
            totalBytesWritten,
            totalBytesExpectedToWrite,
            progress: progressValue,
          });
        }
      );
      
      const result = await downloadResumable.downloadAsync();
      
      if (!result) {
        throw new Error('Download failed');
      }
      
      console.log(`[Download completed] ${result.uri}`);
      
      // Get file info
      const info = await checkFileExists(localPath, identifier);
      setFileInfo(info);
      
      return localPath;
    } catch (err) {
      console.error('[Download error]', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsDownloading(false);
    }
  }, [getLocalUri, getCacheFilePath, checkFileExists]);
  
  // Share a file
  const shareFile = useCallback(async (uri: string, name: string) => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Sharing is not available on this device');
      }
      
      // On Android, we need to copy to a shareable location
      if (Platform.OS === 'android') {
        const tempFilePath = `${FileSystem.documentDirectory}${name}`;
        await FileSystem.copyAsync({
          from: uri,
          to: tempFilePath
        });
        await Sharing.shareAsync(tempFilePath, {
          mimeType: 'application/pdf',
          dialogTitle: `Share ${name}`
        });
      } else {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share ${name}`
        });
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);
  
  // Delete a cached file
  const deleteFile = useCallback(async (identifier: string): Promise<boolean> => {
    try {
      const cacheUri = getCacheFilePath(identifier);
      const docUri = getDocumentFilePath(identifier);
      
      let deleted = false;
      
      // Delete from cache
      const cacheInfo = await checkFileExists(cacheUri, identifier);
      if (cacheInfo.exists) {
        await FileSystem.deleteAsync(cacheUri, { idempotent: true });
        deleted = true;
      }
      
      // Delete from document directory (Android)
      if (Platform.OS === 'android') {
        const docInfo = await checkFileExists(docUri, identifier);
        if (docInfo.exists) {
          await FileSystem.deleteAsync(docUri, { idempotent: true });
          deleted = true;
        }
      }
      
      if (deleted) {
        setFileInfo(null);
      }
      
      return deleted;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  }, [getCacheFilePath, getDocumentFilePath, checkFileExists]);
  
  return {
    downloadFile,
    getLocalUri,
    getReadableUri, // NEW method
    shareFile,
    deleteFile,
    isDownloading,
    downloadProgress,
    fileInfo,
    error,
    clearError,
  };
};

export default useFileDownload;