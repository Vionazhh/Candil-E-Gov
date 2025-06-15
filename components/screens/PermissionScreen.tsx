/**
 * Permission Screen Component
 * A screen for requesting app permissions during startup or when needed
 */
import React, { useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Components
import { MultiPermissionRequest } from '@/components/ui/PermissionRequest';

// Hooks & Utils
import { PermissionType } from '@/utils/permissions';

// Constants
import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';

// Component Props
interface PermissionScreenProps {
  onComplete: (allGranted: boolean) => void;
  requiredPermissions?: PermissionType[];
  optionalPermissions?: PermissionType[];
  appName?: string;
  showSkip?: boolean;
}

/**
 * Permission configuration for each permission type
 */
const permissionConfigs = {
  [PermissionType.CAMERA]: {
    title: 'Camera Access',
    message: 'We need camera access to scan QR codes and take photos for book covers.',
    rationale: 'Camera access is needed for scanning QR codes and taking photos.',
    icon: 'camera-outline',
  },
  [PermissionType.LOCATION]: {
    title: 'Location Access',
    message: 'We use your location to find nearby libraries and book events.',
    rationale: 'Location access helps find nearby libraries and book events.',
    icon: 'location-outline',
  },
  [PermissionType.MEDIA_LIBRARY]: {
    title: 'Media Library Access',
    message: 'We need access to your media library to save downloaded books and PDFs.',
    rationale: 'Media library access is needed to save books and PDFs.',
    icon: 'images-outline',
  },
  [PermissionType.NOTIFICATIONS]: {
    title: 'Notifications',
    message: 'Enable notifications to receive updates about book due dates and new releases.',
    rationale: 'Notifications are used for book due dates and new releases.',
    icon: 'notifications-outline',
  },
  [PermissionType.STORAGE]: {
    title: 'Storage Access',
    message: 'We need storage access to save books for offline reading.',
    rationale: 'Storage access is needed for offline reading.',
    icon: 'save-outline',
  },
  [PermissionType.MICROPHONE]: {
    title: 'Microphone Access',
    message: 'Microphone access is needed for voice search and audio notes.',
    rationale: 'Microphone access enables voice search and audio notes.',
    icon: 'mic-outline',
  },
};

/**
 * Permission Screen Component
 * Displays a screen for requesting app permissions
 */
export const PermissionScreen: React.FC<PermissionScreenProps> = ({
  onComplete,
  requiredPermissions = [],
  optionalPermissions = [],
  appName = 'Candil eGov',
  showSkip = true,
}) => {
  const [showingRequired, setShowingRequired] = useState(true);
  const [requiredGranted, setRequiredGranted] = useState(false);
  
  // Format permissions for the MultiPermissionRequest component
  const formatPermissions = (permissions: PermissionType[]) => {
    return permissions.map(type => ({
      type,
      ...permissionConfigs[type],
    }));
  };
  
  // Handle when all required permissions are granted
  const handleRequiredPermissionsGranted = () => {
    setRequiredGranted(true);
    
    // If there are optional permissions, show them next
    if (optionalPermissions.length > 0) {
      setShowingRequired(false);
    } else {
      // Otherwise, we're done
      onComplete(true);
    }
  };
  
  // Handle when any required permission is denied
  const handleRequiredPermissionsDenied = () => {
    // If required permissions are denied, we can't proceed
    onComplete(false);
  };
  
  // Handle when all optional permissions are processed
  const handleOptionalPermissionsComplete = () => {
    // We're done regardless of whether optional permissions were granted
    onComplete(requiredGranted);
  };
  
  // Handle skip button press
  const handleSkip = () => {
    if (showingRequired) {
      // Can't skip required permissions
      onComplete(false);
    } else {
      // Skip optional permissions
      onComplete(requiredGranted);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>{appName}</Text>
        </View>
        
        {/* Title */}
        <Text style={styles.title}>
          {showingRequired ? 'Required Permissions' : 'Optional Permissions'}
        </Text>
        
        {/* Description */}
        <Text style={styles.description}>
          {showingRequired
            ? 'These permissions are required for the app to function properly.'
            : 'These permissions are optional but will enhance your experience.'}
        </Text>
        
        {/* Permissions */}
        <View style={styles.permissionsContainer}>
          {showingRequired ? (
            <MultiPermissionRequest
              permissions={formatPermissions(requiredPermissions)}
              onAllGranted={handleRequiredPermissionsGranted}
              onAnyDenied={handleRequiredPermissionsDenied}
            />
          ) : (
            <MultiPermissionRequest
              permissions={formatPermissions(optionalPermissions)}
              onAllGranted={handleOptionalPermissionsComplete}
              onAnyDenied={handleOptionalPermissionsComplete}
            />
          )}
        </View>
      </ScrollView>
      
      {/* Skip button */}
      {showSkip && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>
              {showingRequired ? 'Exit' : 'Skip'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CommonColors.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    color: CommonColors.primary,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: CommonColors.gray900,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: Typography.sizes.base,
    color: CommonColors.gray700,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  permissionsContainer: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: CommonColors.gray200,
    alignItems: 'center',
  },
  skipButton: {
    padding: Spacing.md,
  },
  skipButtonText: {
    fontSize: Typography.sizes.base,
    color: CommonColors.gray600,
  },
}); 