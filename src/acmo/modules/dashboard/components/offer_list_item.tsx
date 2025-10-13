import React from 'react';
import {numeral} from '../../../core/helpers/numeral';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalization } from '../../localization/localization_context';



type Props = {
  offer: Campaign;
  currencySales?: CurrencySales;
  onButtonTap: () => Promise<void>;
  onPress: () => Promise<void>;
  index: number;
  colorPremium?: string;
  colorPremiumFg?: string;
  loadingIndex: number | null;
  setLoadingIndex: (index: number | null) => void;
};

const rankIcons = [
  require('../../../../assets/images/rank_1.png'),
  require('../../../../assets/images/rank_2.png'),
  require('../../../../assets/images/rank_3.png'),
  require('../../../../assets/images/rank_4.png'),
  require('../../../../assets/images/rank_5.png'),
];

export const AcmoOfferListItem: React.FC<Props> = ({
  offer,
  currencySales,
  onButtonTap,
  onPress,
  index,
  colorPremium,
  colorPremiumFg,
  loadingIndex,
  setLoadingIndex,
}) => {
  const bonusMultiplier = currencySales?.multiplier ?? 1;
  const isLoading = loadingIndex === index;
  const anyLoading = loadingIndex != null;
  const { t } = useLocalization();

  return (
    <TouchableOpacity
      disabled={anyLoading}
      onPress={onPress}
      style={styles.itemContainer}
      activeOpacity={0.75}
    >
      <View style={styles.container}>
        <Image source={rankIcons[index]} style={styles.rankIcon} />

        <Image source={{ uri: offer.app.thumbnail }} style={styles.icon} />

        <View style={styles.details}>
          {currencySales && (
            <View style={[styles.bonusBadge, { backgroundColor: `${colorPremium}20` }]}>
              <Text style={[styles.bonusText, { color: colorPremium }]}>
                {t('data.shared.label.bonusTagCaps',
                  { 'multiplier': currencySales?.multiplier! },)}
              </Text>
            </View>
          )}

          <Text numberOfLines={1} style={styles.title} ellipsizeMode="tail">
            {offer.app.title}
          </Text>

          <View style={styles.payoutRow}>
            {currencySales && (
              <Text style={styles.strikeText}>
                {numeral(offer.campaignPayout.totalPlayablePayoutConverted)}
              </Text>
            )}

            <Image
              source={{ uri: offer.currency.adUnitCurrencyIcon }}
              style={styles.currencyIcon}
            />

            <Text style={styles.payoutText}>
              {numeral(
                offer.campaignPayout.totalPlayablePayoutConverted * bonusMultiplier
              )}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          disabled={anyLoading}
          style={[
            styles.button,
            { backgroundColor: anyLoading ? '#e0e2e7' : colorPremium },
          ]}
          onPress={async () => {
            setLoadingIndex(index)
            await onButtonTap();
            setLoadingIndex(null);
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#a3a9b6" />
          ) : null}
          <Text
            style={[
              styles.buttonText,
              {
                color: anyLoading ? '#a3a9b6' : colorPremiumFg ?? '#fff',
                marginLeft: isLoading ? 8 : 0,
              },
            ]}
          >
            {t("data.widget.button.play")}
          </Text>
        </TouchableOpacity>

      </View>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  container: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingHorizontal: 0,
    width: '100%',
    position: 'relative',
  },
  rankIcon: {
    position: 'absolute',
    zIndex: 99,
    left: -10,
    top: -8,
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    elevation: 2,
  },
  icon: {
    width: 54,
    height: 54,
    borderRadius: 4,
    marginRight: 10,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  bonusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 16,
    marginBottom: 4,
  },
  bonusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    color: '#323434',
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  strikeText: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    color: '#323434',
    fontWeight: '300',
  },
  currencyIcon: {
    width: 14,
    height: 14,
  },
  payoutText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#323434',
  },
  button: {
    marginLeft: 4,
    paddingHorizontal: 12,
    height: 42,
    minWidth: 75,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
