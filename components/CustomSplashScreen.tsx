import { CommonColors } from '@/constants/Colors';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface CustomSplashScreenProps {
  onAnimationComplete: () => void;
  imageSource?: any;
  backgroundColor?: string;
  duration?: number;
}

/**
 * A custom splash screen component with modern animation
 * Uses fade-in and scale animations for a visually appealing experience
 */
const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({
  onAnimationComplete,
  imageSource = require('../assets/images/splash.png'),
  backgroundColor = CommonColors.white,
  duration = 2000,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsReady(true);
      } catch (e) {
        console.warn('Error preparing splash screen:', e);
      }
    };

    prepare();
  }, []);

  useEffect(() => {
    if (isReady) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: duration * 0.4,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: duration * 0.3,
          useNativeDriver: true,
        }).start(() => {
          onAnimationComplete();
        });
      }, duration * 0.7);

      return () => clearTimeout(timer);
    }
  }, [isReady, fadeAnim, scaleAnim, duration, onAnimationComplete]);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Image
          source={imageSource}
          style={styles.responsiveImage}
          resizeMode="contain"
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  responsiveImage: {
    width: width * 1,
    // maxWidth: 300,
    // maxHeight: 300,
  },
});

export default CustomSplashScreen;