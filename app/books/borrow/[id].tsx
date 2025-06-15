import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

// Hooks, types and constants
import { CommonColors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import { useBook } from "@/hooks/useBook";
import { useBorrows } from "@/hooks/useBorrows";
import { Borrow } from "@/services";
import { parseError } from "@/types/errors/AppError";

/**
 * Format date to Indonesian locale
 */
const formatDate = (date: any): string => {
  if (!date) return "-";

  const dateObj = date instanceof Date ? date : date.toDate();

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateObj);
};

/**
 * Format status to human readable text
 */
const formatStatus = (status: string): string => {
  switch (status) {
    case "active":
      return "Dipinjam";
    case "returned":
      return "Dikembalikan";
    case "overdue":
      return "Terlambat";
    case "reserved":
      return "Dipesan";
    default:
      return status;
  }
};

/**
 * Get color for status
 */
const getStatusColor = (status: string): string => {
  switch (status) {
    case "active":
      return CommonColors.success;
    case "returned":
      return CommonColors.gray600;
    case "overdue":
      return CommonColors.error;
    case "reserved":
      return CommonColors.warning;
    default:
      return CommonColors.gray600;
  }
};

/**
 * Borrow Detail Screen
 */
export default function BorrowDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [borrow, setBorrow] = useState<Borrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [returnLoading, setReturnLoading] = useState(false);

  const { getBorrowDetails, returnBook } = useBorrows();
  const { getBookById } = useBook();

  // Load borrow details
  useEffect(() => {
    const loadBorrowDetails = async () => {
      if (!id) {
        setError("Borrow ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null); // Reset error state

        const borrowData = await getBorrowDetails(id);

        if (!borrowData) {
          setError("Peminjaman tidak ditemukan");
          setLoading(false);
          return;
        }

        // If we have a book ID but no book data, fetch the book
        if (borrowData.bookId && !borrowData.book) {
          try {
            const bookData = await getBookById(borrowData.bookId);
            borrowData.book = bookData;
          } catch (err) {
            console.error("Failed to load book data:", err);
            // Continue even if book data loading fails
          }
        }

        setBorrow(borrowData);
      } catch (err) {
        const appError = parseError(err);
        setError(appError.message);
      } finally {
        setLoading(false);
      }
    };

    loadBorrowDetails();
  }, [id]); // Remove getBorrowDetails and getBookById from dependencies

  // Handle back press
  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/profile/borrows");
    }
  }, []);

  // Handle return book
  const handleReturnBook = useCallback(async () => {
    if (!borrow?.id) return;

    Alert.alert(
      "Kembalikan Buku",
      "Apakah Anda yakin ingin mengembalikan buku ini?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Kembalikan",
          onPress: async () => {
            try {
              setReturnLoading(true);
              await returnBook(borrow.id!);
              Alert.alert("Berhasil", "Buku berhasil dikembalikan", [
                {
                  text: "OK",
                  onPress: handleBackPress,
                },
              ]);
            } catch (err) {
              const appError = parseError(err);
              Alert.alert("Error", appError.message);
            } finally {
              setReturnLoading(false);
            }
          },
        },
      ]
    );
  }, [borrow?.id, returnBook, handleBackPress]);

  // Check if a borrow is overdue
  const isOverdue = useCallback((borrowData: Borrow): boolean => {
    if (borrowData.status === "returned") return false;

    const dueDate =
      borrowData.dueDate instanceof Date
        ? borrowData.dueDate
        : borrowData.dueDate?.toDate();

    if (!dueDate) return false;

    return dueDate < new Date();
  }, []);

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LibraryHeader
          title="Detail Peminjaman"
          onBackPress={handleBackPress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CommonColors.primary} />
          <Text style={styles.loadingText}>Memuat detail peminjaman...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error || !borrow) {
    return (
      <SafeAreaView style={styles.container}>
        <LibraryHeader
          title="Detail Peminjaman"
          onBackPress={handleBackPress}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={CommonColors.error} />
          <Text style={styles.errorText}>
            {error || "Peminjaman tidak ditemukan"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleBackPress}
          >
            <Text style={styles.retryButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Get book title and cover
  const bookTitle = borrow.book?.title || "Judul tidak diketahui";
  const bookCover =
    borrow.book?.coverImage ||
    borrow.book?.coverUrl ||
    "https://via.placeholder.com/150x200/007bff/ffffff?text=No+Cover";

  // Check if overdue
  const overdue = isOverdue(borrow);

  return (
    <SafeAreaView style={styles.container}>
      <LibraryHeader
        title="Detail Peminjaman"
        onBackPress={handleBackPress}
        backgroundColor={CommonColors.primary}
      />

      <ScrollView style={styles.content}>
        {/* Book Details */}
        <View style={styles.bookContainer}>
          <Image
            source={{ uri: bookCover }}
            style={styles.bookCover}
            resizeMode="cover"
          />

          <View style={styles.bookDetails}>
            <Text style={styles.bookTitle}>{bookTitle}</Text>

            {borrow.book?.author && (
              <Text style={styles.bookAuthor}>
                {typeof borrow.book.author === "string"
                  ? borrow.book.author
                  : borrow.book.author.name || "Penulis tidak diketahui"}
              </Text>
            )}

            <TouchableOpacity
              style={styles.viewBookButton}
              onPress={() => router.push(`/books/${borrow.bookId}`)}
            >
              <Text style={styles.viewBookButtonText}>Lihat Buku</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Borrow Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Informasi Peminjaman</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View
              style={[
                styles.detailBadge,
                { backgroundColor: getStatusColor(borrow.status) },
              ]}
            >
              <Text style={styles.detailBadgeText}>
                {overdue && borrow.status === "active"
                  ? "Terlambat"
                  : formatStatus(borrow.status)}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tanggal Pinjam</Text>
            <Text style={styles.detailValue}>
              {formatDate(borrow.borrowDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tenggat Waktu</Text>
            <Text
              style={[
                styles.detailValue,
                overdue && borrow.status === "active" && styles.overdueText,
              ]}
            >
              {formatDate(borrow.dueDate)}
            </Text>
          </View>

          {borrow.returnDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tanggal Kembali</Text>
              <Text style={styles.detailValue}>
                {formatDate(borrow.returnDate)}
              </Text>
            </View>
          )}

          {borrow.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Catatan:</Text>
              <Text style={styles.notesText}>{borrow.notes}</Text>
            </View>
          )}
        </View>

        {/* Return Button - only show for active borrows */}
        {borrow.status === "active" && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.returnButton}
              onPress={handleReturnBook}
              disabled={returnLoading}
            >
              {returnLoading ? (
                <ActivityIndicator size="small" color={CommonColors.white} />
              ) : (
                <Text style={styles.returnButtonText}>Kembalikan Buku</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Warning for overdue */}
        {overdue && borrow.status === "active" && (
          <View style={styles.warningContainer}>
            <Ionicons name="warning" size={24} color={CommonColors.warning} />
            <Text style={styles.warningText}>
              Buku ini telah melewati tenggat waktu pengembalian. Segera
              kembalikan untuk menghindari denda.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CommonColors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.sizes.base,
    color: CommonColors.gray600,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  errorText: {
    marginVertical: Spacing.md,
    fontSize: Typography.sizes.base,
    color: CommonColors.error,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: CommonColors.primary,
    borderRadius: 4,
  },
  retryButtonText: {
    color: CommonColors.white,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },
  content: {
    flex: 1,
  },
  statusText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: CommonColors.white,
  },
  bookContainer: {
    flexDirection: "row",
    padding: Spacing.lg,
    backgroundColor: CommonColors.white,
  },
  bookCover: {
    width: 100,
    height: 150,
    borderRadius: 4,
  },
  bookDetails: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: "center",
  },
  bookTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: CommonColors.gray900,
    marginBottom: Spacing.xs,
  },
  bookAuthor: {
    fontSize: Typography.sizes.base,
    color: CommonColors.gray700,
    marginBottom: Spacing.sm,
  },
  viewBookButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: CommonColors.primary,
    borderRadius: 4,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    alignSelf: "flex-start",
    marginTop: Spacing.sm,
  },
  viewBookButtonText: {
    color: CommonColors.primary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  detailsCard: {
    margin: Spacing.md,
    padding: Spacing.md,
    backgroundColor: CommonColors.white,
    borderRadius: 8,
    shadowColor: CommonColors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: CommonColors.gray900,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: CommonColors.gray200,
    paddingBottom: Spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  detailLabel: {
    fontSize: Typography.sizes.base,
    color: CommonColors.gray700,
  },
  detailValue: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: CommonColors.gray900,
  },
  detailBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  detailBadgeText: {
    fontSize: Typography.sizes.xs,
    color: CommonColors.white,
    fontWeight: Typography.weights.medium,
  },
  overdueText: {
    color: CommonColors.error,
  },
  notesContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: CommonColors.gray100,
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: CommonColors.gray700,
    marginBottom: Spacing.xs,
  },
  notesText: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray800,
  },
  actionContainer: {
    padding: Spacing.lg,
  },
  returnButton: {
    backgroundColor: CommonColors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  returnButtonText: {
    color: CommonColors.white,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: Spacing.md,
    padding: Spacing.md,
    backgroundColor: CommonColors.warning + "20", // 20% opacity
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: CommonColors.warning,
  },
  warningText: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray800,
  },
});
