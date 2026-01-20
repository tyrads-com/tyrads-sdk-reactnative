import { NativeModules, Platform } from "react-native";
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


const TyradsNativeMethods = {

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

  preloadOffers: async (route?: string) => {
    if (Platform.OS !== 'ios') return;
    try {
      await TyradsSdk.preloadOffers(route || null);
    } catch (err) {
      console.error("Error preloading offers:", err);
    }
  }
};

export default TyradsNativeMethods;
