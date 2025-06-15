import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { borrowService } from '@/services/BorrowService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AdminMenuItem {
  title: string;
  icon: any;
  route: string;
  color: string;
  description: string;
}

const AdminDashboard = () => {
  const [overdueBooksCount, setOverdueBooksCount] = useState<number | null>(null);

  // Check for overdue books on mount
  useEffect(() => {
    const checkOverdueBooks = async () => {
      try {
        const count = await borrowService.checkAllOverdueBorrows();
        setOverdueBooksCount(count);
      } catch (error) {
        console.error('Error checking overdue books:', error);
      }
    };

    checkOverdueBooks();
  }, []);

  // Admin menu items
  const menuItems: AdminMenuItem[] = [
    {
      title: 'Kelola Buku',
      icon: 'book-outline',
      route: '/admin/books',
      color: CommonColors.primary,
      description: 'Tambah, edit, atau hapus buku dari perpustakaan'
    },
    {
      title: 'Kelola Penulis',
      icon: 'person-circle-outline',
      route: '/admin/authors',
      color: CommonColors.primaryDark,
      description: 'Kelola data penulis buku'
    },
    {
      title: 'Kelola Kategori',
      icon: 'list-circle-outline',
      route: '/admin/categories',
      color: CommonColors.info,
      description: 'Atur kategori buku perpustakaan'
    },
    {
      title: 'Kelola Penerbit',
      icon: 'business-outline',
      route: '/admin/publishers',
      color: CommonColors.warning,
      description: 'Kelola informasi penerbit buku'
    },
    {
      title: 'Riwayat Peminjaman',
      icon: 'time',
      route: '/admin/borrows',
      color: CommonColors.error,
      description: 'Lihat dan kelola riwayat peminjaman buku'
    }
  ];

  // Navigate to a specific admin route
  const navigateTo = useCallback((route: string) => {
    router.push(route);
  }, []);

  // Render menu item
  const renderMenuItem = useCallback((item: AdminMenuItem) => (
    <TouchableOpacity
      key={item.title}
      style={styles.menuItem}
      onPress={() => navigateTo(item.route)}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={24} color={CommonColors.white} />
      </View>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemTitle}>{item.title}</Text>
        <Text style={styles.menuItemDescription}>{item.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={CommonColors.gray400} />
    </TouchableOpacity>
  ), [navigateTo]);

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel Admin</Text>
        <Text style={styles.headerSubtitle}>Kelola perpustakaan digital Anda</Text>
      </View>

      {overdueBooksCount !== null && overdueBooksCount > 0 && (
        <View style={styles.notificationCard}>
          <Ionicons name="alert-circle" size={24} color={CommonColors.white} />
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>
              {overdueBooksCount} buku terlambat dikembalikan
            </Text>
            <Text style={styles.notificationDescription}>
              Sistem telah mengembalikan buku-buku yang melewati tenggat waktu
            </Text>
          </View>
        </View>
      )}

      <View style={styles.menuContainer}>
        {menuItems.map(renderMenuItem)}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CommonColors.gray50,
  },
  header: {
    backgroundColor: CommonColors.primary,
    padding: Spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: CommonColors.white,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.white,
    opacity: 0.8,
  },
  notificationCard: {
    backgroundColor: CommonColors.error,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 8,
  },
  notificationContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  notificationTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: CommonColors.white,
  },
  notificationDescription: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.white,
    opacity: 0.9,
  },
  menuContainer: {
    padding: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CommonColors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: CommonColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: CommonColors.gray900,
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: Typography.sizes.xs,
    color: CommonColors.gray600,
  },
});

export default AdminDashboard; 