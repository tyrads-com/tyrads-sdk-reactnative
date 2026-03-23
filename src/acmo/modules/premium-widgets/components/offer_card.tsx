import React, { useState } from 'react';
import {numeral} from '../../../core/helpers/numeral';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';


interface Props {
  item: Campaign;
  onButtonClick: () => Promise<void>;
  currencySaleModel?: CurrencySales;
  premiumColor?: string;
  isLoading: boolean;
  onTap?: () => Promise<void>;
}

const AcmoOfferCard: React.FC<Props> = ({
  item,
  onButtonClick,
  currencySaleModel,
  premiumColor,
  isLoading,
  onTap,
}) => {
  const [loading, setLoading] = useState<boolean>(isLoading);
  const bonusMultiplier = currencySaleModel?.multiplier ?? 1;
  const itemHeight = 132;

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    await onButtonClick();
    setLoading(false);
  };

  return (
    <TouchableOpacity
      key={item.campaignId}
      activeOpacity={0.9}
      style={styles.container}
      onPress={() => {
        if (!loading && onTap) onTap();
      }}
    >
      <View style={styles.cardShadow}>
        <View style={[styles.imageContainer, { height: itemHeight }]}>
          <Image
            source={{ uri: item.creative.creativePacks[0]?.creatives[0]?.fileUrl || '' }}
            style={styles.image}
          />
          {item.campaignPremium && (
            <View style={styles.diamondIcon}>
              <Image
                style={{ width: 12, height: 12, objectFit: 'contain', tintColor: 'white' }}
                source={require('../../../../assets/images/diamond.png')}
              />
            </View>
          )}
        </View>

        <View style={styles.detailCard}>
          <View style={styles.header}>
            <Image source={{ uri: item.app.thumbnail }} style={styles.appIcon} />
            <Text style={styles.title}>{item.app.title}</Text>

            <View style={styles.payoutSection}>
              {currencySaleModel?.multiplier && (
                <Text style={styles.strikePayout}>
                  {numeral((Object.values(item.payoutSummary)[0] as PayoutSummary)?.totalPlayablePayoutConverted || 0)}
                </Text>
              )}
              <View style={styles.payoutRow}>
                <Image source={{ uri: (Object.values(item.availableCurrencies)[0] as AvailableCurrency)?.currencyIcon || '' }} style={styles.currencyIcon} />
                <Text style={styles.payoutText}>
                  {numeral(((Object.values(item.payoutSummary)[0] as PayoutSummary)?.totalPlayablePayoutConverted || 0) * bonusMultiplier)}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onTap} disabled={loading}>
              <Image source={require('../../../../assets/images/info_icon.png')} style={styles.infoIcon} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled, { backgroundColor: loading ? '#888' : premiumColor || '#1C90DF' }]}
            onPress={handleClick}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Play Now</Text>
            )}
          </TouchableOpacity>
        </View>

        {currencySaleModel?.multiplier && (
          <View style={[styles.bonusBadge, { backgroundColor: `${premiumColor}` || '#1C90DF' }]}>
            <Text style={styles.bonusText}>{currencySaleModel?.multiplier.toFixed(1)}x Bonus</Text>
          </View>
        )}
        {currencySaleModel?.multiplier && (
          <View style={[styles.trianlge, { backgroundColor: `${premiumColor}cc` || '#1C90DF' }]}>
          </View>
          
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
  },
  cardShadow: {
    borderRadius: 16,
    backgroundColor: 'white',
    elevation: 5,
  },
  imageContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  diamondIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#1E2020DD',
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diamondText: {
    color: 'white',
    fontSize: 14,
  },
  detailCard: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontWeight: '600',
    fontSize: 14,
  },
  payoutSection: {
    alignItems: 'flex-end',
  },
  strikePayout: {
    textDecorationLine: 'line-through',
    color: '#454646',
    fontSize: 12,
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  payoutText: {
    fontWeight: '700',
    fontSize: 14,
  },
  infoIcon: {
    width: 16,
    height: 16,
    marginLeft: 8,
  },
  button: {
    marginTop: 12,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#e0e2e7',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  bonusBadge: {
    position: 'absolute',
    top: 16,
    left: -6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderTopRightRadius: 100,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 100,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    backgroundColor: 'transparent',
  },
  trianlge: {
    position: 'absolute',
    top: 46.6,
    left: -7.4,
    zIndex: -10,
    width: 20,
    height: 10,
    transform: [{ rotate: '65deg' }]
  },
  bonusText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
});

export default AcmoOfferCard;
