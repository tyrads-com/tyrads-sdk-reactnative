import { NativeEventEmitter, NativeModules, Platform, View, } from 'react-native';

import TopOffers, { PremiumWidgetStyles } from './acmo/modules/dashboard/top_offers';
import { saveData } from './acmo/core/storage/storage';
import Localization from './acmo/core/services/localization_service';
import { changeProviderLanguage, LocalizationProvider, updateProviderLanguage } from './acmo/modules/localization/localization_context';
import PremiumWidgetsLoading from './acmo/modules/dashboard/components/premium_loading';
import TyradsNativeMethods from './acmo/core/helpers/native_methods';
import type { TyradsMediaSourceInfo, TyradsUserInfo } from './acmo/core/types/external_types';
import NetworkCommon from './acmo/core/network/network-common';
import { ApnsManager } from './acmo/modules/push-notifications/apns-manager';
import { FcmManager } from './acmo/modules/push-notifications/fcm-manager';
export type { TyradsMediaSourceInfo, TyradsUserInfo } from './acmo/core/types/external_types'

// const TyradsSdkComposeView = requireNativeComponent('TyradsSdkComposeView');


const LINKING_ERROR =
  `The package 'tyrads-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const TyradsSdk = NativeModules.TyradsSdk
  ? NativeModules.TyradsSdk
  : new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );

const tyradsEmitter = new NativeEventEmitter(TyradsSdk);

let languageChangedSubscription: any = null;

const Tyrads = {
  init: async (apiKey: string, apiSecret: string, encKey?: string, engagementId?: string, mediaSourceInfo?: TyradsMediaSourceInfo, userInfo?: TyradsUserInfo,) => {
    TyradsNativeMethods.setSDKVersion();
    if (mediaSourceInfo) {
      TyradsNativeMethods.setMediaSourceInfo(mediaSourceInfo);
    }
    if (userInfo) {
      TyradsNativeMethods.setUserInfo(userInfo);
    }
    const data = await TyradsSdk.init(apiKey, apiSecret, encKey, engagementId);

    await saveData("credentials", {
      'X-API-Key': apiKey,
      'X-API-Secret': apiSecret
    });

    let languageCode = "en";
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed?.languageCode) {
        languageCode = parsed.languageCode;
      }
    } catch { }

    await saveData("language", languageCode);
    await Localization.getInstance().init(languageCode);

    if (Platform.OS === 'android') {
      await FcmManager.getInstance().init().catch(console.error);
    }
    if (Platform.OS === 'ios') {
      await ApnsManager.getInstance().init().catch(console.error);
    }
    TyradsSdk.startObserving();
    languageChangedSubscription?.remove();
    languageChangedSubscription = tyradsEmitter.addListener(
      'LanguageChanged',
      async (lang: string) => {
        console.log('LanguageChanged event from Android SDK:', lang);
        await changeProviderLanguage(lang);
      }
    );
    await updateProviderLanguage(languageCode);

    return data;
  },
  loginUser: async (userId: string) => {
    try {
      const data = await TyradsSdk.loginUser(userId);
      if (typeof data === "object") {
        await saveData('apiHeaders', JSON.stringify(data));
        await saveData('language', data.languageCode);
      } else if (typeof data === "string") {
        await saveData('apiHeaders', data);
        await saveData('language', JSON.parse(data).languageCode);
      }
      await NetworkCommon.getInstance().init();
      if (Platform.OS === 'android') {
        FcmManager.getInstance().setLoggedIn(true);
      } else {
        ApnsManager.getInstance().setLoggedIn(true);
      }
      return data;
    } catch (err) {
      return null;
    }
  },

  showOffers: async ({
    launchMode = 3,
    route,
    campaignID,
  }: { launchMode?: number; route?: string; campaignID?: number | null } = {}) => {
    if (Platform.OS === 'ios') {
      if (campaignID == null) {
        return await TyradsSdk.showOffers(launchMode, route);
      }
      return await TyradsSdk.showOfferDetails(launchMode, route, campaignID);
    } else {
      if (campaignID == null) {
        return await TyradsSdk.showOffers(route);
      }
      return await TyradsSdk.showOfferDetails(route, campaignID);
    }
  },
  topPremiumOffers: ({
    widgetStyle,
    launchMode = 2,
  }: {
    widgetStyle?: PremiumWidgetStyles;
    launchMode?: number;
  } = {}) => {
    const handleNavigation = (route?: string, campaignID?: number | null) => {
      Tyrads.showOffers({ route: route, campaignID: campaignID, launchMode: launchMode });
    };
    return (
      <LocalizationProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <TopOffers
            widgetStyle={widgetStyle}
            onNavigate={handleNavigation}
          />
        </View>
      </LocalizationProvider>
    );
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
    return await TyradsSdk.changeLanguage(lang);
  },
};

export default Tyrads;
