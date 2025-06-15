import BulkUploader from "@/components/admin/BulkUploader";
import { LibraryHeader } from "@/components/organisms/LibraryHeader";
import { CommonColors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import publisherService, {
  PublisherDetailed,
} from "@/services/PublisherService";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  Linking,
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

const ManagePublishersScreen = () => {
  const [publishers, setPublishers] = useState<PublisherDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPublisher, setCurrentPublisher] =
    useState<PublisherDetailed | null>(null);
  const [showBulkUploader, setShowBulkUploader] = useState(false);

  // FAB animation states
  const [isFabOpen, setIsFabOpen] = useState(false);
  const fabAnimation = useState(new Animated.Value(0))[0];

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  // const [country, setCountry] = useState('');
  // const [foundedYear, setFoundedYear] = useState('');

  // Fetch publishers from firestore
  const fetchPublishers = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await publisherService.getAllPublishers();
      setPublishers(response.items);
    } catch (err) {
      console.error("Error fetching publishers:", err);
      setError("Gagal memuat data penerbit");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load publishers on component mount
  useEffect(() => {
    fetchPublishers();
  }, [fetchPublishers]);

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
    await fetchPublishers();
  }, [fetchPublishers]);

  // Handle search
  const handleSearch = useCallback(
    async (text: string) => {
      setSearchQuery(text);
      if (text.length > 0) {
        try {
          setLoading(true);
          const response = await publisherService.searchPublishers(text);
          setPublishers(response.items);
        } catch (err) {
          console.error("Error searching publishers:", err);
        } finally {
          setLoading(false);
        }
      } else {
        fetchPublishers();
      }
    },
    [fetchPublishers]
  );

  // Delete publisher confirmation
  const confirmDeletePublisher = useCallback((publisher: PublisherDetailed) => {
    Alert.alert(
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus penerbit "${publisher.name}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => handleDeletePublisher(publisher.id!),
        },
      ]
    );
  }, []);

  // Delete publisher
  const handleDeletePublisher = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await publisherService.deletePublisher(id);
      setPublishers((prevPublishers) =>
        prevPublishers.filter((publisher) => publisher.id !== id)
      );
      Alert.alert("Sukses", "Penerbit berhasil dihapus");
    } catch (err) {
      console.error("Error deleting publisher:", err);
      Alert.alert("Error", "Gagal menghapus penerbit");
    } finally {
      setLoading(false);
    }
  }, []);

  // Edit publisher
  const handleEditPublisher = useCallback((publisher: PublisherDetailed) => {
    setCurrentPublisher(publisher);
    setName(publisher.name);
    setDescription(publisher.description || "");
    setWebsite(publisher.website || "");
    setLogoUrl(publisher.logoUrl || "");
    setEmail(publisher.email || "");
    setPhone(publisher.phone || "");
    setLocation(publisher.location || "");
    // setCountry(publisher.country || '');
    // setFoundedYear(publisher.foundedYear?.toString() || '');
    setModalVisible(true);
  }, []);

  // Add new publisher
  const handleAddPublisher = useCallback(() => {
    setCurrentPublisher(null);
    setName("");
    setDescription("");
    setWebsite("");
    setLogoUrl("");
    setEmail("");
    setPhone("");
    setLocation("");
    // setCountry('');
    // setFoundedYear('');
    setModalVisible(true);
    setIsFabOpen(false);
  }, []);

  // Handle bulk upload
  const handleBulkUpload = useCallback(() => {
    setShowBulkUploader(true);
    setIsFabOpen(false);
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

  // Visit website
  const handleVisitWebsite = useCallback((url: string) => {
    if (url) {
      const fullUrl = url.startsWith("http") ? url : `https://${url}`;
      Linking.openURL(fullUrl).catch((err) => {
        console.error("Error opening URL:", err);
        Alert.alert("Error", "Tidak dapat membuka tautan");
      });
    }
  }, []);

  // Save publisher (create or update)
  const handleSavePublisher = useCallback(async () => {
    try {
      if (!name) {
        Alert.alert("Error", "Nama penerbit harus diisi");
        return;
      }

      const publisherData: Partial<PublisherDetailed> = {
        name,
        description,
        website,
        logoUrl,
        email,
        phone,
        location,
        // country,
        // foundedYear: foundedYear ? parseInt(foundedYear, 10) : undefined,
      };

      setLoading(true);

      if (currentPublisher) {
        // Update existing publisher
        const updatedPublisher = await publisherService.updatePublisher(
          currentPublisher.id!,
          publisherData
        );
        setPublishers((prevPublishers) =>
          prevPublishers.map((publisher) =>
            publisher.id === currentPublisher.id ? updatedPublisher : publisher
          )
        );
        Alert.alert("Sukses", "Penerbit berhasil diperbarui");
      } else {
        // Create new publisher
        const newPublisher = await publisherService.createPublisher(
          publisherData as Omit<PublisherDetailed, "id">
        );
        setPublishers((prevPublishers) => [...prevPublishers, newPublisher]);
        Alert.alert("Sukses", "Penerbit berhasil ditambahkan");
      }

      setModalVisible(false);
    } catch (err) {
      console.error("Error saving publisher:", err);
      Alert.alert("Error", "Gagal menyimpan data penerbit");
    } finally {
      setLoading(false);
    }
  }, [
    name,
    description,
    website,
    logoUrl,
    email,
    phone,
    location,
    currentPublisher,
  ]);

  // Render publisher item
  const renderPublisherItem = useCallback(
    ({ item }: { item: PublisherDetailed }) => (
      <View style={styles.publisherItem}>
        {item.logoUrl && (
          <Image
            source={{ uri: item.logoUrl }}
            style={styles.publisherLogo}
            resizeMode="contain"
          />
        )}
        <View style={styles.publisherInfo}>
          <Text style={styles.publisherName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.publisherDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          {item.website && (
            <TouchableOpacity
              onPress={() => handleVisitWebsite(item.website!)}
              style={styles.websiteLink}
            >
              <Ionicons
                name="globe-outline"
                size={14}
                color={CommonColors.primary}
              />
              <Text style={styles.websiteText}>{item.website}</Text>
            </TouchableOpacity>
          )}
          {item.email && (
            <TouchableOpacity
              onPress={() => Linking.openURL(`mailto:${item.email}`)}
              style={styles.contactLink}
            >
              <Ionicons
                name="mail-outline"
                size={14}
                color={CommonColors.primary}
              />
              <Text style={styles.contactText}>{item.email}</Text>
            </TouchableOpacity>
          )}
          {item.phone && (
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${item.phone}`)}
              style={styles.contactLink}
            >
              <Ionicons
                name="call-outline"
                size={14}
                color={CommonColors.primary}
              />
              <Text style={styles.contactText}>{item.phone}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditPublisher(item)}
          >
            <Ionicons name="pencil" size={18} color={CommonColors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => confirmDeletePublisher(item)}
          >
            <Ionicons name="trash" size={18} color={CommonColors.white} />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [handleEditPublisher, confirmDeletePublisher, handleVisitWebsite]
  );

  // Publisher form modal
  const renderPublisherForm = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {currentPublisher ? "Edit Penerbit" : "Tambah Penerbit Baru"}
          </Text>

          <ScrollView>
            <Text style={styles.inputLabel}>Nama *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Masukkan nama penerbit"
            />

            <Text style={styles.inputLabel}>Deskripsi</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Masukkan deskripsi penerbit"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.inputLabel}>Website</Text>
            <TextInput
              style={styles.input}
              value={website}
              onChangeText={setWebsite}
              placeholder="Masukkan alamat website"
              keyboardType="url"
            />

            <Text style={styles.inputLabel}>URL Logo</Text>
            <TextInput
              style={styles.input}
              value={logoUrl}
              onChangeText={setLogoUrl}
              placeholder="Masukkan URL logo penerbit"
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Masukkan alamat email"
              keyboardType="email-address"
            />

            <Text style={styles.inputLabel}>Telepon</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Masukkan nomor telepon"
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Lokasi</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Masukkan lokasi penerbit"
            />

            {/* <Text style={styles.inputLabel}>Negara</Text>
            <TextInput
              style={styles.input}
              value={country}
              onChangeText={setCountry}
              placeholder="Masukkan negara penerbit"
            />
            
            <Text style={styles.inputLabel}>Tahun Berdiri</Text>
            <TextInput
              style={styles.input}
              value={foundedYear}
              onChangeText={setFoundedYear}
              placeholder="Masukkan tahun berdiri"
              keyboardType="number-pad"
            /> */}
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
              onPress={handleSavePublisher}
            >
              <Text style={styles.saveButtonText}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  // Render bulk uploader modal
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
            <Text style={styles.modalTitle}>Import Penerbit</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowBulkUploader(false)}
            >
              <Ionicons name="close" size={24} color={CommonColors.gray600} />
            </TouchableOpacity>
          </View>

          <BulkUploader
            entityType="publishers"
            onComplete={(results) => {
              if (results.success) {
                // Refresh publisher list after successful upload
                fetchPublishers();
              }
              // Keep modal open to show results
            }}
          />

          <View style={styles.helpTextContainer}>
            <Text style={styles.helpText}>Format JSON untuk penerbit:</Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>
                {`{\n  "publishers": [\n    { "name": "Nama Penerbit", "description": "Deskripsi" },\n    { "name": "Penerbit Lain", "website": "example.com" }\n  ]\n}`}
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
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <LibraryHeader title="Penerbit" onBackPress={handleBackPress} />
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={CommonColors.gray400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari penerbit..."
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
        data={publishers}
        renderItem={renderPublisherItem}
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
                ? "Tidak ada penerbit yang cocok dengan pencarian Anda"
                : "Tidak ada penerbit yang tersedia"}
            </Text>
          )
        }
      />

      {/* Floating Action Button Menu */}
      <View style={styles.fabContainer}>
        {/* Add Publisher Button */}
        <Animated.View style={[styles.fabItem, addButtonAnimation]}>
          <TouchableOpacity
            style={[
              styles.fabSecondary,
              { backgroundColor: CommonColors.success },
            ]}
            onPress={handleAddPublisher}
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

      {renderPublisherForm()}
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
  publisherItem: {
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
  publisherLogo: {
    width: 60,
    height: 60,
    marginRight: Spacing.md,
    borderRadius: 4,
  },
  publisherInfo: {
    flex: 1,
  },
  publisherName: {
    fontSize: Typography.sizes.base,
    fontWeight: "bold",
    color: CommonColors.gray900,
    marginBottom: 4,
  },
  publisherDescription: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray700,
    marginBottom: 4,
  },
  websiteLink: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  websiteText: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.primary,
    marginLeft: 4,
  },
  contactLink: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  contactText: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.primary,
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.sm,
  },
  editButton: {
    backgroundColor: CommonColors.primary,
  },
  deleteButton: {
    backgroundColor: CommonColors.error,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: CommonColors.white,
    borderRadius: 8,
    width: "90%",
    maxHeight: "90%",
    padding: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: "bold",
    color: CommonColors.gray900,
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray700,
    marginBottom: 4,
  },
  input: {
    backgroundColor: CommonColors.gray50,
    borderRadius: 4,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray900,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: Spacing.md,
  },
  modalButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 4,
    marginLeft: Spacing.sm,
  },
  cancelButton: {
    backgroundColor: CommonColors.gray200,
  },
  saveButton: {
    backgroundColor: CommonColors.primary,
  },
  cancelButtonText: {
    color: CommonColors.gray700,
    fontWeight: "500",
  },
  saveButtonText: {
    color: CommonColors.white,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  closeButton: {
    padding: Spacing.sm,
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
  loading: {
    marginTop: Spacing.xxl,
  },
  errorText: {
    textAlign: "center",
    color: CommonColors.error,
    marginTop: Spacing.xxl,
  },
  emptyText: {
    textAlign: "center",
    color: CommonColors.gray600,
    marginTop: Spacing.xxl,
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

export default ManagePublishersScreen;
