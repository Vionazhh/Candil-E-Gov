import BulkUploader from "@/components/admin/BulkUploader";
import { LibraryHeader } from "@/components/organisms/LibraryHeader";
import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { Author, authorService } from '@/services/AuthorService';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const ManageAuthorsScreen = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAuthor, setCurrentAuthor] = useState<Author | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [biography, setBiography] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Add a state for showing the bulk upload modal
  const [showBulkUploader, setShowBulkUploader] = useState(false);
  
  // FAB animation states
  const [isFabOpen, setIsFabOpen] = useState(false);
  const fabAnimation = useState(new Animated.Value(0))[0];
  
  // Fetch authors from firestore
  const fetchAuthors = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authorService.getAllAuthors();
      setAuthors(response.items);
    } catch (err) {
      console.error('Error fetching authors:', err);
      setError('Gagal memuat data penulis');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  // Load authors on component mount
  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);
  
  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAuthors();
  }, [fetchAuthors]);
  
  // Handle search
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);
  
  // Filter authors based on search query
  const filteredAuthors = authors.filter(author => 
    author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Delete author confirmation
  const confirmDeleteAuthor = useCallback((author: Author) => {
    Alert.alert(
      'Konfirmasi Hapus',
      `Apakah Anda yakin ingin menghapus penulis "${author.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: () => handleDeleteAuthor(author.id!)
        }
      ]
    );
  }, []);

  // Handle back button press
  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }, []);
  
  // Delete author
  const handleDeleteAuthor = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await authorService.delete(id);
      setAuthors(prevAuthors => prevAuthors.filter(author => author.id !== id));
      Alert.alert('Sukses', 'Penulis berhasil dihapus');
    } catch (err) {
      console.error('Error deleting author:', err);
      Alert.alert('Error', 'Gagal menghapus penulis');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Edit author
  const handleEditAuthor = useCallback((author: Author) => {
    setCurrentAuthor(author);
    setName(author.name);
    setBiography(author.biography || '');
    setImageUrl(author.imageUrl || '');
    setModalVisible(true);
  }, []);
  
  // Add new author
  const handleAddAuthor = useCallback(() => {
    setCurrentAuthor(null);
    setName('');
    setBiography('');
    setImageUrl('');
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
          outputRange: [0, -60]
        })
      }
    ],
    opacity: fabAnimation
  };
  
  const uploadButtonAnimation = {
    transform: [
      { scale: fabAnimation },
      {
        translateY: fabAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -140]
        })
      }
    ],
    opacity: fabAnimation
  };
  
  // Icon rotation for main FAB
  const rotateInterpolate = fabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });
  
  const rotateStyle = {
    transform: [{ rotate: rotateInterpolate }]
  };
  
  // Save author (create or update)
  const handleSaveAuthor = useCallback(async () => {
    try {
      if (!name) {
        Alert.alert('Error', 'Nama penulis harus diisi');
        return;
      }
      
      const authorData: Partial<Author> = {
        name,
        biography,
        imageUrl,
        // Add lowercase version for case-insensitive search
        nameLower: name.toLowerCase()
      };
      
      setLoading(true);
      
      if (currentAuthor) {
        // Update existing author
        await authorService.update(currentAuthor.id!, authorData);
        setAuthors(prevAuthors => 
          prevAuthors.map(author => 
            author.id === currentAuthor.id ? { ...author, ...authorData } : author
          )
        );
        Alert.alert('Sukses', 'Penulis berhasil diperbarui');
      } else {
        // Create new author
        const newAuthor = await authorService.create(authorData as Author);
        setAuthors(prevAuthors => [...prevAuthors, newAuthor]);
        Alert.alert('Sukses', 'Penulis berhasil ditambahkan');
      }
      
      setModalVisible(false);
    } catch (err) {
      console.error('Error saving author:', err);
      Alert.alert('Error', 'Gagal menyimpan data penulis');
    } finally {
      setLoading(false);
    }
  }, [name, biography, imageUrl, currentAuthor]);
  
  // Render author item
  const renderAuthorItem = useCallback(({ item }: { item: Author }) => (
    <View style={styles.authorItem}>
      <View style={styles.authorInfo}>
        <Text style={styles.authorName}>{item.name}</Text>
        {item.biography && (
          <Text style={styles.authorBio} numberOfLines={2}>
            {item.biography}
          </Text>
        )}
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditAuthor(item)}
        >
          <Ionicons name="pencil" size={18} color={CommonColors.white} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => confirmDeleteAuthor(item)}
        >
          <Ionicons name="trash" size={18} color={CommonColors.white} />
        </TouchableOpacity>
      </View>
    </View>
  ), [handleEditAuthor, confirmDeleteAuthor]);
  
  // Author form modal
  const renderAuthorForm = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {currentAuthor ? 'Edit Penulis' : 'Tambah Penulis Baru'}
          </Text>
          
          <ScrollView style={styles.formContainer}>
            <Text style={styles.inputLabel}>Nama</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Masukkan nama penulis"
            />
            
            <Text style={styles.inputLabel}>Biografi</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={biography}
              onChangeText={setBiography}
              placeholder="Masukkan biografi penulis"
              multiline
              numberOfLines={4}
            />
            
            <Text style={styles.inputLabel}>URL Foto</Text>
            <TextInput
              style={styles.input}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="Masukkan URL foto penulis"
            />
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
              onPress={handleSaveAuthor}
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
            <Text style={styles.modalTitle}>Import Penulis</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowBulkUploader(false)}
            >
              <Ionicons name="close" size={24} color={CommonColors.gray600} />
            </TouchableOpacity>
          </View>
          
          <BulkUploader 
            entityType="authors"
            onComplete={(results) => {
              if (results.success) {
                // Refresh author list after successful upload
                fetchAuthors();
              }
              // Keep modal open to show results
            }} 
          />
          
          <View style={styles.helpTextContainer}>
            <Text style={styles.helpText}>Format JSON untuk penulis:</Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>
                {`{\n  "authors": [\n    { "name": "Nama Penulis", "bio": "Biografi" },\n    { "name": "Penulis Lain", "nationality": "Indonesia" }\n  ]\n}`}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: CommonColors.gray600 }]}
            onPress={() => setShowBulkUploader(false)}
          >
            <Text style={styles.saveButtonText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LibraryHeader title="Penulis" onBackPress={handleBackPress}/>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={CommonColors.gray400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari penulis..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={CommonColors.gray400} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      <FlatList
        data={filteredAuthors}
        renderItem={renderAuthorItem}
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
                ? 'Tidak ada penulis yang cocok dengan pencarian Anda'
                : 'Tidak ada penulis yang tersedia'}
            </Text>
          )
        }
      />
      
      {/* Floating Action Button Menu */}
      <View style={styles.fabContainer}>
        {/* Add Author Button */}
        <Animated.View style={[styles.fabItem, addButtonAnimation]}>
          <TouchableOpacity
            style={[styles.fabSecondary, { backgroundColor: CommonColors.success }]}
            onPress={handleAddAuthor}
          >
            <Ionicons name="add" size={24} color={CommonColors.white} />
          </TouchableOpacity>
          <Text style={styles.fabLabel}>Tambah</Text>
        </Animated.View>
        
        {/* Bulk Import Button */}
        <Animated.View style={[styles.fabItem, uploadButtonAnimation]}>
          <TouchableOpacity
            style={[styles.fabSecondary, { backgroundColor: CommonColors.warning }]}
            onPress={handleBulkUpload}
          >
            <Ionicons name="cloud-upload" size={24} color={CommonColors.white} />
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
      
      {renderAuthorForm()}
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
    flexDirection: 'row',
    alignItems: 'center',
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
  authorItem: {
    flexDirection: 'row',
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
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: Typography.sizes.base,
    fontWeight: 'bold',
    color: CommonColors.gray900,
    marginBottom: 4,
  },
  authorBio: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray700,
  },
  actionsContainer: {
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'center',
    color: CommonColors.error,
    marginTop: Spacing.xl,
    fontSize: Typography.sizes.base,
  },
  emptyText: {
    textAlign: 'center',
    color: CommonColors.gray600,
    marginTop: Spacing.xl,
    fontSize: Typography.sizes.base,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: CommonColors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: CommonColors.gray900,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  formContainer: {
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: '500',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
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
    fontWeight: '500',
  },
  saveButtonText: {
    color: CommonColors.white,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
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
    fontFamily: 'monospace',
    fontSize: Typography.sizes.sm,
  },
  // FAB styles
  fabContainer: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    alignItems: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CommonColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: CommonColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabItem: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 0,
    right: 4,
  },
  fabLabel: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: CommonColors.white,
    fontSize: Typography.sizes.xs,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    marginTop: 5,
  }
});

export default ManageAuthorsScreen; 