import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CommonColors } from '../../constants/Colors';
import WebViewPDFReader from './WebViewPDFReader';

// Define props interface
export interface PDFReaderProps {
  uri: string;
  bookId: string;
  onLoadComplete?: (numberOfPages: number, filePath: string) => void;
  onPageChanged?: (page: number, numberOfPages: number) => void;
  onError?: (error: Error) => void;
  initialPage?: number;
}

/**
 * A platform-specific PDF reader component
 * Uses WebView-based PDF reader for all platforms
 */
const PDFReader: React.FC<PDFReaderProps> = (props) => {
  // Validate props
  if (!props.uri) {
    const error = new Error('PDF URL is missing or invalid');
    if (props.onError) props.onError(error);
    return (
      <View style={styles.webContainer}>
        <Text style={styles.webMessage}>
          Terjadi kesalahan saat memuat PDF
        </Text>
        <Text style={styles.webSubMessage}>
          URL PDF tidak valid atau kosong
        </Text>
        <TouchableOpacity 
          style={[styles.downloadButton, styles.backButton]}
          onPress={() => {
            if (props.onError) props.onError(error);
          }}
        >
          <Text style={styles.downloadButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // For web platform, return a simple message component
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <Text style={styles.webMessage}>
          Fitur pembaca PDF tidak tersedia di versi web.
        </Text>
        <Text style={styles.webSubMessage}>
          Silakan unduh aplikasi untuk pengalaman membaca yang lebih baik.
        </Text>
        {props.uri.startsWith('http') && (
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={() => {
              // Open the PDF in a new tab for download
              window.open(props.uri, '_blank');
            }}
          >
            <Text style={styles.downloadButtonText}>Unduh PDF</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.downloadButton, styles.backButton]}
          onPress={() => {
            if (props.onError) props.onError(new Error('PDF not supported on web'));
          }}
        >
          <Text style={styles.downloadButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // For native platforms, use the WebView-based reader
  try {
    return <WebViewPDFReader {...props} />;
  } catch (error) {
    console.error('Error rendering WebViewPDFReader:', error);
    // Show error UI
    return (
      <View style={styles.webContainer}>
        <Text style={styles.webMessage}>
          Terjadi kesalahan saat memuat pembaca PDF
        </Text>
        <Text style={styles.webSubMessage}>
          {error instanceof Error ? error.message : 'Unknown error'}
        </Text>
        <TouchableOpacity 
          style={[styles.downloadButton, styles.backButton]}
          onPress={() => {
            if (props.onError) props.onError(error instanceof Error ? error : new Error('Failed to load PDF reader'));
          }}
        >
          <Text style={styles.downloadButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: CommonColors.gray900,
  },
  webSubMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: CommonColors.gray600,
  },
  downloadButton: {
    backgroundColor: CommonColors.primary,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: CommonColors.gray500,
  },
  downloadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PDFReader; 