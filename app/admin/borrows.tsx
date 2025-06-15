import { CommonColors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import { bookService } from "@/services/BookService";
import { Borrow, borrowService, BorrowStatus } from "@/services/BorrowService";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from 'expo-router';
import { LibraryHeader } from "@/components/organisms/LibraryHeader";

const BorrowHistoryScreen = () => {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [currentBorrow, setCurrentBorrow] = useState<Borrow | null>(null);

  // Fetch all borrows
  const fetchBorrows = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Get all borrows (we need to add a method in BorrowService to get all borrows)
      const response = await borrowService.getAll({
        orderByField: "borrowDate",
        orderDirection: "desc",
        limit: 100,
      });

      // Fetch book details for each borrow
      const borrowsWithDetails = await Promise.all(
        response.items.map(async (borrow) => {
          try {
            const book = await bookService.getById(borrow.bookId);
            return {
              ...borrow,
              book,
            };
          } catch (error) {
            console.error(`Error fetching book ${borrow.bookId}:`, error);
            return borrow;
          }
        })
      );

      setBorrows(borrowsWithDetails);
    } catch (err) {
      console.error("Error fetching borrows:", err);
      setError("Gagal memuat data peminjaman");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load borrows on component mount
  useEffect(() => {
    fetchBorrows();
  }, [fetchBorrows]);

  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBorrows();
  }, [fetchBorrows]);

  // Handle search
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  // Filter borrows based on search query
  const filteredBorrows = borrows.filter(
    (borrow) =>
      (borrow.book?.title || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      borrow.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // View borrow details
  const handleViewBorrow = useCallback((borrow: Borrow) => {
    setCurrentBorrow(borrow);
    setModalVisible(true);
  }, []);

  // Return a book
  const handleReturnBook = useCallback(async (borrowId: string) => {
    try {
      setLoading(true);
      await borrowService.returnBook(borrowId);

      // Update local state
      setBorrows((prevBorrows) =>
        prevBorrows.map((borrow) =>
          borrow.id === borrowId
            ? {
                ...borrow,
                status: "returned" as BorrowStatus,
                returnDate: new Date(),
              }
            : borrow
        )
      );

      Alert.alert("Sukses", "Buku berhasil dikembalikan");
      setModalVisible(false);
    } catch (err) {
      console.error("Error returning book:", err);
      Alert.alert("Error", "Gagal mengembalikan buku");
    } finally {
      setLoading(false);
    }
  }, []);

  // Format date
  const formatDate = (date: any) => {
    if (!date) return "Tidak ada";

    // Handle Firebase Timestamp
    if (typeof date.toDate === "function") {
      date = date.toDate();
    }

    return format(new Date(date), "dd/MM/yyyy");
  };

  // Get status color
  const getStatusColor = (status: BorrowStatus) => {
    switch (status) {
      case "active":
        return CommonColors.primary;
      case "returned":
        return CommonColors.success;
      case "overdue":
        return CommonColors.error;
      case "reserved":
        return CommonColors.warning;
      default:
        return CommonColors.gray600;
    }
  };

  // Get status label
  const getStatusLabel = (status: BorrowStatus) => {
    switch (status) {
      case "active":
        return "Dipinjam";
      case "returned":
        return "Dikembalikan";
      case "overdue":
        return "Terlambat";
      case "reserved":
        return "Direservasi";
      default:
        return status;
    }
  };

  // Check for overdue books
  const handleCheckOverdue = useCallback(async () => {
    try {
      setLoading(true);
      const count = await borrowService.checkAllOverdueBorrows();

      // Refresh the list
      await fetchBorrows();

      Alert.alert(
        "Sukses",
        `${count} buku yang terlambat telah otomatis dikembalikan`
      );
    } catch (err) {
      console.error("Error checking overdue books:", err);
      Alert.alert("Error", "Gagal memeriksa buku terlambat");
    } finally {
      setLoading(false);
    }
  }, [fetchBorrows]);

  // Render borrow item
  const renderBorrowItem = useCallback(
    ({ item }: { item: Borrow }) => (
      <TouchableOpacity
        style={styles.borrowItem}
        onPress={() => handleViewBorrow(item)}
      >
        <View style={styles.borrowInfo}>
          <Text style={styles.bookTitle} numberOfLines={1}>
            {item.book?.title || "Buku tidak diketahui"}
          </Text>
          <Text style={styles.borrowDetails}>Peminjam: {item.userId}</Text>
          <Text style={styles.borrowDetails}>
            Tanggal Pinjam: {formatDate(item.borrowDate)}
          </Text>
          <Text style={styles.borrowDetails}>
            Tanggal Kembali:{" "}
            {formatDate(item.returnDate) || "Belum dikembalikan"}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [handleViewBorrow]
  );

  // Borrow details modal
  const renderBorrowDetails = () => {
    if (!currentBorrow) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Detail Peminjaman</Text>

            <ScrollView style={styles.modalScrollContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Judul Buku:</Text>
                <Text style={styles.detailValue}>
                  {currentBorrow.book?.title || "Buku tidak diketahui"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ID Peminjam:</Text>
                <Text style={styles.detailValue}>{currentBorrow.userId}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(currentBorrow.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusLabel(currentBorrow.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tanggal Pinjam:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(currentBorrow.borrowDate)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tanggal Tenggat:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(currentBorrow.dueDate)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tanggal Kembali:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(currentBorrow.returnDate) || "Belum dikembalikan"}
                </Text>
              </View>

              {currentBorrow.notes && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Catatan:</Text>
                  <Text style={styles.detailValue}>{currentBorrow.notes}</Text>
                </View>
              )}

              {currentBorrow.status === "active" && (
                <TouchableOpacity
                  style={styles.returnButton}
                  onPress={() => handleReturnBook(currentBorrow.id!)}
                >
                  <Text style={styles.returnButtonText}>Kembalikan Buku</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top","bottom"]}>
      <LibraryHeader title="Peminjaman" onBackPress={handleBackPress} />
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={CommonColors.gray400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari berdasarkan judul buku atau ID peminjam..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={CommonColors.gray400}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.checkOverdueButton}
        onPress={handleCheckOverdue}
      >
        <Ionicons name="time-outline" size={16} color={CommonColors.white} />
        <Text style={styles.checkOverdueText}>Periksa Buku Terlambat</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredBorrows}
        renderItem={renderBorrowItem}
        keyExtractor={(item) => item.id!}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[CommonColors.primary]}
          />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color={CommonColors.primary}
              style={styles.loading}
            />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Tidak ada data peminjaman yang cocok dengan pencarian Anda"
                : "Tidak ada data peminjaman yang tersedia"}
            </Text>
          )
        }
      />

      {renderBorrowDetails()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CommonColors.gray50,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CommonColors.white,
    padding: Spacing.sm,
    margin: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CommonColors.gray200,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray800,
  },
  checkOverdueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CommonColors.primary,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  checkOverdueText: {
    color: CommonColors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: "500",
    marginLeft: Spacing.xs,
  },
  listContainer: {
    padding: Spacing.md,
  },
  borrowItem: {
    backgroundColor: CommonColors.white,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: CommonColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  borrowInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: "bold",
    color: CommonColors.gray900,
    marginBottom: 4,
  },
  borrowDetails: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray700,
    marginBottom: 2,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    color: CommonColors.white,
    fontSize: Typography.sizes.xs,
    fontWeight: "500",
  },
  loading: {
    marginTop: Spacing.xl,
  },
  errorText: {
    textAlign: "center",
    color: CommonColors.error,
    marginTop: Spacing.xl,
    fontSize: Typography.sizes.base,
  },
  emptyText: {
    textAlign: "center",
    color: CommonColors.gray600,
    marginTop: Spacing.xl,
    fontSize: Typography.sizes.base,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: CommonColors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: "bold",
    color: CommonColors.gray900,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  modalScrollContent: {
    maxHeight: 400,
  },
  detailRow: {
    marginBottom: Spacing.md,
  },
  detailLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: "500",
    color: CommonColors.gray700,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: Typography.sizes.base,
    color: CommonColors.gray900,
  },
  returnButton: {
    backgroundColor: CommonColors.primary,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  returnButtonText: {
    color: CommonColors.white,
    fontWeight: "500",
    fontSize: Typography.sizes.base,
  },
  closeButton: {
    backgroundColor: CommonColors.gray200,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  closeButtonText: {
    color: CommonColors.gray800,
    fontWeight: "500",
  },
});

export default BorrowHistoryScreen;
