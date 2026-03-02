import { PremiumWidgetStyles } from './acmo/modules/premium-widgets/top_offers';
import PremiumWidgetsLoading from './acmo/modules/premium-widgets/components/premium_loading';
import TyradsSdkCore from './acmo/core/tyrads-sdk-core';
import type { TyradsMediaSourceInfo, TyradsUserInfo } from './acmo/core/types/external_types'
export type { TyradsMediaSourceInfo, TyradsUserInfo } from './acmo/core/types/external_types'
export { PremiumWidgetStyles } from './acmo/modules/premium-widgets/top_offers';

const Tyrads = {
  init: async (apiKey: string, apiSecret: string, encKey?: string, engagementId?: string, mediaSourceInfo?: TyradsMediaSourceInfo, userInfo?: TyradsUserInfo,) => {
    return await TyradsSdkCore.init(apiKey, apiSecret, encKey, engagementId, mediaSourceInfo, userInfo);
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
