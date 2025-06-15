import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Components
import { Button } from '@/components/atoms/Button';
import { Ionicons } from '@expo/vector-icons';

// Types, Constants & Hooks
import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';

// Menu item component
interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

const MenuItem = ({ icon, title, subtitle, onPress }: MenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconContainer}>
      <Ionicons name={icon} size={24} color={CommonColors.primary} />
    </View>
    <View style={styles.menuTextContainer}>
      <Text style={styles.menuTitle}>{title}</Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={20} color={CommonColors.gray400} />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          } 
        },
      ]
    );
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleEditProfile = () => {
    Alert.alert('Coming Soon', 'Fitur edit profil sedang dalam pengembangan.');
  };

  const handleAbout = () => {
    Alert.alert('CANDIL eGov', 'Versi 1.0.0\nDibuat oleh Tim Pengembang CANDIL');
  };

  const handleHelp = () => {
    Alert.alert('Bantuan', 'Silakan hubungi kami di support@candil.co.id');
  };
  
  // Book management functions
  const handleGoToAdmin = () => {
    router.push('/admin');
  };
  
  // Check if user is admin (you should implement proper role checking)
  const isAdmin = user?.email?.includes('admin') || false;

  return (
      <ScrollView style={styles.content}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageText}>
                  {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'G'}
                </Text>
              </View>
            )}
          </View>
          
          {isAuthenticated ? (
            <>
              <Text style={styles.profileName}>{user?.displayName || 'Pengguna'}</Text>
              <Text style={styles.profileEmail}>{user?.email || ''}</Text>
              <Button 
                title="Edit Profil" 
                onPress={handleEditProfile} 
                style={styles.editButton} 
                textStyle={styles.editButtonText}
              />
            </>
          ) : (
            <>
              <Text style={styles.profileName}>Tamu</Text>
              <Text style={styles.profileEmail}>Silakan login untuk mengakses semua fitur</Text>
              <Button 
                title="Login" 
                onPress={handleLogin} 
                style={styles.loginButton} 
              />
            </>
          )}
        </View>

        {/* Admin Section - Only shown to admins */}
        {isAuthenticated && isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Dashboard</Text>
            
            <MenuItem 
              icon="book-outline" 
              title="Kelola Data" 
              subtitle="Tambah, edit atau hapus data" 
              onPress={handleGoToAdmin} 
            />
          </View>
        )}

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pengaturan</Text>
          
          {/* <MenuItem 
            icon="color-palette-outline" 
            title="Tema Aplikasi" 
            subtitle={theme.colorScheme === 'dark' ? 'Gelap' : 'Terang'} 
            onPress={handleThemeToggle} 
          /> */}
          
          <MenuItem 
            icon="color-palette-outline" 
            title="Tema Aplikasi" 
            subtitle="Aktif" 
            onPress={() => Alert.alert('Coming Soon', 'Fitur tema sedang dalam pengembangan.')} 
          />
          
          <MenuItem 
            icon="notifications-outline" 
            title="Notifikasi" 
            subtitle="Aktif" 
            onPress={() => Alert.alert('Coming Soon', 'Fitur notifikasi sedang dalam pengembangan.')} 
          />
          
          <MenuItem 
            icon="language-outline" 
            title="Bahasa" 
            subtitle="Indonesia" 
            onPress={() => Alert.alert('Coming Soon', 'Fitur bahasa sedang dalam pengembangan.')} 
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tentang</Text>
          
          <MenuItem 
            icon="information-circle-outline" 
            title="Tentang Aplikasi" 
            onPress={handleAbout} 
          />
          
          <MenuItem 
            icon="help-circle-outline" 
            title="Bantuan" 
            onPress={handleHelp} 
          />
          
          <MenuItem 
            icon="document-text-outline" 
            title="Syarat & Ketentuan" 
            onPress={() => Alert.alert('Coming Soon', 'Fitur syarat & ketentuan sedang dalam pengembangan.')} 
          />
        </View>

        {/* Logout Button */}
        {isAuthenticated && (
          <Button 
            title="Logout" 
            onPress={handleLogout} 
            style={styles.logoutButton} 
            textStyle={styles.logoutButtonText}
          />
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CommonColors.gray50,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: CommonColors.white,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: CommonColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: CommonColors.white,
  },
  profileName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: CommonColors.gray900,
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray600,
    marginBottom: Spacing.md,
  },
  editButton: {
    backgroundColor: CommonColors.gray100,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  editButtonText: {
    color: CommonColors.gray900,
    fontSize: Typography.sizes.sm,
  },
  loginButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  section: {
    backgroundColor: CommonColors.white,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: CommonColors.gray600,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: CommonColors.gray200,
  },
  menuIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  menuTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: CommonColors.gray900,
  },
  menuSubtitle: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray600,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: CommonColors.gray100,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  logoutButtonText: {
    color: CommonColors.error,
  },
  bottomSpacing: {
    height: Spacing.xxl,
  },
}); 