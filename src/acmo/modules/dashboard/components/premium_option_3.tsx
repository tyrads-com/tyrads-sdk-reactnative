import React from 'react';
import { TouchableOpacity, View, } from 'react-native';
import AutoScrollPagerWithIndicators from './auto_scroller';
import OfferInfoSection from './offer_info_section';
import Tyrads from "../../../..";

interface PremiumOption3Props {
  data: TransformedCampaign[];
  premiumColor?: string;
}

const PremiumOption3: React.FC<PremiumOption3Props> = ({ data, premiumColor }) => {
  return (
    <AutoScrollPagerWithIndicators
      totalPages={data.length}
      premiumColor={premiumColor}
      content={(page) => (
        <TouchableOpacity
          key={page}
          style={{ flex: 1 }}
          activeOpacity={0.8}
          onPress={() =>
            Tyrads.showOffers({
              route: 'campaign-details',
              campaignID: data[page]?.campaignId,
            })
          }
        >
          <View>
            {
              data[page] && (
                <OfferInfoSection
                  details={data[page]}
                  premiumColor={premiumColor}
                  style={{ paddingVertical: 23 }}
                />
              )
            }
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

export default PremiumOption3;