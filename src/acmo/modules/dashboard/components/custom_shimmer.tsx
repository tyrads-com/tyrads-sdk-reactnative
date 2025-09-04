import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions, type DimensionValue, type ViewStyle, type StyleProp } from 'react-native';

interface ShimmerProps {
  width?: DimensionValue;
  shimmerHeight?: number;
  style?: StyleProp<ViewStyle>;
  duration?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const Shimmer: React.FC<ShimmerProps> = ({
  width = '100%',
  shimmerHeight: height = 16,
  style,
  duration = 1500,
}) => {
  const translateX = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [translateX, duration]);

  const translateXInterpolate = translateX.interpolate({
    inputRange: [-1, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View style={[styles.container, { width }, style]}>
      <View style={[styles.shimmerBackground, { height }]} />
      <Animated.View
        style={[
          styles.shimmerOverlay,
          {
            width: SCREEN_WIDTH,
            height,
            transform: [{ translateX: translateXInterpolate }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#e1e1e1',
    borderRadius: 4,
  },
  shimmerBackground: {
    flex: 1,
    backgroundColor: '#d3d3d3',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(255,255,255,0.5)',
    opacity: 0.4,
    borderRadius: 4,
  },
});

export default Shimmer;
