import BulkUploader from "@/components/admin/BulkUploader";
import { LibraryHeader } from "@/components/organisms/LibraryHeader";
import { CommonColors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import { Author, authorService } from "@/services/AuthorService";
import { bookService } from "@/services/BookService";
import { categoryService } from "@/services/CategoryService";
import publisherService from "@/services/PublisherService";
import type { Publisher } from "@/types/Book";
import { Book } from "@/types/Book";
import { Category } from "@/types/Category";
import {
  CLOUDINARY_AUDIO_UPLOAD_PRESET,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_PDF_UPLOAD_PRESET,
} from "@env";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

// File types and interfaces
interface FileInfo {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

interface UploadProgress {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

const ManageBooksScreen = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [publisherId, setPublisherId] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [description, setDescription] = useState("");
  const [publishYear, setPublishYear] = useState("");

  // New fields for audio and PDF
  const [audioFile, setAudioFile] = useState<FileInfo | null>(null);
  const [pdfFile, setPdfFile] = useState<FileInfo | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [audioUploadProgress, setAudioUploadProgress] =
    useState<UploadProgress>({
      isUploading: false,
      progress: 0,
      error: null,
    });
  const [pdfUploadProgress, setPdfUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  // Data for dropdowns
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);

  // Dropdown visibility states
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPublisherDropdown, setShowPublisherDropdown] = useState(false);

  // Add a state for showing the bulk upload modal
  const [showBulkUploader, setShowBulkUploader] = useState(false);

  // FAB animation states
  const [isFabOpen, setIsFabOpen] = useState(false);
  const fabAnimation = useState(new Animated.Value(0))[0];

  // Fetch reference data (authors, categories, publishers)
  const fetchReferenceData = useCallback(async () => {
    try {
      // Fetch authors
      const authorsResponse = await authorService.getAllAuthors(1, 100);
      setAuthors(authorsResponse.items);

      // Fetch categories
      const categoriesResponse = await categoryService.getAllCategories(1, 100);
      setCategories(categoriesResponse.items);

      // Fetch publishers
      const publishersResponse = await publisherService.getAllPublishers(
        1,
        100
      );

      if (publishersResponse?.items) {
        setPublishers(publishersResponse.items);
      } else {
        console.warn(
          "publishersResponse.items is missing!",
          publishersResponse
        );
      }
    } catch (err) {
      console.error("Error fetching reference data:", err);
    }
  }, []);

  // Helper to get author name from ID
  const getAuthorName = useCallback(
    (id: string) => {
      const author = authors.find((a) => a.id === id);
      return author ? author.name : "Tidak diketahui";
    },
    [authors]
  );

  // Helper to get category title from ID
  const getCategoryTitle = useCallback(
    (id: string) => {
      const category = categories.find((c) => c.id === id);
      return category ? category.title : "Tidak dikategorikan";
    },
    [categories]
  );

  // Helper to get publisher name from ID
  const getPublisherName = useCallback(
    (id: string) => {
      const publisher = publishers.find((p) => p.id === id);
      return publisher ? publisher.name : "Tidak diketahui";
    },
    [publishers]
  );

  // Fetch books from firestore
  const fetchBooks = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await bookService.getAllBooks();
      setBooks(response.items);

      // Also fetch reference data
      await fetchReferenceData();
    } catch (err) {
      console.error("Error fetching books:", err);
      setError("Gagal memuat data buku");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchReferenceData]);

  // Load books on component mount
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

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
    await fetchBooks();
  }, [fetchBooks]);

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
          outputRange: [0, 90],
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
          outputRange: [0, -70],
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

  // Filter books based on search query
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Delete book confirmation
  const confirmDeleteBook = useCallback((book: Book) => {
    Alert.alert(
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus buku "${book.title}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => handleDeleteBook(book.id),
        },
      ]
    );
  }, []);

  // Delete book
  const handleDeleteBook = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await bookService.delete(id);
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
      Alert.alert("Sukses", "Buku berhasil dihapus");
    } catch (err) {
      console.error("Error deleting book:", err);
      Alert.alert("Error", "Gagal menghapus buku");
    } finally {
      setLoading(false);
    }
  }, []);

  // File picker function - reusable for both audio and PDF
  // Upload function - reusable for both audio and PDF
  const uploadFile = async (
    fileInfo: FileInfo,
    folder: string,
    preset: string,
    setProgress: React.Dispatch<React.SetStateAction<UploadProgress>>,
    setUrl: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (!fileInfo) return;

    // Start upload
    setProgress({
      isUploading: true,
      progress: 0,
      error: null,
    });

    try {
      // Create form data for upload
      const formData = new FormData();

      // Extract file extension from filename
      const getFileExtension = (filename: string) => {
        return filename.split(".").pop()?.toLowerCase() || "";
      };

      // Get proper filename with extension
      const originalExtension = getFileExtension(fileInfo.name);
      const cleanFileName = fileInfo.name.replace(/[^a-zA-Z0-9.-]/g, "_"); // Clean filename

      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${cleanFileName}`;

      if (Platform.OS === "web") {
        // For web, fileInfo.uri should be a File object or we need to fetch it as a blob
        const fileObject = fileInfo.uri as any;
        if (typeof fileObject === "object" && fileObject !== null) {
          // If it's already a File object
          formData.append("file", fileObject);
        } else {
          // If it's a data URL or blob URL, fetch it as a blob
          const response = await fetch(fileInfo.uri);
          const blob = await response.blob();

          // Create a new File object with proper name and extension
          const file = new File([blob], uniqueFileName, {
            type: fileInfo.type,
          });
          formData.append("file", file);
        }
      } else {
        // For React Native, append as before but ensure filename has extension
        formData.append("file", {
          uri: fileInfo.uri,
          name: uniqueFileName,
          type: fileInfo.type,
        } as any);
      }

      formData.append("upload_preset", preset);
      formData.append("folder", folder);

      // Add public_id to control the filename in Cloudinary
      const publicId = `${folder}/${timestamp}_${fileInfo.name.split(".")[0]}`;
      formData.append("public_id", publicId);

      // Preserve original filename in context
      formData.append("context", `original_filename=${fileInfo.name}`);

      console.log("Uploading file:", uniqueFileName);
      console.log("Upload preset:", preset);
      console.log("Public ID:", publicId);

      // Use the correct Cloudinary upload URL for unsigned uploads
      const uploadUrl = preset.includes("audio")
        ? `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`
        : `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        
      // Upload with progress tracking
      if (Platform.OS === "web") {
        // For web, use XMLHttpRequest for better progress tracking
        const xhr = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const progress = event.loaded / event.total;
              setProgress((prev) => ({
                ...prev,
                progress,
              }));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
              try {
                const data = JSON.parse(xhr.responseText);
                if (data.secure_url) {
                  setUrl(data.secure_url);
                  setProgress({
                    isUploading: false,
                    progress: 1,
                    error: null,
                  });
                  resolve(data);
                } else {
                  throw new Error("Upload failed - no secure_url in response");
                }
              } catch (parseError) {
                console.error("Error parsing response:", parseError);
                throw new Error("Invalid response from server");
              }
            } else {
              console.log("Upload error:", xhr.responseText);
              throw new Error(`Upload failed with status ${xhr.status}`);
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Upload failed - network error"));
          });

          xhr.open("POST", uploadUrl);
          xhr.send(formData);
        });
      } else {
        // For native, use FileSystem with manual progress tracking
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 0.05;
          if (progress > 0.95) {
            clearInterval(progressInterval);
            progress = 0.95;
          }
          setProgress((prev) => ({
            ...prev,
            progress,
          }));
        }, 200);

        try {
          const uploadResponse = await FileSystem.uploadAsync(
            uploadUrl,
            fileInfo.uri,
            {
              httpMethod: "POST",
              uploadType: FileSystem.FileSystemUploadType.MULTIPART,
              fieldName: "file",
              parameters: {
                upload_preset: preset,
                folder: folder,
                public_id: publicId,
                context: `original_filename=${fileInfo.name}`,
              },
              mimeType: fileInfo.type,
            }
          );

          clearInterval(progressInterval);

          if (uploadResponse.status === 200) {
            const data = JSON.parse(uploadResponse.body);
            if (data.secure_url) {
              setUrl(data.secure_url);
              setProgress({
                isUploading: false,
                progress: 1,
                error: null,
              });
            } else {
              throw new Error("Upload failed - no secure_url in response");
            }
          } else {
            console.log("Upload error:", uploadResponse.body);
            throw new Error(
              `Upload failed with status ${uploadResponse.status}`
            );
          }
        } catch (err) {
          clearInterval(progressInterval);
          throw err;
        }
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setProgress({
        isUploading: false,
        progress: 0,
        error: "Failed to upload file",
      });
      Alert.alert("Upload Error", "Failed to upload file to cloud storage.");
    }
  };

  // File picker function - enhanced version
  const pickFile = async (
    fileType: "audio" | "pdf",
    setFile: React.Dispatch<React.SetStateAction<FileInfo | null>>,
    setProgress: React.Dispatch<React.SetStateAction<UploadProgress>>
  ) => {
    try {
      // Reset progress
      setProgress({
        isUploading: false,
        progress: 0,
        error: null,
      });

      // Set the accepted mime types based on file type
      const mimeTypes =
        fileType === "audio"
          ? [
              "audio/*",
              "audio/mpeg",
              "audio/mp3",
              "audio/wav",
              "audio/ogg",
              "audio/m4a",
            ]
          : ["application/pdf"];

      const result = await DocumentPicker.getDocumentAsync({
        type: mimeTypes,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const selectedFile = result.assets[0];

      // Ensure filename has proper extension
      let fileName = selectedFile.name;
      const hasExtension = fileName.includes(".");

      if (!hasExtension) {
        // Add extension based on file type if missing
        if (fileType === "audio") {
          fileName += ".mp3"; // Default audio extension
        } else {
          fileName += ".pdf"; // Default PDF extension
        }
      }

      const fileInfo: FileInfo = {
        uri: selectedFile.uri,
        name: fileName,
        type:
          selectedFile.mimeType ||
          (fileType === "audio" ? "audio/mpeg" : "application/pdf"),
        size: selectedFile.size,
      };

      console.log("Selected file info:", fileInfo);
      setFile(fileInfo);

      // Start upload immediately after picking
      uploadFile(
        fileInfo,
        fileType === "audio" ? "Candil/assets/audio" : "Candil/assets/pdf",
        fileType === "audio"
          ? CLOUDINARY_AUDIO_UPLOAD_PRESET
          : CLOUDINARY_PDF_UPLOAD_PRESET,
        setProgress,
        fileType === "audio" ? setAudioUrl : setPdfUrl
      );
    } catch (err) {
      console.error(`Error picking ${fileType} file:`, err);
      setProgress({
        isUploading: false,
        progress: 0,
        error: `Failed to pick ${fileType} file`,
      });
    }
  };

  // Shorthand functions for picking audio and PDF
  const pickAudioFile = useCallback(() => {
    pickFile("audio", setAudioFile, setAudioUploadProgress);
  }, []);

  const pickPdfFile = useCallback(() => {
    pickFile("pdf", setPdfFile, setPdfUploadProgress);
  }, []);

  // Edit book
  const handleEditBook = useCallback((book: Book) => {
    setCurrentBook(book);
    setTitle(book.title);
    setAuthorId(book.authorId || "");
    setCategoryId(book.categoryId || "");
    setPublisherId(book.publisherId || "");
    setCoverImage(book.coverImage || "");
    setDescription(book.description || "");
    setPublishYear(book.publishYear ? String(book.publishYear) : "");
    setAudioUrl(book.audioUrl || "");
    setPdfUrl(book.pdfUrl || "");
    setAudioFile(null);
    setPdfFile(null);
    setModalVisible(true);
  }, []);

  // Add new book
  const handleAddBook = useCallback(() => {
    setCurrentBook(null);
    setTitle("");
    setAuthorId("");
    setCategoryId("");
    setPublisherId("");
    setCoverImage("");
    setDescription("");
    setPublishYear("");
    setAudioUrl("");
    setPdfUrl("");
    setAudioFile(null);
    setPdfFile(null);
    setModalVisible(true);
    setIsFabOpen(false);
  }, []);

  // Handle bulk upload
  const handleBulkUpload = useCallback(() => {
    setShowBulkUploader(true);
    setIsFabOpen(false);
  }, []);

  // Close all dropdowns
  const closeAllDropdowns = useCallback(() => {
    setShowAuthorDropdown(false);
    setShowCategoryDropdown(false);
    setShowPublisherDropdown(false);
  }, []);

  // Save book (create or update)
  const handleSaveBook = useCallback(async () => {
    try {
      if (!title) {
        Alert.alert("Error", "Judul buku harus diisi");
        return;
      }

      // Check if there are ongoing uploads
      if (audioUploadProgress.isUploading || pdfUploadProgress.isUploading) {
        if (audioUploadProgress.error || pdfUploadProgress.error) {
          Alert.alert("Error", "Gagal mengupload file");
        } else {
          Alert.alert(
            "Upload in Progress",
            "Please wait for file uploads to complete before saving"
          );
        }
        return;
      }

      // Parse and validate publishYear
      let parsedPublishYear: number | undefined = undefined;
      if (publishYear) {
        try {
          const year = parseInt(publishYear);
          if (isNaN(year)) {
            Alert.alert("Error", "Tahun terbit harus berupa angka");
            return;
          }
          parsedPublishYear = year;
        } catch (e) {
          Alert.alert("Error", "Tahun terbit tidak valid");
          return;
        }
      } else {
        Alert.alert("Error", "Tahun terbit harus diisi");
        return;
      }

      const bookData: Partial<Book> = {
        title,
        authorId,
        categoryId,
        publisherId,
        coverImage,
        description,
        publishYear: parsedPublishYear,
        availability: "Available",
        audioUrl,
        pdfUrl,
      };

      setLoading(true);

      if (currentBook) {
        // Update existing book
        await bookService.update(currentBook.id, bookData);
        setBooks((prevBooks) =>
          prevBooks.map((book) =>
            book.id === currentBook.id ? { ...book, ...bookData } : book
          )
        );
        Alert.alert("Sukses", "Buku berhasil diperbarui");
      } else {
        // Create new book
        const newBook = await bookService.create(bookData as Book);
        setBooks((prevBooks) => [...prevBooks, newBook]);
        Alert.alert("Sukses", "Buku berhasil ditambahkan");
      }

      setModalVisible(false);
    } catch (err) {
      console.error("Error saving book:", err);
      Alert.alert("Error", "Gagal menyimpan buku");
    } finally {
      setLoading(false);
    }
  }, [
    title,
    authorId,
    categoryId,
    publisherId,
    coverImage,
    description,
    publishYear,
    audioUrl,
    pdfUrl,
    currentBook,
    audioUploadProgress.isUploading,
    pdfUploadProgress.isUploading,
  ]);

  // Render book item
  const renderBookItem = useCallback(
    ({ item }: { item: Book }) => (
      <View style={styles.bookItem}>
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.bookAuthor}>
            Penulis: {getAuthorName(item.authorId)}
          </Text>
          <Text style={styles.bookDetails}>
            Kategori: {getCategoryTitle(item.categoryId)}
          </Text>
          {item.publishYear && (
            <Text style={styles.bookDetails}>Tahun: {item.publishYear}</Text>
          )}
          <Text style={styles.bookStatus}>Status: {item.availability}</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditBook(item)}
          >
            <Ionicons name="pencil" size={18} color={CommonColors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => confirmDeleteBook(item)}
          >
            <Ionicons name="trash" size={18} color={CommonColors.white} />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [handleEditBook, confirmDeleteBook, getAuthorName, getCategoryTitle]
  );

  // Render dropdown component
  const renderDropdown = useCallback(
    (
      isVisible: boolean,
      items: any[],
      selectedId: string,
      onSelect: (id: string) => void,
      getDisplayName: (item: any) => string,
      emptyText: string
    ) => {
      if (!isVisible) return null;

      return (
        <View style={styles.dropdownOverlay}>
          <View style={styles.dropdownList}>
            <ScrollView
              style={styles.dropdownScrollView}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {items.length > 0 ? (
                items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      onSelect(item.id);
                      closeAllDropdowns();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        item.id === selectedId && styles.dropdownItemSelected,
                      ]}
                    >
                      {getDisplayName(item)}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.dropdownEmptyText}>{emptyText}</Text>
              )}
            </ScrollView>
          </View>
        </View>
      );
    },
    [closeAllDropdowns]
  );

  // Render upload progress component
  const renderUploadProgress = (progress: UploadProgress) => {
    if (!progress.isUploading && !progress.error && progress.progress === 0) {
      return null;
    }

    if (progress.error) {
      return (
        <View style={styles.uploadError}>
          <Text style={styles.uploadErrorText}>{progress.error}</Text>
        </View>
      );
    }

    if (progress.isUploading) {
      return (
        <View style={styles.progressContainer}>
          {/* Use custom progress bar for all platforms */}
          <View style={styles.customProgressBar}>
            <View
              style={[
                styles.customProgressFill,
                { width: `${progress.progress * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progress.progress * 100)}%
          </Text>
        </View>
      );
    }

    if (progress.progress === 1) {
      return (
        <View style={styles.uploadSuccess}>
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={CommonColors.success}
          />
          <Text style={styles.uploadSuccessText}>Upload successful</Text>
        </View>
      );
    }

    return null;
  };

  // Book form modal
  const renderBookForm = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        closeAllDropdowns();
        setModalVisible(false);
      }}
    >
      <SafeAreaView style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={closeAllDropdowns}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.modalTitle}>
              {currentBook ? "Edit Buku" : "Tambah Buku Baru"}
            </Text>

            <ScrollView
              style={styles.formContainer}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputLabel}>Judul</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Masukkan judul buku"
                onFocus={closeAllDropdowns}
              />

              {/* Author Dropdown */}
              <Text style={styles.inputLabel}>Penulis</Text>
              <View
                style={[
                  styles.dropdownContainer,
                  showAuthorDropdown && styles.dropdownContainerActive,
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.dropdownButton,
                    showAuthorDropdown && styles.dropdownButtonActive,
                  ]}
                  onPress={() => {
                    setShowAuthorDropdown(!showAuthorDropdown);
                    setShowCategoryDropdown(false);
                    setShowPublisherDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownButtonText}>
                    {authorId ? getAuthorName(authorId) : "Pilih Penulis"}
                  </Text>
                  <Ionicons
                    name={showAuthorDropdown ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={CommonColors.gray600}
                  />
                </TouchableOpacity>

                {renderDropdown(
                  showAuthorDropdown,
                  authors,
                  authorId,
                  setAuthorId,
                  (author) => author.name,
                  "Tidak ada data penulis"
                )}
              </View>

              {/* Category Dropdown */}
              <Text style={styles.inputLabel}>Kategori</Text>
              <View
                style={[
                  styles.dropdownContainer,
                  showCategoryDropdown && styles.dropdownContainerActive,
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.dropdownButton,
                    showCategoryDropdown && styles.dropdownButtonActive,
                  ]}
                  onPress={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowAuthorDropdown(false);
                    setShowPublisherDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownButtonText}>
                    {categoryId
                      ? getCategoryTitle(categoryId)
                      : "Pilih Kategori"}
                  </Text>
                  <Ionicons
                    name={showCategoryDropdown ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={CommonColors.gray600}
                  />
                </TouchableOpacity>

                {renderDropdown(
                  showCategoryDropdown,
                  categories,
                  categoryId,
                  setCategoryId,
                  (category) => category.title,
                  "Tidak ada data kategori"
                )}
              </View>

              {/* Publisher Dropdown */}
              <Text style={styles.inputLabel}>Penerbit</Text>
              <View
                style={[
                  styles.dropdownContainer,
                  showPublisherDropdown && styles.dropdownContainerActive,
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.dropdownButton,
                    showPublisherDropdown && styles.dropdownContainerActive,
                    showPublisherDropdown && styles.dropdownButtonActive,
                  ]}
                  onPress={() => {
                    setShowPublisherDropdown(!showPublisherDropdown);
                    setShowAuthorDropdown(false);
                    setShowCategoryDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownButtonText}>
                    {publisherId
                      ? getPublisherName(publisherId)
                      : "Pilih Penerbit (Opsional)"}
                  </Text>
                  <Ionicons
                    name={showPublisherDropdown ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={CommonColors.gray600}
                  />
                </TouchableOpacity>

                {renderDropdown(
                  showPublisherDropdown,
                  publishers,
                  publisherId,
                  setPublisherId,
                  (publisher) => publisher.name,
                  "Tidak ada data penerbit"
                )}
              </View>

              <Text style={styles.inputLabel}>URL Cover Image</Text>
              <TextInput
                style={styles.input}
                value={coverImage}
                onChangeText={setCoverImage}
                placeholder="Masukkan URL gambar cover"
                onFocus={closeAllDropdowns}
              />

              <Text style={styles.inputLabel}>Deskripsi</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Masukkan deskripsi buku"
                multiline
                numberOfLines={4}
                onFocus={closeAllDropdowns}
              />

              <Text style={styles.inputLabel}>Tahun Terbit</Text>
              <TextInput
                style={styles.input}
                value={publishYear}
                onChangeText={setPublishYear}
                placeholder="Masukkan tahun terbit"
                keyboardType="numeric"
                onFocus={closeAllDropdowns}
              />

              {/* Audio File Upload */}
              <Text style={styles.inputLabel}>Audio File</Text>
              <View style={styles.fileUploadContainer}>
                <TouchableOpacity
                  style={styles.filePickerButton}
                  onPress={pickAudioFile}
                  disabled={audioUploadProgress.isUploading}
                >
                  <Ionicons
                    name="musical-note"
                    size={18}
                    color={CommonColors.white}
                  />
                  <Text style={styles.filePickerButtonText}>
                    {audioFile ? "Change Audio File" : "Pick Audio File"}
                  </Text>
                </TouchableOpacity>

                {audioFile && (
                  <View style={styles.fileInfoContainer}>
                    <Ionicons
                      name="document-attach"
                      size={16}
                      color={CommonColors.primary}
                    />
                    <Text style={styles.fileNameText} numberOfLines={1}>
                      {audioFile.name}
                    </Text>
                    {audioUrl && (
                      <TouchableOpacity
                        onPress={() => {
                          setAudioFile(null);
                          setAudioUrl("");
                        }}
                        style={styles.removeFileButton}
                      >
                        <Ionicons
                          name="close-circle"
                          size={16}
                          color={CommonColors.error}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {!audioFile && audioUrl && (
                  <View style={styles.fileInfoContainer}>
                    <Ionicons
                      name="musical-note"
                      size={16}
                      color={CommonColors.success}
                    />
                    <Text style={styles.fileNameText} numberOfLines={1}>
                      Audio file already uploaded
                    </Text>
                    <TouchableOpacity
                      onPress={() => setAudioUrl("")}
                      style={styles.removeFileButton}
                    >
                      <Ionicons
                        name="close-circle"
                        size={16}
                        color={CommonColors.error}
                      />
                    </TouchableOpacity>
                  </View>
                )}

                {renderUploadProgress(audioUploadProgress)}
              </View>

              {/* PDF File Upload */}
              <Text style={styles.inputLabel}>PDF File</Text>
              <View style={styles.fileUploadContainer}>
                <TouchableOpacity
                  style={styles.filePickerButton}
                  onPress={pickPdfFile}
                  disabled={pdfUploadProgress.isUploading}
                >
                  <Ionicons
                    name="document"
                    size={18}
                    color={CommonColors.white}
                  />
                  <Text style={styles.filePickerButtonText}>
                    {pdfFile ? "Change PDF File" : "Pick PDF File"}
                  </Text>
                </TouchableOpacity>

                {pdfFile && (
                  <View style={styles.fileInfoContainer}>
                    <Ionicons
                      name="document-attach"
                      size={16}
                      color={CommonColors.primary}
                    />
                    <Text style={styles.fileNameText} numberOfLines={1}>
                      {pdfFile.name}
                    </Text>
                    {pdfUrl && (
                      <TouchableOpacity
                        onPress={() => {
                          setPdfFile(null);
                          setPdfUrl("");
                        }}
                        style={styles.removeFileButton}
                      >
                        <Ionicons
                          name="close-circle"
                          size={16}
                          color={CommonColors.error}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {!pdfFile && pdfUrl && (
                  <View style={styles.fileInfoContainer}>
                    <Ionicons
                      name="document"
                      size={16}
                      color={CommonColors.success}
                    />
                    <Text style={styles.fileNameText} numberOfLines={1}>
                      PDF file already uploaded
                    </Text>
                    <TouchableOpacity
                      onPress={() => setPdfUrl("")}
                      style={styles.removeFileButton}
                    >
                      <Ionicons
                        name="close-circle"
                        size={16}
                        color={CommonColors.error}
                      />
                    </TouchableOpacity>
                  </View>
                )}

                {renderUploadProgress(pdfUploadProgress)}
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  closeAllDropdowns();
                  setModalVisible(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveBook}
              >
                <Text style={styles.saveButtonText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
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
            <Text style={styles.modalTitle}>Import Buku</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowBulkUploader(false)}
            >
              <Ionicons name="close" size={24} color={CommonColors.gray600} />
            </TouchableOpacity>
          </View>

          <BulkUploader
            entityType="books"
            onComplete={(results) => {
              if (results.success) {
                // Refresh book list after successful upload
                fetchBooks();
              }
              // Keep modal open to show results
            }}
          />

          <View style={styles.helpTextContainer}>
            <Text style={styles.helpText}>Format JSON untuk buku:</Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>
                {`{\n  "books": [\n    { "title": "Judul Buku", "author": "Nama Penulis", "category": "Kategori", "publisher": "Nama Penerbit" },\n    { "title": "Buku Lain", "author": "Penulis Lain", "category": "Kategori Lain", "publisher": "Penerbit" }\n  ]\n}`}
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
      <LibraryHeader title="Buku" onBackPress={handleBackPress} />
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={CommonColors.gray400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari buku..."
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
        data={filteredBooks}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
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
                ? "Tidak ada buku yang cocok dengan pencarian Anda"
                : "Tidak ada buku yang tersedia"}
            </Text>
          )
        }
      />

      {/* Floating Action Button Menu */}
      <View style={styles.fabContainer}>
        {/* Add Book Button */}
        <Animated.View style={[styles.fabItem, addButtonAnimation]}>
          <TouchableOpacity
            style={[
              styles.fabSecondary,
              { backgroundColor: CommonColors.success },
            ]}
            onPress={handleAddBook}
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

      {renderBookForm()}
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
  bookItem: {
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
  bookInfo: {
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
    color: CommonColors.gray700,
    marginBottom: 2,
  },
  bookDetails: {
    fontSize: Typography.sizes.xs,
    color: CommonColors.gray600,
    marginBottom: 2,
  },
  bookStatus: {
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
  modalBackdrop: {
    flex: 1,
    width: "100%",
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dropdownContainer: {
    marginBottom: Spacing.md,
    position: "relative",
  },
  dropdownContainerActive: {
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: CommonColors.gray300,
    borderRadius: 8,
    padding: Spacing.sm,
    backgroundColor: CommonColors.white,
  },
  dropdownButtonActive: {
    borderColor: CommonColors.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownButtonText: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray800,
    flex: 1,
  },
  dropdownOverlay: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 1001,
    backgroundColor: CommonColors.white,
    borderWidth: 1,
    borderColor: CommonColors.primary,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    shadowColor: CommonColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownList: {
    flex: 1,
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: CommonColors.gray100,
  },
  dropdownItemText: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray800,
  },
  dropdownItemSelected: {
    color: CommonColors.primary,
    fontWeight: "500",
  },
  dropdownEmptyText: {
    textAlign: "center",
    padding: Spacing.md,
    color: CommonColors.gray500,
    fontSize: Typography.sizes.sm,
    fontStyle: "italic",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: CommonColors.gray100,
    borderWidth: 1,
    borderColor: CommonColors.gray300,
  },
  cancelButtonText: {
    color: CommonColors.gray700,
    fontSize: Typography.sizes.sm,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: CommonColors.primary,
  },
  saveButtonText: {
    color: CommonColors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: "500",
  },
  fabContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    alignItems: "center",
  },
  fabItem: {
    alignItems: "center",
    marginBottom: 16,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CommonColors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: CommonColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
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
    shadowRadius: 4,
    elevation: 4,
  },
  fabLabel: {
    fontSize: Typography.sizes.xs,
    color: CommonColors.gray700,
    marginTop: 4,
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
    marginBottom: Spacing.lg,
  },
  closeButton: {
    padding: 4,
  },
  helpTextContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  helpText: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray700,
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  codeBlock: {
    backgroundColor: CommonColors.gray100,
    borderRadius: 8,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: CommonColors.primary,
  },
  codeText: {
    fontSize: Typography.sizes.xs,
    color: CommonColors.gray800,
    fontFamily: "monospace",
    lineHeight: 16,
  },
  fileUploadContainer: {
    marginBottom: Spacing.md,
  },
  filePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CommonColors.primary,
    padding: Spacing.sm,
    borderRadius: 6,
    justifyContent: "center",
  },
  filePickerButtonText: {
    color: CommonColors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: "500",
    marginLeft: Spacing.xs,
  },
  fileInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
    backgroundColor: CommonColors.gray100,
    padding: Spacing.xs,
    borderRadius: 6,
  },
  fileNameText: {
    fontSize: Typography.sizes.xs,
    color: CommonColors.gray800,
    marginLeft: Spacing.xs,
    flex: 1,
  },
  removeFileButton: {
    padding: 4,
  },
  progressContainer: {
    marginTop: Spacing.xs,
  },
  progressText: {
    fontSize: Typography.sizes.xs,
    color: CommonColors.gray600,
    textAlign: "right",
    marginTop: 2,
  },
  uploadSuccess: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  uploadSuccessText: {
    fontSize: Typography.sizes.xs,
    color: CommonColors.success,
    marginLeft: 4,
  },
  uploadError: {
    marginTop: Spacing.xs,
    backgroundColor: CommonColors.error + "20", // Light version of error color
    padding: Spacing.xs,
    borderRadius: 4,
  },
  uploadErrorText: {
    fontSize: Typography.sizes.xs,
    color: CommonColors.error,
  },
  customProgressBar: {
    height: 6,
    width: "100%",
    backgroundColor: CommonColors.gray200,
    borderRadius: 3,
    overflow: "hidden",
  },
  customProgressFill: {
    height: "100%",
    backgroundColor: CommonColors.primary,
    borderRadius: 3,
  },
});

export default ManageBooksScreen;
