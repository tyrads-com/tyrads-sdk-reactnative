import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, } from 'react-native';
import LocalizationService from '../../../core/services/localization_service';
// import { useTranslation } from 'react-i18next';

interface ActiveOffersBtnProps {
  premiumColor?: string;
  activeCount: number;
  onPress: (route: string) => void;
}

const ActiveOffersButton: React.FC<ActiveOffersBtnProps> = ({ premiumColor, activeCount, onPress }) => {
  const localization = LocalizationService.getInstance()
  return (
    <TouchableOpacity
      style={[styles.button, { borderColor: premiumColor }]}
      onPress={() => onPress && onPress('active-offers')}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[styles.buttonText, { color: premiumColor }]}>{localization.translate("data.offers.button.activeOffers")}</Text>
        {activeCount > 0 &&
          <View style={styles.activeCountContainer}>
            <Text style={styles.activeCountText}>{activeCount > 99 ? '99+' : activeCount}</Text>
          </View>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 42,
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeCountContainer: {
    marginLeft: 8,
    width: 18,
    height: 18,
    backgroundColor: '#FF554A',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  activeCountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  }
});

export default ActiveOffersButton;