import { PremiumWidgetStyles } from './acmo/modules/dashboard/top_offers';
import PremiumWidgetsLoading from './acmo/modules/dashboard/components/premium_loading';
import TyradsSdkCoreMethods from './acmo/core/tyrads-sdk-core';
import type { TyradsMediaSourceInfo, TyradsUserInfo } from './acmo/core/types/external_types'
export type { TyradsMediaSourceInfo, TyradsUserInfo } from './acmo/core/types/external_types'

const Tyrads = {
  init: async (apiKey: string, apiSecret: string, encKey?: string, engagementId?: string, mediaSourceInfo?: TyradsMediaSourceInfo, userInfo?: TyradsUserInfo,) => {
    return await TyradsSdkCoreMethods.init(apiKey, apiSecret, encKey, engagementId, mediaSourceInfo, userInfo);
  },
  loginUser: async (userId: string) => {
    return await TyradsSdkCoreMethods.loginUser(userId);
  },

  showOffers: async ({
    launchMode = 3,
    route,
    campaignID,
  }: { launchMode?: number; route?: string; campaignID?: number | null } = {}) => {
    return await TyradsSdkCoreMethods.showOffers({ launchMode, route, campaignID });
  },
  topPremiumOffers: ({
    widgetStyle = PremiumWidgetStyles.list,
    launchMode = 2,
  }: {
    widgetStyle?: PremiumWidgetStyles;
    launchMode?: number;
  } = {}) => {
    return TyradsSdkCoreMethods.topPremiumOffers({ widgetStyle, launchMode });
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
    return await TyradsSdkCoreMethods.changeLanguage(lang);
  },
};

export default Tyrads;
