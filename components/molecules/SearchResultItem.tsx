import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Constants
import { CommonColors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";

// Types
type BookResult = {
  id: string;
  title: string;
  author?: { name: string };
  coverImage?: string;
  type: "book";
};

type CategoryResult = {
  id: string;
  title: string;
  type: "category";
};

type AuthorResult = {
  id: string;
  name: string;
  type: "author";
};

type SearchResultItemType = BookResult | CategoryResult | AuthorResult;

interface SearchResultItemProps {
  item: SearchResultItemType;
  onPress: () => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  item,
  onPress,
}) => {
  // Determine what type of item we're rendering
  const getItemDetails = () => {
    switch (item.type) {
      case "book":
        return {
          title: item.title || "Unknown Book",
          subtitle: item.author?.name || "Unknown Author",
          icon: "book-outline",
          image: item.coverImage,
        };
      case "category":
        return {
          title: item.title || "Unknown Category",
          subtitle: "Category",
          icon: "list-outline",
        };
      case "author":
        return {
          title: item.name || "Unknown Author",
          subtitle: "Author",
          icon: "person-outline",
        };
      default:
        return {
          title: "Unknown Item",
          subtitle: "",
          icon: "help-circle-outline",
        };
    }
  };

  const { title, subtitle, icon, image } = getItemDetails();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Left side - Image or Icon */}
      <View style={styles.imageContainer}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={24} color={CommonColors.gray600} />
          </View>
        )}
      </View>

      {/* Right side - Text Info */}
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      {/* Right arrow icon */}
      <Ionicons name="chevron-forward" size={20} color={CommonColors.gray400} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: CommonColors.gray200,
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 6,
    overflow: "hidden",
    marginRight: Spacing.md,
    backgroundColor: CommonColors.gray200,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: CommonColors.gray200,
    borderRadius: 6,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: Typography.sizes.base,
    fontWeight: "600",
    color: CommonColors.gray800,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: CommonColors.gray600,
  },
}); 