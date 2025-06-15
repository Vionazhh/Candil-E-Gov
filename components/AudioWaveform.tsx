import { CommonColors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface AudioWaveformProps {
  progress: number; // 0.0 - 1.0
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ progress }) => {
  const totalBars = 30;

  // Bar heights bisa di-random sekali
  const barHeights = React.useMemo(() => {
    return Array.from({ length: totalBars }, () => Math.random() * 25 + 10);
  }, []);

  const generateBars = () => {
    return barHeights.map((height, i) => {
      const barProgress = i / totalBars;
      const isActive = barProgress <= progress;

      return (
        <View
          key={i}
          style={[
            styles.bar,
            {
              height,
              backgroundColor: isActive ? CommonColors.primary : CommonColors.gray300,
              opacity: isActive ? 1 : 0.4,
            },
          ]}
        />
      );
    });
  };

  return <View style={styles.container}>{generateBars()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 100,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    width: 5,
    marginHorizontal: 2,
    borderRadius: 3,
  },
});