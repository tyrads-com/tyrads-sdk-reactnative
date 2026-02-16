import { NativeEventEmitter, NativeModules, Platform } from "react-native";
import { AcmoConfig } from "../../../acmo_config";
import type { TyradsMediaSourceInfo, TyradsUserInfo } from "../types/external_types";

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
export interface PushNotificationEvent {
  type: 'received' | 'clicked' | 'dismissed';
  id?: string;
  data?: any;
}

export type PushNotificationCallback = (event: PushNotificationEvent) => void;

const TyradsNativeMethods = {
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

export default TyradsNativeMethods;
