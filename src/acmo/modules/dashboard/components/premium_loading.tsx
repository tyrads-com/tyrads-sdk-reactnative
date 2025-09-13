import React from 'react';
import { View, StyleSheet } from 'react-native';
import Shimmer from './custom_shimmer';
import { PremiumWidgetStyles } from '../top_offers';
import CustomCard from './custom_card';

interface PremiumWidgetsLoadingProps {
  widgetStyle: PremiumWidgetStyles;
}

const PremiumWidgetsLoading: React.FC<PremiumWidgetsLoadingProps> = ({
  widgetStyle,
}) => {
  return (
    <CustomCard style={{
      width: '100%',
      paddingHorizontal: 16,
    }}>
      <View style={styles.headerRow}>
        <Shimmer style={{ width: 120, height: 18, borderRadius: 4 }} />
        <Shimmer style={{ width: 105, height: 18, borderRadius: 4 }} />
      </View>

      {widgetStyle === PremiumWidgetStyles.list && (
        <View style={styles.listContainer}>
          {[...Array(4)].map((_, index) => (
            <View key={index} style={styles.listTile}>
              <Shimmer shimmerHeight={54} style={{ width: 54, height: 54, borderRadius: 4 }} />

              <View style={styles.titleColumn}>
                <Shimmer style={{ width: 130, height: 16, marginBottom: 2 }} />
                <Shimmer style={{ width: 65, height: 16 }} />
              </View>

              <Shimmer shimmerHeight={42} style={{ width: 80, height: 42, borderRadius: 8 }} />
            </View>
          ))}
        </View>
      )}

      {widgetStyle === PremiumWidgetStyles.sliderCards && (
        <Shimmer shimmerHeight={150} style={{ flexDirection: 'row', height: 150, marginTop: 16 }} />
      )}

      <Shimmer shimmerHeight={42} style={{ flexDirection: 'row', height: 42, borderRadius: 21, marginVertical: 16 }} />
    </CustomCard>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  listContainer: {
    marginTop: 12,
  },
  listTile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  titleColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
});

export default PremiumWidgetsLoading;
