import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import SocialButton from '@/components/atoms/SocialButton';
import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail, validatePassword } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const {
    isLoading,
    isAuthenticated,
    error,
    login,
    loginWithGoogle,
    forgotPassword,
    clearError,
  } = useAuth();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, router]);

  // Clear any authentication errors when form changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password, clearError, error]);

  const onLoginPress = async () => {
    const credentials = { email, password };
    const success = await login(credentials);
    if (success) {
      router.replace('/(tabs)');
    }
  };

  const onGoogleLoginPress = async () => {
    Alert.alert('Coming Soon', 'Fitur login google sedang dalam pengembangan.');
  };
  
  const onForgotPasswordPress = () => {
    Alert.alert('Coming Soon', 'Fitur lupa password sedang dalam pengembangan.');
  };

  const onRegisterPress = () => {
    router.push('/auth/register');
  };

  // Form validation
  const isEmailValid = !email || validateEmail(email);
  const isPasswordValid = !password || validatePassword(password);
  const isFormValid = email && password && isEmailValid && isPasswordValid;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              {/* Logo dots pattern */}
              <View style={styles.logoDotsContainer}>
                {[...Array(3)].map((_, rowIndex) => (
                  <View key={rowIndex} style={styles.logoRow}>
                    {[...Array(5)].map((_, dotIndex) => (
                      <View key={dotIndex} style={styles.logoDot} />
                    ))}
                  </View>
                ))}
              </View>
            </View>
            <Text style={styles.title}>MASUK</Text>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            {/* Error message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Text style={styles.label}>EMAIL:</Text>
            <CustomInput
              placeholder="Masukkan email anda"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!isEmailValid ? "Format email tidak valid" : undefined}
              leftIcon="mail-outline"
            />

            <Text style={styles.label}>KATA SANDI:</Text>
            <CustomInput
              placeholder="Ketik password anda"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={!isPasswordValid ? "Password minimal 6 karakter" : undefined}
              leftIcon="lock-closed-outline"
            />

            <TouchableOpacity
              onPress={onForgotPasswordPress}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
            </TouchableOpacity>

            <CustomButton
              title="MASUK"
              onPress={onLoginPress}
              loading={isLoading}
              style={styles.loginButton}
              disabled={!isFormValid}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau, login menggunakan</Text>
              <View style={styles.dividerLine} />
            </View>

            <SocialButton
              title="AKUN GOOGLE"
              onPress={onGoogleLoginPress}
              icon="google"
              style={styles.googleButton}
            />

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Belum punya akun? </Text>
              <TouchableOpacity onPress={onRegisterPress}>
                <Text style={styles.registerLink}>Daftar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CommonColors.white,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: CommonColors.primary,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'flex-start',
  },
  backButton: {
    marginBottom: Spacing.md,
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logoDotsContainer: {
    flexDirection: 'column',
  },
  logoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CommonColors.white,
    marginRight: 4,
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: CommonColors.white,
    letterSpacing: 2,
  },
  form: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  errorContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: CommonColors.error,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: CommonColors.gray700,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.xl,
  },
  forgotPasswordText: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.primary,
    fontWeight: Typography.weights.medium,
  },
  loginButton: {
    marginBottom: Spacing.lg,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: CommonColors.gray300,
  },
  dividerText: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray600,
    marginHorizontal: Spacing.sm,
  },
  googleButton: {
    marginBottom: Spacing.xl,
    backgroundColor: CommonColors.white,
    borderWidth: 1,
    borderColor: CommonColors.gray300,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  registerText: {
    fontSize: Typography.sizes.base,
    color: CommonColors.gray600,
  },
  registerLink: {
    fontSize: Typography.sizes.base,
    color: CommonColors.primary,
    fontWeight: Typography.weights.semibold,
  },
}); 