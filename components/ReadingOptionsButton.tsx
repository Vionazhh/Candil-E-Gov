import { CommonColors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface ReadingOptionsButtonProps {
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
}

/**
 * Floating action button with reading options
 */
export const ReadingOptionsButton: React.FC<ReadingOptionsButtonProps> = ({
  onIncreaseFontSize,
  onDecreaseFontSize,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];
  
  // Button press animation
  const handlePress = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Toggle menu visibility
    setMenuVisible(!menuVisible);
  };
  
  return (
    <>
      {/* Floating action button */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={CommonColors.white} />
        </TouchableOpacity>
      </Animated.View>
      
      {/* Options modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.optionsContainer}>
                <Text style={styles.optionsTitle}>Pengaturan Bacaan</Text>
                
                {/* Font size options */}
                <View style={styles.optionRow}>
                  <Text style={styles.optionLabel}>Ukuran Teks</Text>
                  <View style={styles.optionControls}>
                    <TouchableOpacity 
                      style={styles.optionButton}
                      onPress={() => {
                        onDecreaseFontSize();
                        setMenuVisible(false);
                      }}
                    >
                      <Ionicons name="remove" size={20} color={CommonColors.gray700} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.optionButton}
                      onPress={() => {
                        onIncreaseFontSize();
                        setMenuVisible(false);
                      }}
                    >
                      <Ionicons name="add" size={20} color={CommonColors.gray700} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Close button */}
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setMenuVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Tutup</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    zIndex: 999,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: CommonColors.warning,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: CommonColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    width: '80%',
    backgroundColor: CommonColors.white,
    borderRadius: 8,
    padding: Spacing.md,
    elevation: 5,
    shadowColor: CommonColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  optionsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: CommonColors.gray900,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: CommonColors.gray200,
  },
  optionLabel: {
    fontSize: Typography.sizes.base,
    color: CommonColors.gray800,
  },
  optionControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CommonColors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  closeButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: CommonColors.primary,
    borderRadius: 4,
  },
  closeButtonText: {
    color: CommonColors.white,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
});

export default ReadingOptionsButton; 