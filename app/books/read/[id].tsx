import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Platform,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

// Custom Components
import { LibraryHeader } from "@/components/organisms/LibraryHeader";
import TextReader from "@/components/readers/TextReader";
import ErrorScreen from "@/components/screens/ErrorScreen";
import ProgressBar from "@/components/ui/ProgressBar";
import ReaderControls, { ReaderTheme } from "@/components/ui/ReaderControls";

// Hooks
import { useBook } from "@/hooks/useBook";
import useBookProgress from "@/hooks/useBookProgress";
import useReaderSettings from "@/hooks/useReaderSettings";

// Constants & Types
import { CommonColors } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { Book } from "@/types/Book";
import { parseError } from "@/types/errors/AppError";
import { logger } from "@/utils/logger";

// Check if running on web platform
const isWeb = Platform.OS === "web";

// Theme helpers
const getBackgroundColor = (theme: ReaderTheme) => {
  switch (theme) {
    case "dark":
      return "#121212";
    case "sepia":
      return "#f8f1e3";
    case "light":
    default:
      return "#ffffff";
  }
};

const getTextColor = (theme: ReaderTheme) => {
  switch (theme) {
    case "dark":
      return "#e0e0e0";
    case "sepia":
    case "light":
    default:
      return "#333333";
  }
};

// Loading screen component
interface LoadingScreenProps {
  message: string;
  backgroundColor: string;
  textColor: string;
  progress?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message,
  backgroundColor,
  textColor,
  progress,
}) => (
  <SafeAreaView style={[styles.container, { backgroundColor }]}>
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={CommonColors.primary} />
      <Text style={[styles.loadingText, { color: textColor }]}>{message}</Text>
      {progress !== undefined && (
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} />
          <Text style={[styles.progressText, { color: textColor }]}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      )}
    </View>
  </SafeAreaView>
);

