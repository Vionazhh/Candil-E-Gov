import { CommonColors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Typography } from "@/constants/Typography";
import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef } from "react";
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchBar = forwardRef<TextInput, SearchBarProps>(
  ({ value, onChangeText, placeholder = "Search...", autoFocus = false }, ref) => {
    const handleClear = () => {
      onChangeText("");
    };

    return (
      <View style={styles.container}>
        <View style={styles.searchIconContainer}>
          <Ionicons name="search" size={20} color={CommonColors.gray500} />
        </View>
        <TextInput
          ref={ref}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={CommonColors.gray500}
          returnKeyType="search"
          clearButtonMode="never"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
        />
        {value.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Ionicons name="close-circle" size={18} color={CommonColors.gray500} />
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

// Add display name for debugging
SearchBar.displayName = "SearchBar";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CommonColors.gray100,
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
  },
  searchIconContainer: {
    padding: Spacing.xs,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: Typography.sizes.base,
    paddingHorizontal: Spacing.sm,
    color: CommonColors.gray800,
  },
  clearButton: {
    padding: Spacing.xs,
  },
}); 