import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { fetchPremiumOfferDetails, openOffer } from './repository';
import PremiumHeaderSection from './components/premium_header';
import CustomCard from './components/custom_card';
import ActiveOffersButton from './components/active_offers_button';
import { AcmoOfferListItem } from './components/offer_list_item';
import AcmoOfferCard from './components/offer_card';
import PremiumEmptyView from './components/premium_empty_widget';
import PremiumWidgetsLoading from './components/premium_loading';
import TyradsNativeMethods from '../../core/helpers/native_methods';
import SnapCarousel from '../../core/components/snap-carousel';
import InAppNotificationHost from '../inapp-notifications/inapp-notification-host';

export const enum PremiumWidgetStyles {
  list,
  sliderCards,
}

interface PremiumWidgetProps {
  widgetStyle?: PremiumWidgetStyles;
  onNavigate: (route?: string, campaignID?: number) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const PremiumWidgets: React.FC<PremiumWidgetProps> = ({
  widgetStyle = PremiumWidgetStyles.list,
  onNavigate
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [premiumColor, setPremiumColor] = useState<string>('#1C90DF');
  const [currencySale, setCurrencySale] = useState<CurrencySales>();
  const [activeCount, setActiveCount] = useState<number>(0);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchPremiumOfferDetails(
      setPremiumColor,
      setCampaigns,
      setCurrencySale,
      setActiveCount,
      setError,
      setIsLoading,
    );

  }, []);

  const handleShowOffers = () => {
    onNavigate();
  };
  const handleCampaignPress = (campaignId: number) => {
    onNavigate("offers", campaignId);
  };

  const handleActiveOffersPress = (route: string) => {
    onNavigate(route);
  };

  const handleButtonPress = async (campaign: Campaign) => {
    let isReady = await TyradsNativeMethods.isPrivacyAccepted()
    if (!isReady) {
      try {
        const result = await TyradsNativeMethods.checkOnboardingProcess();
        console.log("Privacy flow result:", result);
        isReady = result === true;
      } catch (err) {
        console.error("Privacy flow error:", err);
        isReady = false;
      }
    }
    if (!isReady) {
      return
    }
    await openOffer(campaign);
    await fetchPremiumOfferDetails(
      setPremiumColor,
      setCampaigns,
      setCurrencySale,
      setActiveCount,
      setError,
      setIsLoading,
    );
  }


  if (isLoading) {
    return (
      <>
        <InAppNotificationHost />
        <PremiumWidgetsLoading
          widgetStyle={widgetStyle}
        />
      </>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <InAppNotificationHost />
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }


  if (campaigns.length === 0) {
    return <>
      <InAppNotificationHost />
      <PremiumEmptyView
        colorPremium={premiumColor}
        onContinue={handleShowOffers}
      />
    </>;
  }

  return (
    <CustomCard>
      <InAppNotificationHost />
      <View style={{ flex: 1 }}>
        <PremiumHeaderSection premiumColor={premiumColor} onShowOffers={handleShowOffers} />
        <View style={styles.headerSpacer} />
        {(() => {
          switch (widgetStyle) {
            case PremiumWidgetStyles.list:
              return (
                campaigns.map((item, index) => (
                  <AcmoOfferListItem
                    key={index}
                    onPress={async () => handleCampaignPress && handleCampaignPress(item.campaignId)}
                    offer={item}
                    currencySales={currencySale}
                    index={index}
                    loadingIndex={loadingIndex}
                    setLoadingIndex={setLoadingIndex}
                    colorPremium={premiumColor}
                    onButtonTap={async () => handleButtonPress(item)}
                  />
                ))
              );
            case PremiumWidgetStyles.sliderCards:
              return (
                <SnapCarousel
                  data={campaigns}
                  renderItem={({ item, index }) => (
                    <View style={{ paddingHorizontal: 16 }}>
                      <AcmoOfferCard
                        item={item}
                        onButtonClick={async () => handleButtonPress(campaigns[index]!)}
                        currencySaleModel={currencySale}
                        premiumColor={premiumColor}
                        isLoading={false}
                        onTap={async () => handleCampaignPress && handleCampaignPress(campaigns[index]!.campaignId)}
                      />
                    </View>
                  )}
                  sliderWidth={SCREEN_WIDTH - 40}
                  itemWidth={SCREEN_WIDTH - 40}
                  dotStyle={{
                    marginVertical: 0,
                    backgroundColor: premiumColor || "#000"
                  }}
                  paginationContainerStyle={{
                    marginBottom: 16,
                    marginTop: 8,
                    paddingVertical: 0,
                  }}
                  loop
                  autoplay
                />
              );
            default:
              return <Text>Please specify a correct style</Text>;
          }
        })()}
        <View style={styles.gameListSpacer} />
        <ActiveOffersButton activeCount={activeCount} premiumColor={premiumColor} onPress={handleActiveOffersPress} />
      </View>
    </CustomCard>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
  },
  errorText: {
    color: 'red',
  },
  noCampaignContainer: {
    padding: 16,
  },
  headerSpacer: {
    height: 10,
  },
  gameListSpacer: {
    height: 10,
  },
});

export default PremiumWidgets;
