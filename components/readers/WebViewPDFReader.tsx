import { logger } from '@/utils/logger';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import WebView from 'react-native-webview';
import { CommonColors } from '../../constants/Colors';

interface WebViewPDFReaderProps {
  uri: string;
  bookId: string;
  onLoadComplete?: (numberOfPages: number, filePath: string) => void;
  onPageChanged?: (page: number, numberOfPages: number) => void;
  onError?: (error: Error) => void;
  initialPage?: number;
}

/**
 * A PDF reader component based on WebView
 */
const WebViewPDFReader: React.FC<WebViewPDFReaderProps> = ({
  uri,
  bookId,
  onLoadComplete,
  onPageChanged,
  onError,
  initialPage = 1,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);
  const { width, height } = Dimensions.get('window');
  const [renderedOnce, setRenderedOnce] = useState(false);

  useEffect(() => {
    setRenderedOnce(true);
  }, []);

  // Create a valid URI for the PDF
  const pdfUri = (() => {
    // If none of the above, return the original URI and hope for the best
    const ur = `https://docs.google.com/viewer?url=${encodeURIComponent(uri)}&embedded=true`;
    logger.log("uriLog:", ur)
    return ur
  })();

  // Handle load start
  const handleLoadStart = () => {
    setIsLoading(true);
    setErrorMessage(null);
  };

  // Handle load end
  const handleLoadEnd = () => {
    setIsLoading(false);
    if (onLoadComplete) {
      // Since we can't get the actual number of pages from WebView,
      // we'll pass 1 as a placeholder
      onLoadComplete(10, uri);
    }
  };

  // Handle error
  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    setIsLoading(false);
    setErrorMessage(`Failed to load PDF: ${nativeEvent.description}`);
    if (onError) onError(new Error(nativeEvent.description));
  };

  // Inject JavaScript to track scroll position (simulate page changes)
  const INJECTED_JAVASCRIPT = `
    window.addEventListener('scroll', () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'scroll',
        data: { scrollPercentage }
      }));
    });
    true;
  `;

  // Handle messages from WebView
  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'scroll' && onPageChanged) {
        // Simulate page change based on scroll percentage
        const { scrollPercentage } = message.data;
        // Assuming 10 "virtual" pages for progress tracking
        const currentVirtualPage = Math.ceil(scrollPercentage * 10);
        onPageChanged(currentVirtualPage, 10);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // If there's an error
  if (errorMessage) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error</Text>
        <Text style={styles.errorSubtext}>{errorMessage}</Text>
        <TouchableOpacity 
          style={[styles.button, styles.backButton]}
          onPress={() => {
            if (onError) onError(new Error(errorMessage));
          }}
        >
          <Text style={styles.buttonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: pdfUri }}
        style={styles.webView}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        injectedJavaScript={INJECTED_JAVASCRIPT}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={CommonColors.primary} />
            <Text style={styles.loadingText}>Memuat PDF...</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    color: CommonColors.gray800,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: CommonColors.danger,
  },
  errorSubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: CommonColors.gray600,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
    marginTop: 10,
  },
  backButton: {
    backgroundColor: CommonColors.gray500,
  },
  buttonText: {
    color: CommonColors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default WebViewPDFReader; 