import { NativeEventEmitter, NativeModules, Platform, View } from "react-native";
import { AcmoConfig } from "../../acmo_config";
import type { TyradsMediaSourceInfo, TyradsUserInfo } from "./types/external_types";
import NetworkCommon from "./network/network-common";
import { FcmManager } from "../modules/push-notifications/fcm-manager";
import { ApnsManager } from "../modules/push-notifications/apns-manager";
import { saveData } from "./storage/storage";
import { changeProviderLanguage, LocalizationProvider, updateProviderLanguage } from "../modules/localization/localization_context";
import Localization from './services/localization_service';
import TopOffers, { type PremiumWidgetStyles } from "../modules/dashboard/top_offers";

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
export interface PushNotificationEvent {
  type: 'received' | 'clicked' | 'dismissed';
  id?: string;
  data?: any;
}

export type PushNotificationCallback = (event: PushNotificationEvent) => void;

const TyradsSdkCoreMethods = {
  init: async (apiKey: string, apiSecret: string, encKey?: string, engagementId?: string, mediaSourceInfo?: TyradsMediaSourceInfo, userInfo?: TyradsUserInfo,) => {
    TyradsSdkCoreMethods.setSDKVersion();
    if (mediaSourceInfo) {
      TyradsSdkCoreMethods.setMediaSourceInfo(mediaSourceInfo);
    }
    if (userInfo) {
      TyradsSdkCoreMethods.setUserInfo(userInfo);
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
      TyradsSdkCoreMethods.showOffers({ route: route, campaignID: campaignID, launchMode: launchMode });
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

  changeLanguage: async (lang: string) => {
    return await TyradsSdk.changeLanguage(lang);
  },

  setSDKVersion: () => {
    const version = AcmoConfig.SDK_VERSION;
    TyradsSdk.setSDKVersion(version);
  },

  setMediaSourceInfo: (mediaSourceInfo: TyradsMediaSourceInfo) => {
    TyradsSdk.setMediaSourceInfo(mediaSourceInfo);
  },

  setUserInfo: (userInfo: TyradsUserInfo) => {
    TyradsSdk.setUserInfo(userInfo);
  },


  isPrivacyAccepted: async () => {
    try {
      return await TyradsSdk.isPrivacyAccepted();
    } catch (err) {
      console.error("Error checking privacy acceptance:", err);
      return false;
    }
  },

  checkOnboardingProcess: async () => {
    try {
      const result = await TyradsSdk.checkOnboardingProcess();
      return result === true;
    } catch (err) {
      console.error("Error showing privacy flow:", err);
      return false;
    }
  },

  requestPushPermission: async (): Promise<boolean> => {
    try {
      const granted = await TyradsSdk.pushRequestPermission();
      return granted === true;
    } catch (err) {
      console.error("Error requesting push permission:", err);
      return false;
    }
  },

  getApnsToken: async (): Promise<string | null> => {
    try {
      const token = await TyradsSdk.pushGetApnsToken();
      return token || null;
    } catch (err) {
      console.error("Error getting APNs token:", err);
      return null;
    }
  },

  addPushNotificationListener: (callback: PushNotificationCallback) => {
    return tyradsEmitter.addListener('PushNotificationEvent', callback);
  },

  startObserving: () => {
    TyradsSdk.startObserving();
  },

  stopObserving: () => {
    TyradsSdk.stopObserving();
  },
};

export default TyradsSdkCoreMethods;
