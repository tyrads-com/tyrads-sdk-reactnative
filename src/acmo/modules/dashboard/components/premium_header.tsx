import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet,} from 'react-native';
import LocalizationService from '../../../core/services/localization_service';

interface PremiumHeaderSectionProps {
  showMore?: boolean;
  premiumColor?: string;
  localization: LocalizationService;
  onShowOffers?: () => void;
}

const PremiumHeaderSection: React.FC<PremiumHeaderSectionProps> = ({ showMore = true, premiumColor, localization, onShowOffers }) => {
  
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
          {localization.translate('data.widget.page.title')}
        </Text>
      </View>
      {showMore && (
        <TouchableOpacity style={styles.rightContainer} onPress={onShowOffers}>
          <Text style={[styles.moreOffersText, { color: premiumColor }]} numberOfLines={1}>
            {localization.translate('data.widget.button.moreOffers')}
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
