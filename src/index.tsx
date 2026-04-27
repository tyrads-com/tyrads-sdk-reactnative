import { AppRegistry } from 'react-native';
import TyradsSdkCore from './acmo/core/tyrads-sdk-core';
import TyradsGlobalHost from './acmo/modules/inapp-notifications/tyrads-global-host';
import { PremiumWidgetStyles } from './acmo/modules/premium-widgets/premium_offers_widget';
import PremiumWidgetsLoading from './acmo/modules/premium-widgets/components/premium_loading';
import type { TyradsConfig, TyradsMediaSourceInfo, TyradsUserInfo } from './acmo/core/types/external_types'
import BasePremiumOffersWidget from './acmo/modules/premium-widgets/premium_offers_widget';
import { LocalizationProvider } from './acmo/modules/localization/localization_context';
import { View } from 'react-native';

AppRegistry.setWrapperComponentProvider(() => (props) => (
  <TyradsGlobalHost {...props} />
));

export type { TyradsConfig, TyradsMediaSourceInfo, TyradsUserInfo } from './acmo/core/types/external_types'
export { PremiumWidgetStyles } from './acmo/modules/premium-widgets/premium_offers_widget';

export const PremiumOffersWidget = ({
  widgetStyle = PremiumWidgetStyles.list,
  launchMode = 2,
}: {
  widgetStyle?: PremiumWidgetStyles;
  launchMode?: number;
}) => {
  const handleNavigation = (route?: string, campaignID?: number | null) => {
    TyradsSdkCore.showOffers({ route: route, campaignID: campaignID, launchMode: launchMode });
  };
  return (
    <LocalizationProvider>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <BasePremiumOffersWidget
          widgetStyle={widgetStyle}
          onNavigate={handleNavigation}
        />
      </View>
    </LocalizationProvider>
  );
};

export const PremiumOffersWidgetLoading = (
  { widgetStyle = PremiumWidgetStyles.list }: {
    widgetStyle?: PremiumWidgetStyles;
  }
) => {
  return (
    <PremiumWidgetsLoading
      widgetStyle={widgetStyle}
    />
  );
};

const Tyrads = {
  init: async (apiKey: string, apiSecret: string, encKey?: string, engagementId?: string, placementId?: string, mediaSourceInfo?: TyradsMediaSourceInfo, userInfo?: TyradsUserInfo, config?: TyradsConfig) => {
    return await TyradsSdkCore.init(apiKey, apiSecret, encKey, engagementId, placementId, mediaSourceInfo, userInfo, config);
  },

  loginUser: async (userId: string) => {
    return await TyradsSdkCore.loginUser(userId);
  },

  showOffers: async ({
    launchMode = 3,
    route,
    campaignID,
  }: { launchMode?: number; route?: string; campaignID?: number | null } = {}) => {
    return await TyradsSdkCore.showOffers({ launchMode, route, campaignID });
  },


  changeLanguage: async (lang: string) => {
    return await TyradsSdkCore.changeLanguage(lang);
  },
};


export default Tyrads;
