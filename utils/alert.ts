/**
 * Alert utilities for displaying various types of alert dialogs
 * Provides consistent alert display with platform-specific adjustments
 */
import { AppError } from '@/types/errors/AppError';
import { Alert, AlertButton, Platform } from 'react-native';

/**
 * Alert type definitions
 */
type AlertType = 'success' | 'error' | 'warning' | 'info';

/**
 * Common options for alert dialogs
 */
interface AlertOptions {
  title?: string;
  message: string;
  buttons?: AlertButton[];
  cancelable?: boolean;
}

/**
 * Default titles for different alert types
 */
const DEFAULT_TITLES: Record<AlertType, string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Information',
};

/**
 * Default OK button for alerts
 */
const DEFAULT_OK_BUTTON: AlertButton = {
  text: 'OK',
  style: 'default',
};

/**
 * Shows an alert dialog with the given options
 * @param options Alert configuration options
 */
export function showAlert({
  title = 'Alert',
  message,
  buttons = [DEFAULT_OK_BUTTON],
  cancelable = true,
}: AlertOptions): void {
  Alert.alert(title, message, buttons, { cancelable });
}

/**
 * Shows a success alert dialog
 * @param title Optional custom title (default: "Success")
 * @param message Alert message
 * @param buttons Optional custom buttons
 */
export function showDialogSuccess(
  title: string = DEFAULT_TITLES.success,
  message: string,
  buttons?: AlertButton[]
): void {
  showAlert({
    title,
    message,
    buttons,
  });
}

/**
 * Shows an error alert dialog
 * @param title Optional custom title (default: "Error")
 * @param message Alert message
 * @param buttons Optional custom buttons
 */
export function showDialogError(
  title: string = DEFAULT_TITLES.error,
  message: string,
  buttons?: AlertButton[]
): void {
  showAlert({
    title,
    message,
    buttons,
  });
}

/**
 * Shows a warning alert dialog
 * @param title Optional custom title (default: "Warning")
 * @param message Alert message
 * @param buttons Optional custom buttons
 */
export function showDialogWarning(
  title: string = DEFAULT_TITLES.warning,
  message: string,
  buttons?: AlertButton[]
): void {
  showAlert({
    title,
    message,
    buttons,
  });
}

/**
 * Shows an info alert dialog
 * @param title Optional custom title (default: "Information")
 * @param message Alert message
 * @param buttons Optional custom buttons
 */
export function showDialogInfo(
  title: string = DEFAULT_TITLES.info,
  message: string,
  buttons?: AlertButton[]
): void {
  showAlert({
    title,
    message,
    buttons,
  });
}

/**
 * Shows an alert dialog for an AppError
 * @param error Error object or error message string
 */
export function showErrorDialog(error: AppError | Error | string): void {
  const message = typeof error === 'string' 
    ? error 
    : error.message || 'An unknown error occurred';
    
  const title = error instanceof AppError 
    ? error.name
    : DEFAULT_TITLES.error;
    
  showDialogError(title, message);
}

/**
 * Shows a confirmation dialog with OK and Cancel buttons
 * @param title Dialog title
 * @param message Dialog message
 * @param onConfirm Function to call when user confirms
 * @param onCancel Optional function to call when user cancels
 */
export function showConfirmDialog(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
): void {
  const buttons: AlertButton[] = [
    {
      text: 'Cancel',
      style: 'cancel',
      onPress: onCancel,
    },
    {
      text: 'OK',
      onPress: onConfirm,
    },
  ];
  
  // On Android, reverse the button order
  if (Platform.OS === 'android') {
    buttons.reverse();
  }
  
  showAlert({
    title,
    message,
    buttons,
  });
}
