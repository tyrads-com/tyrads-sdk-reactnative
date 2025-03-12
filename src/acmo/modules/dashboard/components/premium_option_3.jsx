import { TouchableOpacity, View } from "react-native";
import AutoScrollPagerWithIndicators from "./auto_scroller";
import OfferInfoSection from "./offer_info_section";
import Tyrads from "../../../..";

const PremiumOption3 = ({ data , premiumColor}) => {
  return (
    <AutoScrollPagerWithIndicators
      totalPages={data.length}
      premiumColor={premiumColor}
      content={(page) => (
        <TouchableOpacity 
        key={page} 
        style={{flex: 1}} 
        activeOpacity={0.8}
        onPress={() => Tyrads.showOffers({
          route: 'campaign-details',
          campaignId: data[page].campaignId
        })}>
          <View>
            <OfferInfoSection details={data[page]} premiumColor={premiumColor} style={{paddingVertical: 23}}/>
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

export default PremiumOption3;
