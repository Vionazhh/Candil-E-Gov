import { getTabIcon, tabConfig } from "@/config/navigation";
import { CommonColors, HomeScreenColors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Tab navigation layout using a custom top tab bar
 */
export default function TabLayout() {
  const [activeTab, setActiveTab] = useState("index");
  const router = useRouter();

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    
    // Navigate to the appropriate tab
    switch (tabName) {
      case "index":
        router.replace("/(tabs)");
        break;
      case "book":
        router.replace("/(tabs)/book");
        break;
      case "borrowings":
        router.replace("/(tabs)/borrowings");
        break;
      case "profile":
        router.replace("/(tabs)/profile");
        break;
      default:
        router.replace("/(tabs)");
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header with Logo and Search */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.logoText}>
            <Text style={styles.libraryText}>e-Library</Text>
            <Text style={styles.candilText}>CANDIL</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={() => router.push("/search")}
        >
          <Ionicons name="search" size={20} color={CommonColors.gray600} />
        </TouchableOpacity>
      </View>

      {/* Custom Top Tab Navigation */}
      <View style={styles.tabBar}>
        {tabConfig.screens.map((tab) => {
          const isActive = activeTab === tab.name;
          
          return (
            <TouchableOpacity
              key={tab.name}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => handleTabPress(tab.name)}
            >
              <Ionicons
                name={getTabIcon(tab.name, isActive)}
                size={20}
                color={isActive ? CommonColors.primary : CommonColors.gray600}
                style={styles.tabIcon}
              />
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content Area */}
      <View style={styles.contentContainer}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: "none" }, // Hide the default tab bar
          }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="book" />
          <Tabs.Screen name="borrowings" />
          <Tabs.Screen name="profile" />
        </Tabs>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CommonColors.white,
    paddingTop: Platform.OS === 'ios' ? 0 : Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    paddingTop: Spacing.lg,
    backgroundColor: CommonColors.white,
    borderBottomWidth: 1,
    borderBottomColor: CommonColors.gray200,
  },
  logo: {
    height: 30,
    width: 30,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIcon: {
    width: 40,
    height: 40,
    backgroundColor: HomeScreenColors.background,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  logoText: {
    flexDirection: "column",
  },
  libraryText: {
    fontSize: Typography.sizes.sm,
    color: HomeScreenColors.readerYellow,
    fontWeight: Typography.weights.medium,
  },
  candilText: {
    fontSize: Typography.sizes.lg,
    color: CommonColors.primaryDark,
    fontWeight: Typography.weights.bold,
    marginTop: -2,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CommonColors.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: CommonColors.white,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: CommonColors.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: CommonColors.primary,
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabText: {
    fontSize: Typography.sizes.xs,
    color: CommonColors.gray600,
    fontFamily: Typography.fontFamily.medium,
  },
  activeTabText: {
    color: CommonColors.primary,
    fontFamily: Typography.fontFamily.semibold,
  },
  contentContainer: {
    flex: 1,
  },
});
