/**
 * Permission Request Component
 * A reusable UI component for requesting app permissions
 */
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Hooks & Utils
import { usePermission } from '@/hooks/usePermissions';
import { PermissionStatus, PermissionType } from '@/utils/permissions';

// Constants
import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';

// Component Props
interface PermissionRequestProps {
  type: PermissionType;
  title: string;
  message: string;
  rationale: string;
  icon: string;
  onGranted?: () => void;
  onDenied?: () => void;
  autoRequest?: boolean;
}

/**
 * Maps permission types to friendly names
 */
const permissionNames: Record<PermissionType, string> = {
  [PermissionType.CAMERA]: 'Camera',
  [PermissionType.LOCATION]: 'Location',
  [PermissionType.MEDIA_LIBRARY]: 'Media Library',
  [PermissionType.NOTIFICATIONS]: 'Notifications',
  [PermissionType.STORAGE]: 'Storage',
  [PermissionType.MICROPHONE]: 'Microphone',
};

/**
 * PermissionRequest Component
 * Displays a UI for requesting a specific permission
 */
export const PermissionRequest: React.FC<PermissionRequestProps> = ({
  type,
  title,
  message,
  rationale,
  icon,
  onGranted,
  onDenied,
  autoRequest = false,
}) => {
  // Use the permission hook
  const {
    status,
    isGranted,
    loading,
    canAskAgain,
    requestPermission,
    requestWithFallback,
  } = usePermission({
    type,
    autoRequest,
    onGranted,
    onDenied,
  });

  // Call onGranted when permission is granted
  useEffect(() => {
    if (isGranted && onGranted) {
      onGranted();
    }
  }, [isGranted, onGranted]);

  // Handle permission request
  const handleRequestPermission = async () => {
    // If we can ask directly, do so
    if (canAskAgain) {
      await requestPermission();
    } else {
      // Otherwise use the fallback that will direct to settings
      await requestWithFallback(rationale);
    }
  };

  // If permission is granted, don't show anything
  if (isGranted) {
    return null;
  }

  // If still loading, show a loading indicator
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={CommonColors.primary} />
        <Text style={styles.loadingText}>Checking permission...</Text>
      </View>
    );
  }

  // Determine the appropriate button text based on permission status
  const getButtonText = () => {
    if (status === PermissionStatus.DENIED && !canAskAgain) {
      return 'Open Settings';
    }
    return `Allow ${permissionNames[type]} Access`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={48} color={CommonColors.primary} />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleRequestPermission}
      >
        <Text style={styles.buttonText}>{getButtonText()}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.skipButton}
        onPress={onDenied}
      >
        <Text style={styles.skipButtonText}>Not Now</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * MultiPermissionRequest Component
 * Requests multiple permissions in sequence
 */
interface MultiPermissionRequestProps {
  permissions: Array<{
    type: PermissionType;
    title: string;
    message: string;
    rationale: string;
    icon: string;
  }>;
  onAllGranted?: () => void;
  onAnyDenied?: () => void;
}

export const MultiPermissionRequest: React.FC<MultiPermissionRequestProps> = ({
  permissions,
  onAllGranted,
  onAnyDenied,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [grantedPermissions, setGrantedPermissions] = React.useState<PermissionType[]>([]);

  // Handle when a permission is granted
  const handlePermissionGranted = (type: PermissionType) => {
    const newGrantedPermissions = [...grantedPermissions, type];
    setGrantedPermissions(newGrantedPermissions);
    
    // Move to the next permission
    if (currentIndex < permissions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All permissions have been processed
      if (newGrantedPermissions.length === permissions.length) {
        // All permissions were granted
        onAllGranted?.();
      } else {
        // Some permissions were denied
        onAnyDenied?.();
      }
    }
  };

  // Handle when a permission is denied
  const handlePermissionDenied = () => {
    // Move to the next permission
    if (currentIndex < permissions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All permissions have been processed, but not all were granted
      onAnyDenied?.();
    }
  };

  // If all permissions have been processed, don't show anything
  if (currentIndex >= permissions.length) {
    return null;
  }

  // Get the current permission to request
  const currentPermission = permissions[currentIndex];

  return (
    <PermissionRequest
      type={currentPermission.type}
      title={currentPermission.title}
      message={currentPermission.message}
      rationale={currentPermission.rationale}
      icon={currentPermission.icon}
      onGranted={() => handlePermissionGranted(currentPermission.type)}
      onDenied={handlePermissionDenied}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: CommonColors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    margin: Spacing.md,
    alignItems: 'center',
    shadowColor: CommonColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: CommonColors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: CommonColors.gray900,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.sizes.base,
    color: CommonColors.gray700,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  button: {
    backgroundColor: CommonColors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: CommonColors.white,
    fontWeight: '600',
    fontSize: Typography.sizes.base,
  },
  skipButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  skipButtonText: {
    color: CommonColors.gray600,
    fontSize: Typography.sizes.sm,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.base,
    color: CommonColors.gray600,
  },
}); 