import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet, Dimensions } from 'react-native';

const MarqueeText = ({ text, speed = 15, repeat = 100 }) => {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const textWidth = text.length * 4;
    const screenWidth = Dimensions.get('window').width;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: -textWidth,
          duration: (textWidth + screenWidth) * speed,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: screenWidth,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
      { iterations: repeat }
    );

    animation.start();

    return () => animation.stop();
  }, [text, speed, repeat, translateX]);

  return (
    <View style={styles.container}>
      <Animated.Text
        numberOfLines={1}
        style={[styles.text, { transform: [{ translateX }] }]}
      >
        {text}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    width: '100%',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
});

export default MarqueeText;