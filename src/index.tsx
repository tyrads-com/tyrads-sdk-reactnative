import { NativeModules, Platform } from 'react-native';

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

const TyradsModule = NativeModules.TyradsModule
  ? NativeModules.TyradsModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const Tyrads = {
  init: (apiKey: string, apiSecret: string) => {
    if (Platform.OS === 'ios') {
      return TyradsSdk.init(apiKey, apiSecret);
    } else {
      return TyradsModule.init(apiKey, apiSecret);
    }
  },
  loginUser: (userId: string) => {
    if (Platform.OS === 'ios') {
      return TyradsSdk.loginUser(userId);
    } else {
      return TyradsModule.loginUser(userId);
    }
  },
  showOffers: ({ launchMode }: { launchMode?: number } = {}) => {
    if (Platform.OS === 'ios') {
      if (typeof launchMode === 'undefined') {
        return TyradsSdk.showOffers(3);
      } else {
        return TyradsSdk.showOffers(launchMode);
      }
    } else {
      return TyradsModule.showOffers();
    }
  },
};

export default Tyrads;
