/**
 * Permissions utility for handling app permissions
 * Following SOLID principles:
 * - Single Responsibility: Each function handles one specific permission task
 * - Open/Closed: Extensible for new permission types without modifying existing code
 * - Liskov Substitution: Permission types are interchangeable where applicable
 * - Interface Segregation: Clear interfaces for different permission operations
 * - Dependency Inversion: High-level modules don't depend on low-level modules
 */

// import * as Camera from 'expo-camera';
// import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
// import * as Notifications from 'expo-notifications';
// import * as ExpoPermissions from 'expo-permissions';
import { Alert, Linking, Platform } from 'react-native';
import { logger } from './logger';

// Permission types supported by this utility
export enum PermissionType {
//   CAMERA = 'camera',
//   LOCATION = 'location',
  MEDIA_LIBRARY = 'mediaLibrary',
//   NOTIFICATIONS = 'notifications',
  STORAGE = 'storage',
  MICROPHONE = 'microphone',
}

// Permission status types
export enum PermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  UNDETERMINED = 'undetermined',
  LIMITED = 'limited', // iOS only
}

// Permission result interface
export interface PermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
}

/**
 * Check if a permission is granted
 * @param type The permission type to check
 * @returns Promise resolving to a boolean indicating if permission is granted
 */
export async function hasPermission(type: PermissionType): Promise<boolean> {
  try {
    const result = await checkPermission(type);
    return result.status === PermissionStatus.GRANTED;
  } catch (error) {
    logger.error(`Error checking permission ${type}:`, error);
    return false;
  }
}

/**
 * Check the status of a permission
 * @param type The permission type to check
 * @returns Promise resolving to a PermissionResult
 */
export async function checkPermission(type: PermissionType): Promise<PermissionResult> {
  try {
    switch (type) {
      case PermissionType.CAMERA:
        return await checkCameraPermission();
      case PermissionType.LOCATION:
        return await checkLocationPermission();
      case PermissionType.MEDIA_LIBRARY:
        return await checkMediaLibraryPermission();
      case PermissionType.NOTIFICATIONS:
        return await checkNotificationsPermission();
      case PermissionType.STORAGE:
        return await checkStoragePermission();
      case PermissionType.MICROPHONE:
        return await checkMicrophonePermission();
      default:
        throw new Error(`Unsupported permission type: ${type}`);
    }
  } catch (error) {
    logger.error(`Error checking permission ${type}:`, error);
    return {
      status: PermissionStatus.DENIED,
      canAskAgain: false,
    };
  }
}

/**
 * Request a permission
 * @param type The permission type to request
 * @returns Promise resolving to a PermissionResult
 */
export async function requestPermission(type: PermissionType): Promise<PermissionResult> {
  try {
    switch (type) {
      case PermissionType.CAMERA:
        return await requestCameraPermission();
      case PermissionType.LOCATION:
        return await requestLocationPermission();
      case PermissionType.MEDIA_LIBRARY:
        return await requestMediaLibraryPermission();
      case PermissionType.NOTIFICATIONS:
        return await requestNotificationsPermission();
      case PermissionType.STORAGE:
        return await requestStoragePermission();
      case PermissionType.MICROPHONE:
        return await requestMicrophonePermission();
      default:
        throw new Error(`Unsupported permission type: ${type}`);
    }
  } catch (error) {
    logger.error(`Error requesting permission ${type}:`, error);
    return {
      status: PermissionStatus.DENIED,
      canAskAgain: false,
    };
  }
}

/**
 * Request permission with fallback to settings if denied
 * @param type The permission type to request
 * @param rationale The reason why the app needs this permission
 * @returns Promise resolving to a boolean indicating if permission is granted
 */
