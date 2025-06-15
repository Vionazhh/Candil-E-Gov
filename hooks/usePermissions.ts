/**
 * Custom hook for handling app permissions
 * Provides a clean interface for requesting and checking permissions
 */
import { logger } from '@/utils/logger';
import {
    PermissionResult,
    PermissionStatus,
    PermissionType,
    checkPermission,
    requestPermission,
    requestPermissionWithFallback
} from '@/utils/permissions';
import { useCallback, useEffect, useState } from 'react';

interface UsePermissionsProps {
  type: PermissionType;
  autoRequest?: boolean;
  onGranted?: () => void;
  onDenied?: () => void;
}

interface UsePermissionsResult {
  status: PermissionStatus;
  isGranted: boolean;
  isDenied: boolean;
  isUndetermined: boolean;
  canAskAgain: boolean;
  loading: boolean;
  checkStatus: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  requestWithFallback: (rationale: string) => Promise<boolean>;
}

/**
 * Hook for managing a specific permission
 * @param props Configuration options for the hook
 * @returns Permission status and methods to request permissions
 */
export function usePermission({
  type,
  autoRequest = false,
  onGranted,
  onDenied
}: UsePermissionsProps): UsePermissionsResult {
  const [permissionResult, setPermissionResult] = useState<PermissionResult>({
    status: PermissionStatus.UNDETERMINED,
    canAskAgain: true,
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Check permission status
  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);
      const result = await checkPermission(type);
      setPermissionResult(result);
      
      // Trigger callbacks based on status
      if (result.status === PermissionStatus.GRANTED && onGranted) {
        onGranted();
      } else if (result.status === PermissionStatus.DENIED && onDenied) {
        onDenied();
      }
    } catch (error) {
      logger.error(`Error checking permission status for ${type}:`, error);
    } finally {
      setLoading(false);
    }
  }, [type, onGranted, onDenied]);

  // Request permission
  const askPermission = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await requestPermission(type);
      setPermissionResult(result);
      
      const isGranted = result.status === PermissionStatus.GRANTED;
      
      // Trigger callbacks based on status
      if (isGranted && onGranted) {
        onGranted();
      } else if (!isGranted && onDenied) {
        onDenied();
      }
      
      return isGranted;
    } catch (error) {
      logger.error(`Error requesting permission for ${type}:`, error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [type, onGranted, onDenied]);

  // Request permission with fallback to settings
  const askWithFallback = useCallback(async (rationale: string): Promise<boolean> => {
    try {
      setLoading(true);
      const isGranted = await requestPermissionWithFallback(type, rationale);
      
      // Update status after request
      await checkStatus();
      
      return isGranted;
    } catch (error) {
      logger.error(`Error requesting permission with fallback for ${type}:`, error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [type, checkStatus]);

  // Initial permission check
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Auto-request permission if specified
  useEffect(() => {
    if (autoRequest && 
        permissionResult.status === PermissionStatus.UNDETERMINED &&
        permissionResult.canAskAgain && 
        !loading) {
      askPermission();
    }
  }, [autoRequest, permissionResult, loading, askPermission]);

  return {
    status: permissionResult.status,
    isGranted: permissionResult.status === PermissionStatus.GRANTED,
    isDenied: permissionResult.status === PermissionStatus.DENIED,
    isUndetermined: permissionResult.status === PermissionStatus.UNDETERMINED,
    canAskAgain: permissionResult.canAskAgain,
    loading,
    checkStatus,
    requestPermission: askPermission,
    requestWithFallback: askWithFallback,
  };
}

/**
 * Hook for managing multiple permissions at once
 * @param permissions Array of permission types to manage
 * @param autoRequest Whether to automatically request permissions
 * @returns Object with methods to check and request all permissions
 */
export function useMultiplePermissions(
  permissions: PermissionType[],
  autoRequest = false
) {
  const [results, setResults] = useState<Record<PermissionType, PermissionResult>>({} as any);
  const [loading, setLoading] = useState<boolean>(true);

  // Check all permissions
  const checkAllPermissions = useCallback(async () => {
    try {
      setLoading(true);
      
      const permissionResults: Record<PermissionType, PermissionResult> = {} as any;
      
      for (const permission of permissions) {
        permissionResults[permission] = await checkPermission(permission);
      }
      
      setResults(permissionResults);
    } catch (error) {
      logger.error('Error checking multiple permissions:', error);
    } finally {
      setLoading(false);
    }
  }, [permissions]);

  // Request all permissions
  const requestAllPermissions = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      
      let allGranted = true;
      const permissionResults: Record<PermissionType, PermissionResult> = {} as any;
      
      for (const permission of permissions) {
        const result = await requestPermission(permission);
        permissionResults[permission] = result;
        
        if (result.status !== PermissionStatus.GRANTED) {
          allGranted = false;
        }
      }
      
      setResults(permissionResults);
      return allGranted;
    } catch (error) {
      logger.error('Error requesting multiple permissions:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [permissions]);

  // Check if all permissions are granted
  const areAllGranted = useCallback(() => {
    if (Object.keys(results).length !== permissions.length) {
      return false;
    }
    
    return permissions.every(
      (permission) => results[permission]?.status === PermissionStatus.GRANTED
    );
  }, [permissions, results]);

  // Initial permission check
  useEffect(() => {
    checkAllPermissions();
  }, [checkAllPermissions]);

  // Auto-request permissions if specified
  useEffect(() => {
    if (autoRequest && !loading && !areAllGranted()) {
      requestAllPermissions();
    }
  }, [autoRequest, loading, areAllGranted, requestAllPermissions]);

  return {
    results,
    loading,
    areAllGranted: areAllGranted(),
    checkAllPermissions,
    requestAllPermissions,
  };
} 