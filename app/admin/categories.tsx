import BulkUploader from "@/components/admin/BulkUploader";
import { LibraryHeader } from "@/components/organisms/LibraryHeader";
import { CommonColors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import { categoryService } from "@/services/CategoryService";
import { Category } from "@/types/Category";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from 'expo-router';

const ManageCategoriesScreen = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [showBulkUploader, setShowBulkUploader] = useState(false);

  // FAB animation states
  const [isFabOpen, setIsFabOpen] = useState(false);
  const fabAnimation = useState(new Animated.Value(0))[0];

  // Form fields
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");
  const [featured, setFeatured] = useState(false);

  // Fetch categories from firestore
  const fetchCategories = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await categoryService.getAllCategories();
      setCategories(response.items);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Gagal memuat data kategori");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
    await fetchCategories();
  }, [fetchCategories]);

  // Handle search
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  // Toggle FAB menu
  const toggleFabMenu = useCallback(() => {
    const toValue = isFabOpen ? 0 : 1;

    Animated.spring(fabAnimation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();

    setIsFabOpen(!isFabOpen);
  }, [isFabOpen, fabAnimation]);

  // Animation values for secondary buttons
  const addButtonAnimation = {
    transform: [
      { scale: fabAnimation },
      {
        translateY: fabAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -60],
        }),
      },
    ],
    opacity: fabAnimation,
  };

  const uploadButtonAnimation = {
    transform: [
      { scale: fabAnimation },
      {
        translateY: fabAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -140],
        }),
      },
    ],
    opacity: fabAnimation,
  };

  // Icon rotation for main FAB
  const rotateInterpolate = fabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const rotateStyle = {
    transform: [{ rotate: rotateInterpolate }],
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Delete category confirmation
  const confirmDeleteCategory = useCallback((category: Category) => {
    Alert.alert(
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus kategori "${category.title}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => handleDeleteCategory(category.id),
        },
      ]
    );
  }, []);

  // Delete category
  const handleDeleteCategory = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await categoryService.delete(id);
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category.id !== id)
      );
      Alert.alert("Sukses", "Kategori berhasil dihapus");
    } catch (err) {
      console.error("Error deleting category:", err);
      Alert.alert("Error", "Gagal menghapus kategori");
    } finally {
      setLoading(false);
    }
  }, []);

  // Edit category
  const handleEditCategory = useCallback((category: Category) => {
    setCurrentCategory(category);
    setTitle(category.title);
    setIcon(category.icon || "");
    setFeatured(category.featured || false);
    setModalVisible(true);
  }, []);

  // Add new category
  const handleAddCategory = useCallback(() => {
    setCurrentCategory(null);
    setTitle("");
    setIcon("");
    setFeatured(false);
    setModalVisible(true);
    setIsFabOpen(false);
  }, []);

  // Handle bulk upload
  const handleBulkUpload = useCallback(() => {
    setShowBulkUploader(true);
    setIsFabOpen(false);
  }, []);

  // Save category (create or update)
  const handleSaveCategory = useCallback(async () => {
    try {
      if (!title) {
        Alert.alert("Error", "Judul kategori harus diisi");
        return;
      }

      const categoryData: Partial<Category> = {
        title,
        icon,
        featured,
      };

      setLoading(true);

      if (currentCategory) {
        // Update existing category
        await categoryService.update(currentCategory.id, categoryData);
        setCategories((prevCategories) =>
          prevCategories.map((category) =>
            category.id === currentCategory.id
              ? { ...category, ...categoryData }
              : category
          )
        );
        Alert.alert("Sukses", "Kategori berhasil diperbarui");
      } else {
        // Create new category
        const newCategory = await categoryService.create(
          categoryData as Category
        );
        setCategories((prevCategories) => [...prevCategories, newCategory]);
        Alert.alert("Sukses", "Kategori berhasil ditambahkan");
      }

      setModalVisible(false);
    } catch (err) {
      console.error("Error saving category:", err);
      Alert.alert("Error", "Gagal menyimpan data kategori");
    } finally {
      setLoading(false);
    }
  }, [title, icon, featured, currentCategory]);

  // Render category item
  const renderCategoryItem = useCallback(
    ({ item }: { item: Category }) => (
      <View style={styles.categoryItem}>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.icon && (
            <Text style={styles.categoryDetails}>Icon: {item.icon}</Text>
          )}
          {item.featured && (
            <Text style={styles.categoryStatus}>Status: Unggulan</Text>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditCategory(item)}
          >
            <Ionicons name="pencil" size={18} color={CommonColors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => confirmDeleteCategory(item)}
          >
            <Ionicons name="trash" size={18} color={CommonColors.white} />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [handleEditCategory, confirmDeleteCategory]
  );

  // Category form modal
  const renderCategoryForm = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {currentCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
          </Text>

          <ScrollView style={styles.formContainer}>
            <Text style={styles.inputLabel}>Judul Kategori</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Masukkan judul kategori"
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>Icon (opsional)</Text>
            <TextInput
              style={styles.input}
              value={icon}
              onChangeText={setIcon}
              placeholder="Nama icon atau URL"
            />

            <View style={styles.switchContainer}>
              <Text style={styles.inputLabel}>Tampilkan sebagai Unggulan?</Text>
              <Switch
                value={featured}
                onValueChange={setFeatured}
                trackColor={{
                  false: CommonColors.gray400,
                  true: CommonColors.primary,
                }}
              />
            </View>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSaveCategory}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={CommonColors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Simpan</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  // Bulk uploader modal
  const renderBulkUploaderModal = () => (
    <Modal
      visible={showBulkUploader}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowBulkUploader(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Import Kategori</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowBulkUploader(false)}
            >
              <Ionicons name="close" size={24} color={CommonColors.gray600} />
            </TouchableOpacity>
          </View>

          <BulkUploader
            entityType="categories"
            onComplete={(results) => {
              if (results.success) {
                // Refresh category list after successful upload
                fetchCategories();
              }
              // Keep modal open to show results
            }}
          />

          <View style={styles.helpTextContainer}>
            <Text style={styles.helpText}>Format JSON untuk kategori:</Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>
                {`{\n  "categories": [\n    { "title": "Nama Kategori", "icon": "icon-name", "featured": true },\n    { "title": "Kategori Lain", "featured": false }\n  ]\n}`}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: CommonColors.gray600 },
            ]}
            onPress={() => setShowBulkUploader(false)}
          >
            <Text style={styles.saveButtonText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top","bottom"]}>
      <LibraryHeader title="Kategori" onBackPress={handleBackPress} />
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={CommonColors.gray400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari kategori..."
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

      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryItem}
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
                ? "Tidak ada kategori yang cocok dengan pencarian Anda"
                : "Tidak ada kategori yang tersedia"}
            </Text>
          )
        }
      />

      {/* Floating Action Button Menu */}
      <View style={styles.fabContainer}>
        {/* Add Category Button */}
        <Animated.View style={[styles.fabItem, addButtonAnimation]}>
          <TouchableOpacity
            style={[
              styles.fabSecondary,
              { backgroundColor: CommonColors.success },
            ]}
            onPress={handleAddCategory}
          >
            <Ionicons name="add" size={24} color={CommonColors.white} />
          </TouchableOpacity>
          <Text style={styles.fabLabel}>Tambah</Text>
        </Animated.View>

        {/* Bulk Import Button */}
        <Animated.View style={[styles.fabItem, uploadButtonAnimation]}>
          <TouchableOpacity
            style={[
              styles.fabSecondary,
              { backgroundColor: CommonColors.warning },
            ]}
            onPress={handleBulkUpload}
          >
            <Ionicons
              name="cloud-upload"
              size={24}
              color={CommonColors.white}
            />
          </TouchableOpacity>
          <Text style={styles.fabLabel}>Import</Text>
        </Animated.View>

        {/* Main FAB */}
        <TouchableOpacity
          style={[styles.fab, isFabOpen ? styles.fabActive : null]}
          onPress={toggleFabMenu}
          activeOpacity={0.8}
        >
          <Animated.View style={rotateStyle}>
            <Ionicons name="add" size={24} color={CommonColors.white} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {renderCategoryForm()}
      {renderBulkUploaderModal()}
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
  listContainer: {
    padding: Spacing.md,
  },
  categoryItem: {
    flexDirection: "row",
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
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: "bold",
    color: CommonColors.gray900,
    marginBottom: 4,
  },
  categoryDetails: {
    fontSize: Typography.sizes.xs,
    color: CommonColors.gray600,
    marginBottom: 2,
  },
  categoryStatus: {
    fontSize: Typography.sizes.xs,
    fontWeight: "bold",
    color: CommonColors.primary,
    marginTop: 4,
  },
  actionsContainer: {
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: CommonColors.primary,
  },
  deleteButton: {
    backgroundColor: CommonColors.error,
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
  formContainer: {
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: "500",
    color: CommonColors.gray800,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: CommonColors.gray300,
    borderRadius: 8,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    fontSize: Typography.sizes.sm,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: CommonColors.gray200,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: CommonColors.primary,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: CommonColors.gray800,
    fontWeight: "500",
  },
  saveButtonText: {
    color: CommonColors.white,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  helpTextContainer: {
    marginTop: Spacing.medium,
    marginBottom: Spacing.medium,
  },
  helpText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.small,
  },
  codeBlock: {
    backgroundColor: CommonColors.gray100,
    padding: Spacing.small,
    borderRadius: 8,
    marginBottom: Spacing.medium,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: Typography.sizes.sm,
  },
  // FAB styles
  fabContainer: {
    position: "absolute",
    right: Spacing.lg,
    bottom: Spacing.lg,
    alignItems: "center",
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CommonColors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: CommonColors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    zIndex: 1,
  },
  fabActive: {
    backgroundColor: CommonColors.error,
  },
  fabSecondary: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: CommonColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabItem: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    bottom: 0,
    right: 4,
  },
  fabLabel: {
    backgroundColor: "rgba(0,0,0,0.7)",
    color: CommonColors.white,
    fontSize: Typography.sizes.xs,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    marginTop: 5,
  },
});

export default ManageCategoriesScreen;
