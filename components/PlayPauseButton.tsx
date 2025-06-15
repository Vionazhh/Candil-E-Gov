import { Ionicons } from '@expo/vector-icons';
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface PlayPauseButtonProps {
  isPlaying: boolean;
  onPress: () => void;
}

export const PlayPauseButton: React.FC<PlayPauseButtonProps> = ({
  isPlaying,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={onPress}
    >
      <Ionicons 
        name={isPlaying ? "pause" : "play"} 
        size={36} 
        color="white" 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#0066CC",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
