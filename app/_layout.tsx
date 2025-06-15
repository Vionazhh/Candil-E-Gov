import CustomSplashScreen from '@/components/CustomSplashScreen';
import { AppProvider } from '@/providers/AppProvider';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Prevent auto-hide of native splash
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore errors */
});

// Navigator memoized for performance
const RootNavigator = memo(function RootNavigator() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="books/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="books/borrow/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="books/category/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="books/category/list" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="books/read/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="books/listen/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="search" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="admin" options={{ headerShown: false, animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
});

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Wait for fonts to load
        if (fontsLoaded) {
          // Hide the native splash screen
          await SplashScreen.hideAsync();
          // Now app is ready but we'll show our custom splash
          setAppIsReady(true);
        }
      } catch (e) {
        console.warn('Error preparing app:', e);
      }
    }

    prepare();
  }, [fontsLoaded]);

  const onSplashAnimationComplete = useCallback(() => {
    // Custom splash animation completed
    setShowCustomSplash(false);
  }, []);

  if (!fontsLoaded || !appIsReady) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        {showCustomSplash ? (
          <CustomSplashScreen
            onAnimationComplete={onSplashAnimationComplete}
            duration={2000}
          />
        ) : (
          <RootNavigator />
        )}
      </AppProvider>
    </SafeAreaProvider>
  );
}
