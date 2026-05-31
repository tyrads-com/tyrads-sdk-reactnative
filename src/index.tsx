import { AppRegistry } from 'react-native';
import TyradsSdkCore from './acmo/core/tyrads-sdk-core';
import TyradsGlobalHost from './acmo/modules/inapp-notifications/tyrads-global-host';
import type { TyradsConfig, TyradsMediaSourceInfo, TyradsUserInfo } from './acmo/core/types/external_types'

AppRegistry.setWrapperComponentProvider(() => (props) => (
  <TyradsGlobalHost {...props} />
));

export type { TyradsConfig, TyradsMediaSourceInfo, TyradsUserInfo } from './acmo/core/types/external_types'
export { PremiumWidgetStyles } from './acmo/modules/premium-widgets/premium_offers_widget';
export { PremiumOffersWidget, PremiumOffersWidgetLoading } from './acmo/modules/premium-widgets/premium_offers_widget_wrapper';

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
