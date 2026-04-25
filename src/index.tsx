import { AppRegistry } from 'react-native';
import TyradsSdkCore from './acmo/core/tyrads-sdk-core';
import TyradsGlobalHost from './acmo/modules/inapp-notifications/tyrads-global-host';
import { PremiumWidgetStyles } from './acmo/modules/premium-widgets/top_offers';
import PremiumWidgetsLoading from './acmo/modules/premium-widgets/components/premium_loading';
import type { TyradsConfig, TyradsMediaSourceInfo, TyradsUserInfo } from './acmo/core/types/external_types'

AppRegistry.setWrapperComponentProvider(() => (props) => (
  <TyradsGlobalHost {...props} />
));

export type { TyradsConfig, TyradsMediaSourceInfo, TyradsUserInfo } from './acmo/core/types/external_types'
export { PremiumWidgetStyles } from './acmo/modules/premium-widgets/top_offers';

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

  topPremiumOffers: ({
    widgetStyle = PremiumWidgetStyles.list,
    launchMode = 2,
  }: {
    widgetStyle?: PremiumWidgetStyles;
    launchMode?: number;
  } = {}) => {
    return TyradsSdkCore.topPremiumOffers({ widgetStyle, launchMode });
  },

  topPremiumOffersLoading: (
    { widgetStyle = PremiumWidgetStyles.list }: {
      widgetStyle?: PremiumWidgetStyles;
    }
  ) => {
    return (
      <PremiumWidgetsLoading
        widgetStyle={widgetStyle}
      />
    );
  },

  changeLanguage: async (lang: string) => {
    return await TyradsSdkCore.changeLanguage(lang);
  },
};


export default Tyrads;
