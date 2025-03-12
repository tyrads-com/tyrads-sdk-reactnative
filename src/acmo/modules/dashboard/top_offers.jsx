import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import PremiumOption2 from './components/premium_option_2';
import MyGamesButton from './components/my_games_button';
import PremiumHeaderSection from './components/premium_header';
import axios from 'axios';
import CustomCard from './components/custom_card';
import PremiumOption3 from './components/premium_option_3';
import PremiumOption1 from './components/premium_option_1';
import PremiumOption4 from './components/premium_option_4';

import { getData } from '../../core/storage/storage';
import { fetchCampaignsData } from './repository';

const TopOffers = ({
  showMore,
  showMyOffers,
  showMyOffersEmptyView,
  style = 1,
}) => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [premiumColor, setPremiumColor] = useState('#1C90DF');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    fetchCampaignsData(
      setLanguage,
      setPremiumColor,
      setCampaigns,
      setError,
      setIsLoading
    );
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (campaigns.length === 0) {
    if (showMyOffersEmptyView) {
      return (
        <View style={styles.noCampaignContainer}>
          <Text>{t('No campaigns available')}</Text>
        </View>
      );
    } else {
      return <View />;
    }
  }

  return (
    <CustomCard style={{}}>
      <View style={{ flex: 1 }}>
        <PremiumHeaderSection showMore={showMore} premiumColor={premiumColor} />
        <View style={styles.headerSpacer} />
        {(() => {
          switch (style) {
            case 1:
              return (
                <PremiumOption1 data={campaigns} premiumColor={premiumColor} />
              );
            case 2:
              return (
                <PremiumOption2 data={campaigns} premiumColor={premiumColor} />
              );
            case 3:
              return (
                <PremiumOption3 data={campaigns} premiumColor={premiumColor} />
              );
            case 4:
              return (
                <PremiumOption4 data={campaigns} premiumColor={premiumColor} />
              );
            default:
              return <Text>{t('Please specify correct style')}</Text>;
          }
        })()}
        <View style={styles.gameListSpacer} />
        {showMyOffers && <MyGamesButton premiumColor={premiumColor} />}
      </View>
    </CustomCard>
  );
};

const styles = StyleSheet.create({
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

export default TopOffers;
