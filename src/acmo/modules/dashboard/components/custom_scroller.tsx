import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
  type LayoutChangeEvent,
} from 'react-native';

interface PagerProps {
  totalPages: number;
  delayInMillis?: number;
  premiumColor?: string;
  content: (index: number) => React.ReactNode;
  viewportFraction?: number;
  scaleFactor?: number;
  spacing?: number;
  indicatorStyle?: StyleProp<ViewStyle>;
  activeIndicatorColor?: string;
  inactiveIndicatorColor?: string;
}

const AcmoScrollPager: React.FC<PagerProps> = ({
  totalPages,
  delayInMillis = 5000,
  content,
  viewportFraction = 0.92,
  scaleFactor = 0.94,
  spacing = 2,
  indicatorStyle,
  activeIndicatorColor = 'red',
  inactiveIndicatorColor = 'lightgray',
}) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<React.RefObject<typeof Animated.ScrollView> | any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onContainerLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    if (width !== containerWidth) setContainerWidth(width);
  };

  useEffect(() => {
    if (!containerWidth) return;

    const itemWidth = containerWidth * viewportFraction;
    const offset = itemWidth + spacing;

    intervalRef.current = setInterval(() => {
      const next = (currentPage + 1) % totalPages;
      setCurrentPage(next);
      scrollViewRef.current.scrollTo({
        x: next * offset,
        animated: true,
      });
    }, delayInMillis);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [containerWidth, currentPage, delayInMillis, totalPages, viewportFraction, spacing]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: true,
      listener: (event: { nativeEvent: { contentOffset: { x: number } } }) => {
        if (!containerWidth) return;
        const offset = containerWidth * viewportFraction + spacing;
        const index = Math.round(event.nativeEvent.contentOffset.x / offset);
        setCurrentPage(index);
      },
    }
  );

  const renderIndicators = () => (
    <View style={[styles.indicatorContainer, indicatorStyle]}>
      {Array.from({ length: totalPages }, (_, i) => (
        <View
          key={i}
          style={[
            styles.indicator,
            {
              backgroundColor:
                i === currentPage ? activeIndicatorColor : inactiveIndicatorColor,
            },
          ]}
        />
      ))}
    </View>
  );

  if (!containerWidth) {
    return <View onLayout={onContainerLayout} style={{ width: '100%' }} />;
  }

  const itemWidth = containerWidth * viewportFraction;
  const itemOffset = itemWidth + spacing;
  const sidePadding = (containerWidth - itemWidth - 16) / 2;

  return (
    <View onLayout={onContainerLayout} style={{ width: '100%', alignItems: 'center' }}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        snapToInterval={itemOffset}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        contentContainerStyle={{ paddingHorizontal: sidePadding }}
      >
        {Array.from({ length: totalPages }, (_, i) => {
          const inputRange = [
            itemOffset * (i - 1),
            itemOffset * i,
            itemOffset * (i + 1),
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [scaleFactor, 1, scaleFactor],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={i}
              style={{
                width: itemWidth,
                transform: [{ scale }],
              }}
            >
              {content(i)}
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
      {renderIndicators()}
    </View>
  );
};

const styles = StyleSheet.create({
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default AcmoScrollPager;
