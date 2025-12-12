import React from 'react';
import { View, Pressable, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface CardGradientProps {
  children?: React.ReactNode;
  onClose: () => void;
  gradientColors?: string[];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
}

export const CardGradient: React.FC<CardGradientProps> = ({
  children,
  onClose,
  gradientColors = ['#ffffff', '#02B5BE'],
  gradientStart = { x: 0.5, y: 0.25 },
  gradientEnd = { x: 0.5, y: 1.2 },
}) => {

  return (
    <View style={styles.wrapper}>
      <View style={styles.topLeftIcon}>
        <Image 
        source={require('../../../../assets/images/coin.png')} 
        style={{
          width: 110,
          height: 110,
        }}
        />
      </View>
      <LinearGradient
        colors={gradientColors}
        start={gradientStart}
        end={gradientEnd}
        style={styles.gradientCard}
      >
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Image
            source={require('../../../../assets/images/circle-x.png')}
            style={styles.closeIcon}
          />
        </Pressable>
        {children && <View style={styles.content}>{children}</View>}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    width: '90%',
    maxWidth: '90%',
  },
  gradientCard: {
    borderRadius: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  topLeftIcon: {
    position: 'absolute',
    left: 10,
    top: -35,
    zIndex: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  content: {
    margin: 16,
  },
});
