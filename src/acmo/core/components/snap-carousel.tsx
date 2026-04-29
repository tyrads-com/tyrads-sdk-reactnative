import '../helpers/patches'

import React, { useRef, useState } from "react";
import { View, Dimensions, StyleSheet, type ViewStyle } from "react-native";
import Carousel, { Pagination } from "react-native-snap-carousel";

interface SnapCarouselProps {
  data: any[];
  renderItem: ({ item, index }: any) => JSX.Element;
  sliderWidth?: number;
  itemWidth?: number;
  showPagination?: boolean;
  onSnapToItem?: (index: number) => void;
  inactiveSlideScale?: number;
  inactiveSlideOpacity?: number;
  activeSlideAlignment?: "start" | "center" | "end";
  containerStyle?: ViewStyle;
  paginationContainerStyle?: ViewStyle;
  dotStyle?: ViewStyle;
  inActiveDotStyle?: ViewStyle;
  inActiveDotScale?: number;
  loop?: boolean;
  autoplay?: boolean;
  autoPlayDelay?: number;
  [key: string]: any;
}

const { width: screenWidth } = Dimensions.get("window");

const SnapCarousel: React.FC<SnapCarouselProps> = ({
  data,
  renderItem,
  sliderWidth = screenWidth,
  itemWidth = screenWidth * 0.75,
  showPagination = true,
  onSnapToItem = () => {},
  inactiveSlideScale = 1,
  inactiveSlideOpacity = 0.99,
  activeSlideAlignment = "center",
  containerStyle,
  paginationContainerStyle,
  dotStyle,
  inActiveDotStyle,
  inActiveDotScale = 0.95,
  loop = false,
  autoplay = false,
  autoPlayDelay = 5000,
  ...rest
}) => {
  const carouselRef = useRef<Carousel<any>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const sidePadding = (sliderWidth - itemWidth) / 2;

  const safeData = data || [];

  return (
    <View style={[containerStyle]}>
      <Carousel
        ref={carouselRef}
        data={safeData}
        renderItem={renderItem}
        sliderWidth={sliderWidth}
        itemWidth={itemWidth}
        inactiveSlideScale={inactiveSlideScale}
        inactiveSlideOpacity={inactiveSlideOpacity}
        activeSlideAlignment={activeSlideAlignment}
        onSnapToItem={(index) => {
          setActiveIndex(index);
          onSnapToItem(index);
        }}
        contentContainerCustomStyle={{
          paddingHorizontal: sidePadding,
        }}
        loop={loop}
        autoplay={autoplay}
        autoplayDelay={autoPlayDelay}
        {...rest}
      />

      {showPagination && (
        <Pagination
          dotsLength={safeData.length}
          activeDotIndex={activeIndex}
          dotStyle={[styles.dot, dotStyle]}
          inactiveDotOpacity={0.3}
          inactiveDotStyle={[inActiveDotStyle]}
          inactiveDotScale={inActiveDotScale}
          dotContainerStyle={[{ marginHorizontal: 4 , marginBottom: 0}]}
          containerStyle={paginationContainerStyle}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
});

export default SnapCarousel;
