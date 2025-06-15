import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

// Components
import { LibraryHeader } from "@/components/organisms/LibraryHeader";
import { Ionicons } from "@expo/vector-icons";

// Types, Constants & Hooks
import { CommonColors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import { useBorrows } from "@/hooks/useBorrows";
import { Borrow } from "@/services";
import bookService from "@/services/BookService";
import { Book } from "@/types/Book";
import { parseError } from "@/types/errors/AppError";
import { router, useLocalSearchParams } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Loading state component
const LoadingView = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={CommonColors.primary} />
    <Text style={styles.loadingText}>Memuat detail buku...</Text>
  </View>
);

// Error state component
interface ErrorViewProps {
  message: string;
  onRetry: () => void;
}

const ErrorView = ({ message, onRetry }: ErrorViewProps) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{message}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>Kembali</Text>
    </TouchableOpacity>
  </View>
);

// Star Rating component
interface StarRatingProps {
  rating?: number;
  size?: number;
  color?: string;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
}

const StarRating = ({
  rating = 0,
  size = 20,
  color = CommonColors.primary,
  editable = false,
  onRatingChange,
}: StarRatingProps) => {
  const totalStars = 5;
  const handleStarPress = (selectedRating: number) => {
    if (editable && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  return (
    <View style={styles.starsContainer}>
      {Array.from({ length: totalStars }).map((_, index) => (
        <TouchableOpacity
          key={index}
          disabled={!editable}
          onPress={() => handleStarPress(index + 1)}
          style={styles.starButton}
        >
          <Ionicons
            name={index < rating ? "star" : "star-outline"}
            size={size}
            color={color}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Dynamic Title component to adjust font size based on content length
const DynamicTitle = ({ title }: { title: string }) => {
  // Calculate font size based on title length
  const getFontSize = () => {
    if (!title) return Typography.sizes.lg;
    if (title.length > 60) return Typography.sizes.md - 2;
    if (title.length > 40) return Typography.sizes.md;
    if (title.length > 20) return Typography.sizes.lg - 1;
    return Typography.sizes.lg;
  };
  
  // Adjust for title words to be centered
  const adjustTitleDisplay = (title: string) => {
    // If the title is short, display it as is
    if (title.length <= 20) return title;
    
    // For longer titles, ensure clean display
    const words = title.split(' ');
    if (words.length <= 3) return title;
    
    // If more than 3 words, keep first 3 and add ellipsis
    return `${words.slice(0, 3).join(' ')}...`;
  };

  return (
    <Text style={[styles.title, { fontSize: getFontSize() }]} numberOfLines={1}>
      {adjustTitleDisplay(title)}
    </Text>
  );
};

// Extend Book type to include readCount
export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [currentBorrow, setCurrentBorrow] = useState<Borrow | null>(null);

  // Use borrows hook for borrowing functionality
  const {
    borrowBook,
    isBookAvailable,
    getBorrowsByBookId,
    isLoading: isBorrowLoading,
    error: borrowError,
  } = useBorrows();

  // Fetch book details
  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        setError("Book ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const bookData = await bookService.getBookById(id);
        // Add dummy readCount since it's not in the API response
        setBook({ ...bookData, readCount: 22 });

        // Check if book is currently borrowed
        const borrows = await getBorrowsByBookId(id);
        const activeBorrow = borrows.find(
          (borrow) => borrow.status === "active"
        );
        if (activeBorrow) {
          setCurrentBorrow(activeBorrow);
        }
      } catch (error) {
        const appError = parseError(error);
        setError(appError.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [id, getBorrowsByBookId]);

  // Handle back button press
  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }, []);

  // Handle borrow button press
  const handleBorrowPress = useCallback(async () => {
    if (!book || !id) {
      Alert.alert("Error", "Informasi buku tidak lengkap");
      return;
    }

    try {
      // Check if book is available
      const available = await isBookAvailable(id);
      if (!available) {
        Alert.alert(
          "Buku Tidak Tersedia",
          "Buku ini sedang dipinjam oleh pengguna lain."
        );
        return;
      }

      Alert.alert(
        "Pinjam Buku",
        `Anda yakin ingin meminjam buku "${book?.title}"?\n\nBuku harus dikembalikan dalam 7 hari.`,
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Pinjam",
            onPress: async () => {
              try {
                setIsLoading(true);
                await borrowBook(id);

                // Get updated borrow data
                const borrows = await getBorrowsByBookId(id);
                const activeBorrow = borrows.find(
                  (borrow) => borrow.status === "active"
                );
                if (activeBorrow) {
                  setCurrentBorrow(activeBorrow);
                }

                Alert.alert(
                  "Berhasil",
                  "Buku berhasil dipinjam! Silahkan kembalikan dalam 7 hari.",
                  [{ text: "OK" }]
                );
              } catch (error) {
                const appError = parseError(error);
                Alert.alert(
                  "Gagal",
                  `Tidak dapat meminjam buku: ${appError.message}`
                );
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      const appError = parseError(error);
      Alert.alert(
        "Error",
        `Gagal memeriksa ketersediaan buku: ${appError.message}`
      );
    }
  }, [book, id, isBookAvailable, borrowBook, getBorrowsByBookId]);

  // Format date to Indonesian format
  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // Handle read button press
  const handleReadPress = useCallback(() => {
    if (id) {
      router.push(`/books/read/${id}`);
    } else {
      Alert.alert("Error", "Tidak dapat memuat buku");
    }
  }, [id]);

  // Handle audiobook button press
  const handleAudiobookPress = useCallback(() => {
    if (id) {
      router.push(`/books/listen/${id}`);
    } else {
      Alert.alert("Error", "Tidak dapat memuat audiobook");
    }
  }, [id]);

  // Handle save rating
  const handleSaveRating = useCallback(() => {
    if (userRating > 0) {
      Alert.alert(
        "Rating",
        `Terima kasih telah memberikan rating ${userRating} bintang!`
      );
      setHasRated(true);
    } else {
      Alert.alert("Error", "Silakan memberikan rating terlebih dahulu");
    }
  }, [userRating]);

  // Handle view borrow details
  const handleViewBorrowDetails = useCallback(() => {
    if (currentBorrow && currentBorrow.id) {
      router.push(`/books/borrow/${currentBorrow.id}`);
    }
  }, [currentBorrow]);

  // Render loading state
  if (isLoading || isBorrowLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LibraryHeader title="Detail Buku" onBackPress={handleBackPress} />
        <LoadingView />
      </SafeAreaView>
    );
  }

  // Render error state
  if (error || borrowError || !book) {
    return (
      <SafeAreaView style={styles.container}>
        <LibraryHeader title="Detail Buku" onBackPress={handleBackPress} />
        <ErrorView
          message={error || borrowError || "Buku tidak ditemukan"}
          onRetry={handleBackPress}
        />
      </SafeAreaView>
    );
  }

  // Get publisher name
  const getPublisherName = () => {
    if (!book.publisher) return "CV Mitra Media Pustaka";
    if (typeof book.publisher === "string") return book.publisher;
    return book.publisher.name;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LibraryHeader
        title="Detail Buku"
        onBackPress={handleBackPress}
        backgroundColor={CommonColors.primary}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Book Cover and Info */}
        <View style={styles.bookInfoContainer}>
          {/* Book Cover Image */}
          <Image
            source={{
              uri:
                book.coverImage ||
                "https://via.placeholder.com/150x200/007bff/ffffff?text=No+Cover",
            }}
            style={styles.coverImage}
            resizeMode="cover"
          />

          {/* Book Details */}
          <View style={styles.bookDetails}>
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.publisher}>{getPublisherName()}</Text>
            <Text style={styles.readCount}>
              Dibaca: {book.readCount || "22"} kali
            </Text>
            <StarRating rating={book.rating || 0} />

            {/* Borrow Button or Status */}
            {currentBorrow ? (
              <TouchableOpacity
                style={[styles.borrowButton, styles.activeBorrowButton]}
                onPress={handleViewBorrowDetails}
              >
                <Text style={styles.activeBorrowButtonText}>
                  Sedang Dipinjam
                </Text>
                <Text style={styles.borrowDueDateText}>
                  Jatuh tempo:{" "}
                  {formatDate(
                    currentBorrow.dueDate instanceof Date
                      ? currentBorrow.dueDate
                      : currentBorrow.dueDate?.toDate()
                  )}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.borrowButton}
                onPress={handleBorrowPress}
              >
                <Text style={styles.borrowButtonText}>Pinjam</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Synopsis */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Sinopsis</Text>
          <Text style={styles.synopsis}>
            {book.description ||
              "Konon di Banyuwangi dahulu dipimpin oleh seorang raja yang dijuluki Joko Wulur. Raja ini memiliki kekuatan ajaib. Joko Wulur bisa merubah tubuhnya menjadi panjang atau pendek sesuai dengan kebutuhan. O ..."}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.readButton]}
            onPress={handleReadPress}
          >
            <Text style={styles.actionButtonText}>Baca</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.audiobookButton]}
            onPress={handleAudiobookPress}
          >
            <Text style={styles.actionButtonText}>Audiobook</Text>
          </TouchableOpacity>
        </View>

        {/* Rating Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.ratingTitle}>
            Berikan rating anda terhadap buku ini
          </Text>
          <View style={styles.ratingContainer}>
            <StarRating
              rating={userRating}
              size={40}
              editable={!hasRated}
              onRatingChange={setUserRating}
            />
          </View>

          {!hasRated && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveRating}
            >
              <Text style={styles.saveButtonText}>Simpan</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Reviews Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ulasan</Text>
          <Text style={styles.noReviewsText}>Belum ada ulasan</Text>
        </View>

        {/* You Might Like Section */}
        <View style={[styles.sectionContainer, styles.lastSection]}>
          <Text style={styles.sectionTitle}>Mungkin anda suka</Text>
          <Text style={styles.comingSoonText}>
            Rekomendasi buku akan ditampilkan di sini
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CommonColors.white,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray600,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  errorText: {
    fontSize: Typography.sizes.base,
    color: CommonColors.error,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  retryButton: {
    backgroundColor: CommonColors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 4,
  },
  retryButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: CommonColors.white,
  },
  bookInfoContainer: {
    flexDirection: "row",
    padding: Spacing.md,
    backgroundColor: CommonColors.white,
  },
  coverImage: {
    width: 120,
    height: 170,
    borderRadius: 4,
  },
  bookDetails: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: CommonColors.gray900,
    marginBottom: Spacing.xs,
  },
  publisher: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray700,
    marginTop: Spacing.xs,
    padding: Spacing.xs,
    backgroundColor: CommonColors.gray200,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  readCount: {
    fontSize: Typography.sizes.xs,
    color: CommonColors.gray600,
    marginTop: Spacing.sm,
  },
  starsContainer: {
    flexDirection: "row",
    marginTop: Spacing.xs,
  },
  starButton: {
    padding: 2,
  },
  borrowButton: {
    backgroundColor: CommonColors.white,
    borderColor: CommonColors.primary,
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    alignSelf: "flex-start",
    marginTop: Spacing.md,
  },
  borrowButtonText: {
    color: CommonColors.primary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    textAlign: "center",
  },
  activeBorrowButton: {
    backgroundColor: CommonColors.primary,
    borderColor: CommonColors.primary,
  },
  activeBorrowButtonText: {
    color: CommonColors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    textAlign: "center",
  },
  borrowDueDateText: {
    color: CommonColors.white,
    fontSize: Typography.sizes.xs,
    marginTop: 4,
  },
  sectionContainer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: CommonColors.gray100,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: CommonColors.gray900,
    marginBottom: Spacing.sm,
  },
  synopsis: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray700,
    lineHeight: 20,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    padding: Spacing.xs,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  readButton: {
    backgroundColor: CommonColors.primary,
    marginRight: Spacing.xs,
  },
  audiobookButton: {
    backgroundColor: CommonColors.primary,
    marginLeft: Spacing.xs,
  },
  actionButtonText: {
    color: CommonColors.white,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
  ratingTitle: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray800,
    marginBottom: Spacing.md,
  },
  ratingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: Spacing.md,
  },
  saveButton: {
    backgroundColor: CommonColors.gray200,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 20,
    alignSelf: "center",
  },
  saveButtonText: {
    color: CommonColors.gray800,
    fontSize: Typography.sizes.sm,
  },
  noReviewsText: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray600,
    fontStyle: "italic",
  },
  comingSoonText: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray600,
    fontStyle: "italic",
  },
  lastSection: {
    marginBottom: Spacing.xl * 2,
  },
});
