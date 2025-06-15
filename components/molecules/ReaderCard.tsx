import { HomeScreenColors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ReaderCard = ({
  name,
  readingTime,
  backgroundColor,
  onPress,
  style,
}: {
  name: string;
  readingTime: string;
  backgroundColor: string;
  onPress: () => void;
  style: any;
}) => {
  // Get initials from name
  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.avatar, { backgroundColor }]}>
        <Text style={styles.initials}>{getInitials(name)}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.readingTime}>{readingTime}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginHorizontal: Spacing.sm,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  initials: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: HomeScreenColors.white,
  },
  name: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: HomeScreenColors.text,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  readingTime: {
    fontSize: Typography.sizes.xs,
    color: HomeScreenColors.textSecondary,
    textAlign: "center",
  },
});

export default ReaderCard;
