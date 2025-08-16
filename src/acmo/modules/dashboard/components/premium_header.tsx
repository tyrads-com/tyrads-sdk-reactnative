import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet,} from 'react-native';
import { useTranslation } from 'react-i18next';

interface PremiumHeaderSectionProps {
  showMore?: boolean;
  premiumColor?: string;
  onShowOffers?: () => void;
}

const PremiumHeaderSection: React.FC<PremiumHeaderSectionProps> = ({ showMore = true, premiumColor, onShowOffers }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftContainer}>
        <View style={styles.starContainer}>
          <Image
            source={require('../../../../assets/images/diamond.png')}
            style={[styles.starIcon, { tintColor: premiumColor }]}
          />
        </View>
        <Text style={[styles.headerText, { color: premiumColor }]} numberOfLines={1} ellipsizeMode="tail">
          {t('dashboard.suggested_offers')}
        </Text>
      </View>
      {showMore && (
        <TouchableOpacity style={styles.rightContainer} onPress={onShowOffers}>
          <Text style={[styles.moreOffersText, { color: premiumColor }]} numberOfLines={1}>
            {t('dashboard.more_offers')}
          </Text>
          <Image
            source={require('../../../../assets/images/angle_up.png')}
            style={{ transform: [{ rotate: '90deg' }], width: 11, height: 11, objectFit: 'contain', marginLeft: 5, tintColor: premiumColor || "#1C90DF" }}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  starContainer: {
    borderRadius: 25,
    height: 19,
    width: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  starIcon: {
    width: 12,
    height: 12,
  },
  headerText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreOffersText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PremiumHeaderSection;