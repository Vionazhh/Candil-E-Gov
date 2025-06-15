/**
 * Error boundary component for handling application errors gracefully
 * Catches JavaScript errors in the component tree and displays a fallback UI
 */
import { CommonColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { AppError, ErrorCode } from '@/types/errors/AppError';
import { Ionicons } from '@expo/vector-icons';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Props for the ErrorBoundary component
 */
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * State for the ErrorBoundary component
 */
interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in the child component tree
 * and display a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  /**
   * Static method to update state when an error occurs
   * @param error The error that was thrown
   * @returns New state with error information
   */
  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  /**
   * Lifecycle method called when an error occurs
   * @param error The error that was thrown
   * @param errorInfo Information about the component stack
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  /**
   * Reset the error state to recover from the error
   */
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI provided via props
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Format the error
      let errorMessage = 'An unexpected error occurred';
      let errorCode = ErrorCode.UNKNOWN_ERROR;
      
      if (this.state.error instanceof AppError) {
        errorMessage = this.state.error.message;
        errorCode = this.state.error.code;
      } else if (this.state.error) {
        errorMessage = this.state.error.message || errorMessage;
      }
      
      // Default fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name="alert-circle-outline" 
              size={60} 
              color={CommonColors.error} 
            />
          </View>
          
          <Text style={styles.title}>Oops, Something Went Wrong</Text>
          <Text style={styles.subtitle}>We&apos;re sorry for the inconvenience.</Text>
          
          <View style={styles.errorContainer}>
            <Text style={styles.errorCode}>[{errorCode}]</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={this.resetError} 
            activeOpacity={0.7}
          >
            <Ionicons 
              name="refresh-outline" 
              size={16} 
              color={CommonColors.white}
              style={styles.buttonIcon} 
            />
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * Styles for the ErrorBoundary component
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: CommonColors.white,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    marginBottom: 10,
    color: CommonColors.gray900,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    marginBottom: 20,
    color: CommonColors.gray700,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: CommonColors.gray100,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  errorCode: {
    fontSize: Typography.sizes.xs,
    color: CommonColors.gray500,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  errorText: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray800,
    fontFamily: 'monospace',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CommonColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: CommonColors.white,
    fontSize: Typography.sizes.base,
    fontWeight: '500',
  },
  buttonIcon: {
    marginRight: 8,
  },
}); 