import { CommonColors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/hooks/useAuth";
import { router, Stack } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Check if user is admin (proper implementation should check roles)
  const isAdmin = user?.email?.includes("admin") || false; // For testing only

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.replace("/auth/login");
    }
  }, [isLoading, isAuthenticated, isAdmin]);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={CommonColors.primary} />
        <Text style={{ marginTop: Spacing.md, color: CommonColors.gray600 }}>
          Memeriksa akses...
        </Text>
      </SafeAreaView>
    );
  }

  // Show unauthorized message if not admin
  if (!isAdmin && !isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: Spacing.xl,
        }}
      >
        <Text
          style={{
            fontSize: Typography.sizes.lg,
            fontWeight: "bold",
            color: CommonColors.error,
            marginBottom: Spacing.md,
          }}
        >
          Akses Ditolak
        </Text>
        <Text
          style={{
            fontSize: Typography.sizes.base,
            textAlign: "center",
            color: CommonColors.gray600,
          }}
        >
          Anda tidak memiliki izin untuk mengakses halaman admin.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: CommonColors.primary,
        },
        headerTintColor: CommonColors.white,
        headerBackTitle: "Kembali",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerShown: false,
      }}
    >
      <Stack.Screen name="books" options={{ title: "Kelola Buku" }} />
      <Stack.Screen name="authors" options={{ title: "Kelola Penulis" }} />
      <Stack.Screen name="categories" options={{ title: "Kelola Kategori" }} />
      <Stack.Screen name="publishers" options={{ title: "Kelola Penerbit" }} />
      <Stack.Screen name="borrows" options={{ title: "Riwayat Peminjaman" }} />
    </Stack>
  );
}
