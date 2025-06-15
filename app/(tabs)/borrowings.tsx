import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from 'react-native-safe-area-context';

// Components

// Types, Constants & Hooks
import { CommonColors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/hooks/useAuth";
import { useBorrows } from "@/hooks/useBorrows";
import { Borrow } from "@/services/BorrowService";
import { router } from "expo-router";
import { Timestamp } from "firebase/firestore";

// Format date function
const formatDate = (date: Date | Timestamp): string => {
  if (date instanceof Timestamp) {
    date = date.toDate();
  }

  // Manual formatting for Indonesian date
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  // Indonesian month names
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return `${day} ${monthNames[month]} ${year}`;
};

// BorrowedBookItem component
const BorrowedBookItem = ({
  borrow,
  onPress,
}: {
  borrow: Borrow;
  onPress: () => void;
}) => {
  // Get status color
  const getStatusColor = () => {
    switch (borrow.status) {
      case "active":
        return CommonColors.success;
      case "overdue":
        return CommonColors.error;
      case "returned":
        return CommonColors.gray500;
      default:
        return CommonColors.gray500;
    }
  };

  // Get status label
  const getStatusLabel = () => {
    switch (borrow.status) {
      case "active":
        return "Dipinjam";
      case "overdue":
        return "Terlambat";
      case "returned":
        return "Dikembalikan";
      case "reserved":
        return "Direservasi";
      default:
        return "";
    }
  };

  // Get the formatted dates
  const borrowDate = formatDate(borrow.borrowDate);
  const dueDate = formatDate(borrow.dueDate);

  // Check if book is overdue
  const isOverdue = () => {
    if (borrow.status === "returned") return false;

    const today = new Date();
    const due =
      borrow.dueDate instanceof Timestamp
        ? borrow.dueDate.toDate()
        : borrow.dueDate;

    return today > due;
  };

  // Display correct status
  const displayStatus = isOverdue() ? "overdue" : borrow.status;

  // Handle image error
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity style={styles.bookItem} onPress={onPress}>
      <View style={styles.bookImageContainer}>
        {borrow.book?.coverImage && !imageError ? (
          <Image
            source={{ uri: borrow.book.coverImage }}
            style={styles.bookImage}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.bookImagePlaceholder}>
            <Text style={styles.bookImageText}>
              {borrow.book?.title?.[0]?.toUpperCase() || "?"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {borrow.book?.title || "Buku Tidak Ditemukan"}
        </Text>
        <Text style={styles.bookAuthor}>
          {borrow.book?.author?.name || "Penulis Tidak Diketahui"}
        </Text>

        <View style={styles.borrowInfo}>
          <Text style={styles.dateLabel}>
            Dipinjam: <Text style={styles.date}>{borrowDate}</Text>
          </Text>
          <Text style={[styles.dateLabel, isOverdue() && styles.overdueText]}>
            Jatuh tempo: <Text style={styles.date}>{dueDate}</Text>
          </Text>
        </View>

        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
        >
          <Text style={styles.statusText}>{getStatusLabel()}</Text>
        </View>
      </View>

      <View style={styles.arrowContainer}>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={CommonColors.gray400}
        />
      </View>
    </TouchableOpacity>
  );
};

export default function BorrowingsScreen() {
  const { user, isAuthenticated } = useAuth();
  const { borrows, isLoading, error, refreshBorrows } = useBorrows();

  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }, []);

  // Handle book press
  const handleBookPress = useCallback((borrow: Borrow) => {
    if (borrow.book?.id) {
      router.push(`/books/borrow/${borrow.id}`);
    } else {
      Alert.alert("Info", "Detail buku tidak tersedia");
    }
  }, []);

  // Not authenticated view
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={CommonColors.gray400}
        />
        <Text style={styles.emptyText}>
          Silakan login untuk melihat peminjaman Anda
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Loading view
  if (isLoading && borrows.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={CommonColors.primary} />
        <Text style={styles.loadingText}>Memuat data peminjaman...</Text>
      </SafeAreaView>
    );
  }

  // Error view
  if (error && borrows.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={CommonColors.error}
        />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshBorrows}>
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={borrows}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.borrowItemContainer}>
            <BorrowedBookItem
              borrow={item}
              onPress={() => handleBookPress(item)}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshBorrows}
            colors={[CommonColors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="library-outline"
              size={64}
              color={CommonColors.gray400}
            />
            <Text style={styles.emptyText}>
              Anda belum meminjam buku apa pun.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CommonColors.gray50,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  borrowItemContainer: {
    marginBottom: Spacing.md,
  },
  bookItem: {
    flexDirection: "row",
    backgroundColor: CommonColors.white,
    borderRadius: 12,
    padding: Spacing.md,
    shadowColor: CommonColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookImageContainer: {
    marginRight: Spacing.md,
  },
  bookImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  bookImagePlaceholder: {
    width: 80,
    height: 120,
    backgroundColor: CommonColors.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  bookImageText: {
    color: CommonColors.white,
    fontSize: Typography.sizes.xl,
    fontWeight: "bold",
  },
  bookDetails: {
    flex: 1,
  },
  bookTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: "bold",
    color: CommonColors.gray900,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray600,
    marginBottom: 8,
  },
  borrowInfo: {
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: Typography.sizes.xs,
    color: CommonColors.gray700,
    marginBottom: 2,
  },
  overdueText: {
    color: CommonColors.error,
  },
  date: {
    fontWeight: "500",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: Typography.sizes.xs,
    fontWeight: "500",
    color: CommonColors.white,
  },
  arrowContainer: {
    justifyContent: "center",
    paddingLeft: Spacing.sm,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    fontSize: Typography.sizes.base,
    color: CommonColors.gray600,
    textAlign: "center",
    marginTop: Spacing.md,
  },
  errorText: {
    fontSize: Typography.sizes.base,
    color: CommonColors.error,
    textAlign: "center",
    marginTop: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.sizes.base,
    color: CommonColors.gray600,
    marginTop: Spacing.md,
  },
  returnButton: {
    backgroundColor: CommonColors.primary,
    padding: Spacing.sm,
    borderRadius: 8,
    marginTop: Spacing.xs,
    alignItems: "center",
  },
  returnButtonText: {
    color: CommonColors.white,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: CommonColors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: 8,
    marginTop: Spacing.lg,
  },
  loginButtonText: {
    color: CommonColors.white,
    fontWeight: "500",
  },
  retryButton: {
    backgroundColor: CommonColors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    marginTop: Spacing.md,
  },
  retryButtonText: {
    color: CommonColors.white,
    fontWeight: "500",
  },
});