export async function requestPermissionWithFallback(
  type: PermissionType, 
  rationale: string
): Promise<boolean> {
  // First check current permission status
  const permissionStatus = await checkPermission(type);
  
  // If already granted, return true
  if (permissionStatus.status === PermissionStatus.GRANTED) {
    return true;
  }
  
  // If can ask again, request permission
  if (permissionStatus.canAskAgain) {
    const result = await requestPermission(type);
    if (result.status === PermissionStatus.GRANTED) {
      return true;
    }
  }
  
  // If permission denied and can't ask again, show settings dialog
  if (!permissionStatus.canAskAgain) {
    return new Promise((resolve) => {
      Alert.alert(
        'Permission Required',
        `${rationale} Please enable it in app settings.`,
        [
          { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: async () => {
              await Linking.openSettings();
              resolve(false); // We don't know if user enabled permission in settings
            },
          },
        ],
      );
    });
  }
  
  return false;
}

// Individual permission checkers
async function checkCameraPermission(): Promise<PermissionResult> {
  const { status, canAskAgain } = await Camera.getCameraPermissionsAsync();
  return {
    status: status as PermissionStatus,
    canAskAgain,
  };
}

async function checkLocationPermission(): Promise<PermissionResult> {
  const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
  return {
    status: status as PermissionStatus,
    canAskAgain,
  };
}

async function checkMediaLibraryPermission(): Promise<PermissionResult> {
  const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
  return {
    status: status as PermissionStatus,
    canAskAgain,
  };
}

async function checkNotificationsPermission(): Promise<PermissionResult> {
  const { status, canAskAgain } = await Notifications.getPermissionsAsync();
  return {
    status: status as PermissionStatus,
    canAskAgain,
  };
}

async function checkStoragePermission(): Promise<PermissionResult> {
  // On iOS, we don't need explicit storage permission
  if (Platform.OS === 'ios') {
    return {
      status: PermissionStatus.GRANTED,
      canAskAgain: false,
    };
  }
  
  // On Android, we use media library permission as a proxy for storage
  if (Platform.OS === 'android') {
    const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
    return {
      status: status as PermissionStatus,
      canAskAgain,
    };
  }
  
  return {
    status: PermissionStatus.UNDETERMINED,
    canAskAgain: true,
  };
}

async function checkMicrophonePermission(): Promise<PermissionResult> {
  const { status, canAskAgain } = await ExpoPermissions.getAsync(ExpoPermissions.AUDIO_RECORDING);
  return {
    status: status as PermissionStatus,
    canAskAgain,
  };
}

// Individual permission requesters
async function requestCameraPermission(): Promise<PermissionResult> {
  const { status, canAskAgain } = await Camera.requestCameraPermissionsAsync();
  return {
    status: status as PermissionStatus,
    canAskAgain,
  };
}

async function requestLocationPermission(): Promise<PermissionResult> {
  const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
  return {
    status: status as PermissionStatus,
    canAskAgain,
  };
}

async function requestMediaLibraryPermission(): Promise<PermissionResult> {
  const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
  return {
    status: status as PermissionStatus,
    canAskAgain,
  };
}

async function requestNotificationsPermission(): Promise<PermissionResult> {
  const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
  return {
    status: status as PermissionStatus,
    canAskAgain,
  };
}

async function requestStoragePermission(): Promise<PermissionResult> {
  // On iOS, we don't need explicit storage permission
  if (Platform.OS === 'ios') {
    return {
      status: PermissionStatus.GRANTED,
      canAskAgain: false,
    };
  }
  
  // On Android, we use media library permission as a proxy for storage
  if (Platform.OS === 'android') {
    const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
    return {
      status: status as PermissionStatus,
      canAskAgain,
    };
  }
  
  return {
    status: PermissionStatus.UNDETERMINED,
    canAskAgain: true,
  };
}

async function requestMicrophonePermission(): Promise<PermissionResult> {
  const { status, canAskAgain } = await ExpoPermissions.askAsync(ExpoPermissions.AUDIO_RECORDING);
  return {
    status: status as PermissionStatus,
    canAskAgain,
  };
} 