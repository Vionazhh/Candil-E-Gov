import { Ionicons } from "@expo/vector-icons";
import { AudioModule, useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Components
import { AudioWaveform } from "@/components/AudioWaveform";
import { LibraryHeader } from "@/components/organisms/LibraryHeader";
import { PlayPauseButton } from "@/components/PlayPauseButton";

// Constants & Types
import { CommonColors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import bookService from "@/services/BookService";
import { Book } from "@/types/Book";
import { parseError } from "@/types/errors/AppError";

// Sample audio file
// Note: This is used as a fallback when local paths are specified but can't be
// loaded with require() which needs static string literals
const SAMPLE_AUDIO_URL = [
  require("@/assets/audio/sample.mp3"),
  require("@/assets/audio/Timontod.mp3"),
][Math.floor(Math.random() * 2)];

export default function AudiobookPlayer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [progress, setProgress] = useState(0);

  // Track if component is mounted to prevent cleanup on unmounted component
  const isMountedRef = useRef(true);

  // Check if running on web platform
  // const isWeb = Platform.OS === "web";

  // Use the audio player hook only if not on web
  const audioPlayer = useAudioPlayer();

  // Keep a reference to interval ID
  const statusUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to get formatted time
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Handle back button press
  const handleBackPress = useCallback(() => {
    Alert.alert(
      "Keluar dari Audiobook",
      "Apakah Anda yakin ingin keluar? Progres mendengar Anda akan disimpan.",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Keluar",
          style: "destructive",
          onPress: () => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(tabs)");
            }
          },
        },
      ]
    );
  }, []);

  // Set up cleanup on unmount
  useEffect(() => {
    return () => {
      // Mark component as unmounted
      isMountedRef.current = false;

      // Clear interval if it exists
      if (statusUpdateIntervalRef.current) {
        clearInterval(statusUpdateIntervalRef.current);
        statusUpdateIntervalRef.current = null;
      }

      // Safe cleanup of audio player
      try {
        if (audioPlayer && typeof audioPlayer.remove === "function") {
          audioPlayer.remove();
        }
      } catch (error) {
        console.log("Error cleaning up audio player", error);
      }
    };
  }, []);

  // If on web, show a message that audio is not available
  // if (isWeb) {
  //   return (
  //     <SafeAreaView style={styles.container}>
  //       <LibraryHeader
  //         title="Audiobook"
  //         onBackPress={handleBackPress}
  //         backgroundColor={CommonColors.primary}
  //       />
  //       <View style={styles.webContainer}>
  //         <Text style={styles.webMessage}>
  //           Fitur audiobook tidak tersedia di versi web
  //         </Text>
  //         <Text style={styles.webSubMessage}>
  //           Silakan unduh aplikasi untuk mendengarkan audiobook
  //         </Text>
  //         <TouchableOpacity style={styles.webButton} onPress={handleBackPress}>
  //           <Text style={styles.webButtonText}>Kembali</Text>
  //         </TouchableOpacity>
  //       </View>
  //     </SafeAreaView>
  //   );
  // }

  // Fetch book details
  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        setError("Book ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const bookData = await bookService.getBookById(id);
        setBook(bookData);
      } catch (error) {
        const appError = parseError(error);
        setError(appError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  // Audio setup
  useEffect(() => {
    // Skip audio setup on web
    // if (isWeb || !isMountedRef.current) return;

    const setupAudio = async () => {
      try {
        // Set audio mode
        await AudioModule.setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
        });

        // Get audio source - can be a remote URL or local file
        let audioSource = book?.audioUrl || SAMPLE_AUDIO_URL;
        let source;

        // Determine if it's a remote URL or local file
        const isRemoteUrl =
          typeof audioSource === "string" &&
          (audioSource.startsWith("http://") ||
            audioSource.startsWith("https://"));

        if (isRemoteUrl) {
          // For remote URLs, use uri property
          source = { uri: audioSource };
        } else {
          try {
            source = SAMPLE_AUDIO_URL;
          } catch (err) {
            console.error("Failed to load local audio file:", err);
          }
        }

        // Load the audio if component still mounted
        if (isMountedRef.current && audioPlayer) {
          audioPlayer.replace(source);

          // Set loop status
          if (isLooping) {
            audioPlayer.loop = true;
          }
        }

        // Update status when audio loads
        if (isMountedRef.current) {
          // Clean up previous interval if it exists
          if (statusUpdateIntervalRef.current) {
            clearInterval(statusUpdateIntervalRef.current);
          }

          statusUpdateIntervalRef.current = setInterval(() => {
            if (!isMountedRef.current) {
              // Clear interval if component unmounted
              if (statusUpdateIntervalRef.current) {
                clearInterval(statusUpdateIntervalRef.current);
                statusUpdateIntervalRef.current = null;
              }
              return;
            }

            if (audioPlayer?.isLoaded) {
              setPosition(audioPlayer.currentTime * 1000);
              setDuration(audioPlayer.duration * 1000);
              setIsPlaying(audioPlayer.playing);

              if (audioPlayer.duration > 0) {
                setProgress(audioPlayer.currentTime / audioPlayer.duration);
              }
            }
          }, 1000);
        }
      } catch (error) {
        console.error("Failed to load audio", error);
        if (isMountedRef.current) {
          setError("Failed to load audio");
        }
      }
    };

    if (!loading && book) {
      setupAudio();
    }
  }, [loading, book, isLooping, audioPlayer]);

  // Handle play/pause button press
  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await audioPlayer?.pause();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        await audioPlayer?.play();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error("Failed to play/pause audio", error);
    }
  };

  // Handle next button press
  const handleNext = async () => {
    try {
      // Skip forward 30 seconds
      const newPosition = Math.min(position / 1000 + 30, duration / 1000);
      await audioPlayer?.seekTo(newPosition);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Failed to skip forward", error);
    }
  };

  // Handle previous button press
  const handlePrevious = async () => {
    try {
      // Skip backward 30 seconds
      const newPosition = Math.max(position / 1000 - 30, 0);
      await audioPlayer?.seekTo(newPosition);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Failed to skip backward", error);
    }
  };

  // Handle loop button press
  const handleLoopToggle = async () => {
    try {
      const newLoopValue = !isLooping;
      if (audioPlayer) {
        audioPlayer.loop = newLoopValue;
      }
      setIsLooping(newLoopValue);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Failed to toggle loop", error);
    }
  };

  // Handle shuffle button press
  const handleShuffle = () => {
    // Shuffle functionality would be implemented here
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LibraryHeader
          title="Audiobook"
          onBackPress={handleBackPress}
          backgroundColor={CommonColors.primary}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CommonColors.primary} />
          <Text style={styles.loadingText}>Memuat audiobook...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error || !book) {
    return (
      <SafeAreaView style={styles.container}>
        <LibraryHeader
          title="Audiobook"
          onBackPress={handleBackPress}
          backgroundColor={CommonColors.primary}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || "Audiobook tidak ditemukan"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LibraryHeader
        title="Audiobook"
        onBackPress={handleBackPress}
        backgroundColor={CommonColors.primary}
      />

      {/* Cover Art */}
      <View style={styles.coverImageContainer}>
        {book?.coverUrl ? (
          <Image
            source={{ uri: book.coverUrl }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.coverImage, styles.placeholderCover]}>
            <Ionicons name="book" size={80} color={CommonColors.gray400} />
          </View>
        )}
      </View>

      {/* Book Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{book.title || "Unknown Title"}</Text>
        <Text style={styles.author}>
          {book.author?.name || "Unknown Author"}
        </Text>
      </View>

      {/* Audio Waveform */}
      <View style={styles.waveformContainer}>
        <AudioWaveform progress={progress} />
      </View>

      {/* Progress Display */}
      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleLoopToggle}
        >
          <Ionicons
            name={isLooping ? "repeat" : "repeat-outline"}
            size={24}
            color={isLooping ? CommonColors.primary : CommonColors.gray600}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={handlePrevious}>
          <Ionicons name="play-back" size={36} color={CommonColors.gray800} />
        </TouchableOpacity>

        <PlayPauseButton
          isPlaying={isPlaying}
          onPress={handlePlayPause}
          size={70}
        />

        <TouchableOpacity style={styles.controlButton} onPress={handleNext}>
          <Ionicons
            name="play-forward"
            size={36}
            color={CommonColors.gray800}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={handleShuffle}>
          <Ionicons
            name="shuffle-outline"
            size={24}
            color={CommonColors.gray600}
          />
        </TouchableOpacity>
      </View>
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
    fontSize: Typography.sizes.base,
    color: CommonColors.gray600,
    marginTop: Spacing.md,
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
  coverImageContainer: {
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  coverImage: {
    width: 260,
    height: 260,
    borderRadius: 8,
  },
  placeholderCover: {
    backgroundColor: CommonColors.gray200,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    alignItems: "center",
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: CommonColors.gray900,
    textAlign: "center",
  },
  author: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: CommonColors.gray600,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  waveformContainer: {
    marginVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl * 1.5,
    marginBottom: Spacing.xl,
  },
  timeText: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray600,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  controlButton: {
    padding: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  webContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  webMessage: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: CommonColors.gray900,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  webSubMessage: {
    fontSize: Typography.sizes.base,
    color: CommonColors.gray600,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  webButton: {
    backgroundColor: CommonColors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  webButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: CommonColors.white,
  },
});
