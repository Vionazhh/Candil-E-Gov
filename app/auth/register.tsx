import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail, validateName, validatePassword } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const {
    isLoading,
    isAuthenticated,
    error,
    register,
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
  }, [name, email, password, confirmPassword, clearError, error]);

  const onRegisterPress = async () => {
    const registrationData = {
      email,
      password,
      displayName: name,
    };
    
    const success = await register(registrationData);
    if (success) {
      router.replace('/(tabs)');
    }
  };

  const onLoginPress = () => {
    router.push('/auth/login');
  };

  // Form validation
  const isNameValid = !name || validateName(name);
  const isEmailValid = !email || validateEmail(email);
  const isPasswordValid = !password || validatePassword(password);
  const doPasswordsMatch = !confirmPassword || password === confirmPassword;
  const isFormValid = 
    name && email && password && confirmPassword && 
    isNameValid && isEmailValid && isPasswordValid && doPasswordsMatch;

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
            <Text style={styles.title}>DAFTAR</Text>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            {/* Error message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Text style={styles.label}>NAMA LENGKAP:</Text>
            <CustomInput
              placeholder="Masukkan nama lengkap"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              error={!isNameValid ? "Nama tidak boleh kosong" : undefined}
              leftIcon="person-outline"
            />

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

            <Text style={styles.label}>KONFIRMASI KATA SANDI:</Text>
            <CustomInput
              placeholder="Ketik ulang password anda"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={!doPasswordsMatch ? "Password tidak cocok" : undefined}
              leftIcon="shield-checkmark-outline"
            />

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                Dengan mendaftar, Anda menyetujui{' '}
                <Text style={styles.termsLink}>Syarat & Ketentuan</Text> serta{' '}
                <Text style={styles.termsLink}>Kebijakan Privasi</Text> kami.
              </Text>
            </View>

            <CustomButton
              title="DAFTAR"
              onPress={onRegisterPress}
              loading={isLoading}
              style={styles.registerButton}
              disabled={!isFormValid}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Sudah punya akun? </Text>
              <TouchableOpacity onPress={onLoginPress}>
                <Text style={styles.loginLink}>Masuk</Text>
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
  termsContainer: {
    marginVertical: Spacing.lg,
  },
  termsText: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray600,
    lineHeight: 20,
  },
  termsLink: {
    color: CommonColors.primary,
    fontWeight: Typography.weights.medium,
  },
  registerButton: {
    marginBottom: Spacing.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  loginText: {
    fontSize: Typography.sizes.base,
    color: CommonColors.gray600,
  },
  loginLink: {
    fontSize: Typography.sizes.base,
    color: CommonColors.primary,
    fontWeight: Typography.weights.semibold,
  },
}); 