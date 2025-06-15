import React, { memo, useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Components
import CategoryItem from '@/components/molecules/CategoryItem';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import PromoBanner from '@/components/organisms/PromoBanner';

// Types, Constants & Hooks
import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { useCategories, useHomeScreen } from '@/hooks';
import { useAuth } from '@/hooks/useAuth';
import { Category } from '@/types/Category';
import { Reader } from '@/types/Reader';
import { logger } from '@/utils/logger';

// Memoized components for better performance
const MemoizedCategoryItem = memo(CategoryItem);
const MemoizedSectionHeader = memo(SectionHeader);
const MemoizedPromoBanner = memo(PromoBanner);

// Reader Circle component for the screenshot design
const ReaderCircle = ({ reader, rank, onPress }: { reader: Reader; rank: number; onPress: () => void }) => {
  // First letter of the name for placeholder
  const initial = reader.name.charAt(0).toUpperCase();

  return (
    <TouchableOpacity style={styles.readerCircleContainer} onPress={onPress}>
      <View style={[styles.readerCircle, { backgroundColor: reader.backgroundColor }]}>
        <Text style={styles.readerInitial}>{initial}</Text>
      </View>
      <Text style={styles.readerName} numberOfLines={1}>{reader.name}</Text>
      <Text style={styles.readerTime}>{reader.readingTime}</Text>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const { user } = useAuth();
  const { categories } = useCategories();

  const {
    showBanner,
    topReaders,
    isRefreshing,
    handleBannerClose,
    handleBannerAction,
    handleCategoryPress,
    handleReaderPress,
    handleSeeAllReaders,
    handleSeeAllCategories,
    refreshData,
  } = useHomeScreen();

  // Get top categories for display (max 10)
  const topCategories = categories.filter(category => category.featured).slice(0, 10);
  
  // Prepare categories for the 2-column grid display
  const leftCategories = topCategories.filter((_, index) => index % 2 === 0);
  const rightCategories = topCategories.filter((_, index) => index % 2 === 1);

  // Render functions
  const renderCategoryItem = useCallback(({ item, index }: { item: Category, index: number }) => (
    <MemoizedCategoryItem
      title={item.title}
      onPress={() => handleCategoryPress(item)}
      style={index === leftCategories.length - 1 && leftCategories.length === rightCategories.length ? styles.lastCategoryItem : undefined}
    />
  ), [handleCategoryPress, leftCategories.length, rightCategories.length]);

  return (
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={refreshData} 
            colors={[CommonColors.primary]}
            tintColor={CommonColors.primary}
          />
        }
      >
        {/* Promo Banner */}
        {showBanner && (
          <MemoizedPromoBanner
            title="Jangan lewatkan kesempatan untuk melihat koleksi buku-buku terbaru yang tersedia di tahun 2024!"
            subtitle="Koleksi terbaru CANDIL 2024"
            ctaText="Lihat Sekarang"
            onPress={handleBannerAction}
            onClose={handleBannerClose}
          />
        )}

        {/* Top Readers Section */}
        <View style={styles.sectionContainer}>
          <MemoizedSectionHeader
            title="Pembaca terbaik!"
            onActionPress={handleSeeAllReaders}
          />
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.readersContainer}
          >
            {topReaders.map((reader, index) => (
              <ReaderCircle
                key={reader.id}
                reader={reader}
                rank={index + 1}
                onPress={() => handleReaderPress(reader)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionContainer}>
          <MemoizedSectionHeader
            title="Kategori Buku"
            actionText="Selengkapnya"
            onActionPress={handleSeeAllCategories}
          />
          
          <View style={styles.categoriesContainer}>
            <View style={styles.categoriesColumn}>
              <FlatList
                data={leftCategories}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
            
            <View style={styles.categoriesColumn}>
              <FlatList
                data={rightCategories}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          </View>
        </View>

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
  headerSection: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: CommonColors.white,
  },
  logo: {
    height: 40,
    width: 120,
  },
  sectionContainer: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  readersContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  readerCircleContainer: {
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
    width: 75,
  },
  readerCircle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  readerInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CommonColors.white,
  },
  readerName: {
    fontSize: 12,
    fontWeight: '500',
    color: CommonColors.gray800,
    textAlign: 'center',
  },
  readerTime: {
    fontSize: 10,
    color: CommonColors.gray600,
    marginTop: 2,
  },
  categoriesContainer: {
    flexDirection: 'row',
    backgroundColor: CommonColors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: Spacing.xs,
    shadowColor: CommonColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoriesColumn: {
    flex: 1,
  },
  lastCategoryItem: {
    borderBottomWidth: 0,
  },
  bottomSpacing: {
    height: Spacing.xxl,
  },
}); 