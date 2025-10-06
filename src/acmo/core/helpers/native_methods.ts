import { NativeModules, Platform } from "react-native";

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
  }
};

export default TyradsNativeMethods;