const ReadBookScreen = () => {
  // Hooks
  const { getBookById } = useBook();
  const { trackProgress, completeReading, getProgress } = useBookProgress();
  const { settings, updateFontSize, updateTheme, updateLineSpacing } =
    useReaderSettings();

  const { id } = useLocalSearchParams<{ id: string }>();

  // State
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Use refs to prevent infinite loops and race conditions
  const isLoadingRef = useRef(false);
  const currentBookIdRef = useRef<string | null>(null);
  const hasShownCompletionDialog = useRef(false);
  const webViewRef = useRef<WebView>(null);

  // Safe functions that use hooks - properly defined inside the component
  const safeTrackProgress = useCallback(
    (bookId: string, progress: number, page: number) => {
      if (isWeb) {
        console.log("Reading progress tracking not available on web");
        return Promise.resolve();
      }
      return trackProgress(bookId, progress, page);
    },
    [trackProgress]
  );

  const safeGetProgress = useCallback(
    async (bookId: string) => {
      if (isWeb) {
        console.log("Reading progress tracking not available on web");
        return null;
      }
      return getProgress(bookId);
    },
    [getProgress]
  );

  const safeCompleteReading = useCallback(
    async (bookId: string) => {
      if (isWeb) {
        logger.log("Complete reading not available on web");
        return Promise.resolve(false);
      }
      return completeReading(bookId);
    },
    [completeReading]
  );

  // Check if book is a PDF
  const isPdf = useCallback((book: Book | null) => {
    if (!book) return false;
    const result = 
      book.fileType === "pdf" ||
      (book.fileUrl && book.fileUrl.endsWith(".pdf")) ||
      (book.pdfUrl && book.pdfUrl.endsWith(".pdf"));
    
    return result;
  }, []);

  // Handle back button press
  const handleBackPress = useCallback(() => {
    logger.log("Back button pressed, readingProgress:", readingProgress);
    
    if (readingProgress < 0.9) {
      if (!isWeb) {
        Alert.alert(
          "Keluar dari Membaca",
          "Apakah Anda yakin ingin keluar? Progres membaca Anda akan disimpan.",
          [
            {
              text: "Batal",
              style: "cancel",
            },
            {
              text: "Keluar",
              style: "destructive",
              onPress: () => {
                router.back();
              },
            },
          ]
        );
        return true;
      }
    }
    
    router.back();
    return true;
  }, [readingProgress]);

  // Handle retry when loading fails
  const handleRetry = useCallback(() => {
    logger.log("Retry button pressed, resetting state");
    setError(null);
    setLoading(true);
    isLoadingRef.current = false; // Reset loading ref
  }, []);

  // Reset the screen when book ID changes
  useEffect(() => {
    if (id && id !== currentBookIdRef.current) {
      logger.log("Book ID changed, resetting screen state. New ID:", id);
      currentBookIdRef.current = id;
      setLoading(true);
      setError(null);
      setReadingProgress(0);
      setCurrentPage(1);
      setTotalPages(1);
      setBook(null);
      setPdfUrl(null);
      isLoadingRef.current = false;
      hasShownCompletionDialog.current = false;
    }
  }, [id]);

  // Fetch book data - Fixed to prevent infinite loops
  useEffect(() => {
    const fetchBook = async () => {
      if (!id || isLoadingRef.current) {
        return;
      }

      // Prevent multiple simultaneous fetches
      isLoadingRef.current = true;
      
      try {
        setLoading(true);
        setError(null);
        
        logger.log(`Calling getBookById for book ID: ${id}`);
        const startTime = Date.now();
        
        const bookData = await getBookById(id);
        
        // Check if book ID changed during fetch
        if (currentBookIdRef.current !== id) {
          logger.log("Book ID changed during fetch, aborting");
          return;
        }
        
        setBook(bookData);

        // Set total pages based on content or default for PDF
        if (!isPdf(bookData)) {
          const estimatedPages = Math.ceil((bookData?.content?.length || 0) / 1000) || 1;
          logger.log(`Text book estimated pages: ${estimatedPages}`);
          setTotalPages(estimatedPages);
        }

        // Get saved reading progress
        try {
          if (!isWeb) {
            logger.log("Attempting to get saved reading progress");
            const savedProgress = await safeGetProgress(id);
            if (savedProgress && currentBookIdRef.current === id) {
              logger.log("Saved progress found:", savedProgress);
              setReadingProgress(savedProgress.progress);
              setCurrentPage(savedProgress.page || 1);
            } else {
              logger.log("No saved progress found");
            }
          }
        } catch (progressError) {
          logger.error("Failed to load reading progress:", progressError);
          // Don't fail the whole operation for this
        }

        // Handle PDF viewing
        const isBookPdf = isPdf(bookData);
        logger.log("Is book PDF:", isBookPdf);
        
        if (isBookPdf && currentBookIdRef.current === id) {
          try {
            // Prioritize pdfUrl over fileUrl
            const pdfSource = bookData.pdfUrl || bookData.fileUrl;
            logger.log("PDF source URL:", pdfSource ? `${pdfSource.substring(0, 100)}...` : "null");

            if (pdfSource) {
              // Create Google Docs Viewer URL
              const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfSource)}&embedded=true`;
              logger.log("Google Docs Viewer URL:", googleDocsViewerUrl);
              setPdfUrl(googleDocsViewerUrl);
            } else {
              const errorMsg = "No PDF file URL available for this book";
              logger.error(errorMsg);
              if (currentBookIdRef.current === id) {
                setError(errorMsg);
              }
            }
          } catch (err) {
            logger.error("PDF handling error:", err);
            if (currentBookIdRef.current === id) {
              const errorMsg = "Could not load PDF file. Please check your connection.";
              setError(errorMsg);
            }
          }
        }

        logger.log("=== FETCH BOOK SUCCESS ===");
        
      } catch (error) {
        if (currentBookIdRef.current === id) {
          const appError = parseError(error);
          logger.error("=== FETCH BOOK ERROR ===");
          logger.error("Error message:", appError.message);
          logger.error("Original error:", error);
          
          setError(appError.message);
        }
      } finally {
        if (currentBookIdRef.current === id) {
          setLoading(false);
        }
        isLoadingRef.current = false;
        logger.log("=== FETCH BOOK END ===");
      }
    };

    // Only fetch if we have an ID, not currently loading, and no book data
    if (id && !isLoadingRef.current && (!book || book.id !== id)) {
      fetchBook();
    }
  }, [
    id,
    book,
    getBookById,
    isPdf,
    safeGetProgress,
    isWeb,
  ]);

  // Add back button handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => backHandler.remove();
  }, [handleBackPress]);

  // Handle text scroll progress
  const handleScroll = useCallback(
    (progress: number, page: number, pages: number) => {
      logger.log(`Scroll progress: ${progress}, page: ${page}/${pages}`);
      
      setReadingProgress(progress);
      setCurrentPage(page);
      setTotalPages(pages);

      // Track reading progress
      try {
        if (!isWeb && id) {
          safeTrackProgress(id, progress, page);
        }
      } catch (error) {
        logger.error("Failed to track progress:", error);
      }

      // If reached end of book (95% or more), prompt for completion
      if (progress >= 0.95 && readingProgress < 0.95 && !hasShownCompletionDialog.current) {
        hasShownCompletionDialog.current = true;
        logger.log("Book completion threshold reached, showing completion dialog");
        Alert.alert(
          "Selesaikan membaca dan kembalikan buku?",
          "Anda telah mencapai akhir buku ini.",
          [
            { 
              text: "Lanjut Membaca", 
              style: "cancel",
              onPress: () => {
                hasShownCompletionDialog.current = false;
              }
            },
            {
              text: "Selesai & Kembalikan",
              style: "default",
              onPress: async () => {
                try {
                  if (!isWeb && id) {
                    logger.log("Completing book reading");
                    await safeCompleteReading(id);
                  }
                  router.back();
                } catch (error) {
                  logger.error("Failed to complete reading:", error);
                  router.back();
                }
              },
            },
          ]
        );
      }
    },
    [id, readingProgress, safeTrackProgress, safeCompleteReading, isWeb]
  );

  // Handle PDF page change
  const handlePdfPageChanged = useCallback(
    (page: number, totalPages: number) => {
      const progress = page / totalPages;
      logger.log(`PDF page changed: ${page}/${totalPages}, progress: ${progress}`);
      
      setCurrentPage(page);
      setTotalPages(totalPages);
      setReadingProgress(progress);

      // Track reading progress
      try {
        if (!isWeb && id) {
          safeTrackProgress(id, progress, page);
        }
      } catch (error) {
        logger.error("Failed to track PDF progress:", error);
      }

      // If on last page, prompt for completion
      if (page === totalPages && !hasShownCompletionDialog.current) {
        hasShownCompletionDialog.current = true;
        logger.log("PDF last page reached, showing completion dialog");
        Alert.alert(
          "Selesaikan membaca dan kembalikan buku?",
          "Anda telah mencapai akhir buku ini.",
          [
            { 
              text: "Lanjut Membaca", 
              style: "cancel",
              onPress: () => {
                hasShownCompletionDialog.current = false;
              }
            },
            {
              text: "Selesai & Kembalikan",
              style: "default",
              onPress: async () => {
                try {
                  if (!isWeb && id) {
                    logger.log("Completing PDF reading");
                    await safeCompleteReading(id);
                  }
                  router.back();
                } catch (error) {
                  logger.error("Failed to complete reading:", error);
                  router.back();
                }
              },
            },
          ]
        );
      }
    },
    [id, safeTrackProgress, safeCompleteReading, isWeb]
  );

  // Handle toggling bookmark
  const handleToggleBookmark = useCallback(() => {
    logger.log("Bookmark toggled:", !isBookmarked);
    setIsBookmarked((prev) => !prev);
    // Implement actual bookmark functionality here
  }, [isBookmarked]);

  // Handle sharing
  const handleShare = useCallback(async () => {
    if (book) {
      try {
        logger.log("Sharing book:", book.title);
        await Share.share({
          title: book.title,
          message: `Check out this book: ${book.title} by ${
            book.author?.name || "Unknown"
          }`,
        });
      } catch (error) {
        logger.error("Error sharing:", error);
      }
    }
  }, [book]);

  // Handle WebView load end
  const handleWebViewLoadEnd = useCallback(() => {
    logger.log("WebView load ended");
    setLoading(false);
  }, []);

  // Handle WebView error
  const handleWebViewError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    logger.error("WebView error:", nativeEvent);
    setError(`Failed to load PDF: ${nativeEvent.description}`);
  }, []);

  // Render the appropriate reader based on book type
  const renderReader = () => {
    const backgroundColor = getBackgroundColor(settings.theme);
    const textColor = getTextColor(settings.theme);

    logger.log("Rendering reader - book type:", isPdf(book) ? "PDF" : "Text");

    // For PDF files
    if (isPdf(book)) {
      // If loading
      if (loading && !error) {
        logger.log("Showing PDF loading screen");
        return (
          <LoadingScreen
            message="Memuat PDF..."
            backgroundColor={backgroundColor}
            textColor={textColor}
          />
        );
      }

      // If error
      if (error) {
        logger.log("Showing PDF error screen");
        return (
          <ErrorScreen
            title="Gagal memuat PDF"
            message={error}
            icon="document-outline"
            action={{
              label: "Coba Lagi",
              onPress: handleRetry,
            }}
          />
        );
      }

      // If PDF URL is available
      if (pdfUrl) {
        logger.log("Rendering PDF in WebView with URL:", pdfUrl);
        return (
          <View style={styles.webViewContainer}>
            <WebView
              ref={webViewRef}
              source={{ uri: pdfUrl }}
              style={styles.webView}
              onLoadEnd={handleWebViewLoadEnd}
              onError={handleWebViewError}
              startInLoadingState={true}
              renderLoading={() => (
                <LoadingScreen
                  message="Memuat PDF..."
                  backgroundColor={backgroundColor}
                  textColor={textColor}
                />
              )}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              originWhitelist={['*']}
            />
          </View>
        );
      }

      // Fallback if no URI but no error (should not happen)
      logger.log("PDF fallback loading screen");
      return (
        <LoadingScreen
          message="Menyiapkan PDF..."
          backgroundColor={backgroundColor}
          textColor={textColor}
        />
      );
    }

    // For text content
    logger.log("Rendering text reader");
    return (
      <TextReader
        content={book?.content || ""}
        theme={settings.theme}
        fontSize={settings.fontSize}
        lineHeight={settings.lineHeight}
        onScroll={handleScroll}
        initialPage={currentPage}
      />
    );
  };

  // Log current state for debugging
  logger.log("Current component state:", {
    loading,
    error,
    bookId: book?.id,
    bookTitle: book?.title,
    isPdfBook: isPdf(book),
    pdfUrl,
    isLoadingRef: isLoadingRef.current
  });

  // If loading book
  if (loading && !book) {
    logger.log("Showing main loading screen");
    return (
      <LoadingScreen
        message="Memuat buku..."
        backgroundColor={CommonColors.white}
        textColor={CommonColors.gray900}
      />
    );
  }

  // If error loading book
  if (error && !book) {
    logger.log("Showing main error screen");
    return (
      <ErrorScreen
        title="Gagal memuat buku"
        message={error}
        icon="book-outline"
        action={{
          label: "Coba Lagi",
          onPress: handleRetry,
        }}
      />
    );
  }

  // Main render
  logger.log("Rendering main screen");
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor(settings.theme) },
      ]}
      edges={["top"]}
    >
      <StatusBar style="auto" />
      <LibraryHeader
        title={book?.title || ""}
        subtitle={book?.author?.name || ""}
        onBackPress={handleBackPress}
        onBookmarkPress={handleToggleBookmark}
        onSharePress={handleShare}
        isBookmarked={isBookmarked}
        backgroundColor={getBackgroundColor(settings.theme)}
        textColor={getTextColor(settings.theme)}
      />

      <View style={styles.readerContainer}>{renderReader()}</View>

      <ReaderControls
        onIncreaseFontSize={() => updateFontSize(1)}
        onDecreaseFontSize={() => updateFontSize(-1)}
        onIncreaseLineSpacing={() => updateLineSpacing(0.1)}
        onDecreaseLineSpacing={() => updateLineSpacing(-0.1)}
        onThemeChange={(theme) => updateTheme(theme)}
        currentTheme={settings.theme}
        visible={!isPdf(book)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CommonColors.white,
  },
  readerContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: Typography.sizes.base,
    color: CommonColors.gray900,
    textAlign: "center",
  },
  progressContainer: {
    width: "80%",
    marginTop: 16,
  },
  progressText: {
    marginTop: 8,
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray600,
    textAlign: "center",
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webView: {
    flex: 1,
  },
});

export default ReadBookScreen;