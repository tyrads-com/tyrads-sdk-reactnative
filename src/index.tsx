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

const Tyrads = {
  init: (apiKey: string, apiSecret: string) => {
    return TyradsSdk.init(apiKey, apiSecret);
  },
  loginUser: (userId: string) => {
    return TyradsSdk.loginUser(userId);
  },
  showOffers: ({
    launchMode = 3,
    route,
    campaignID = 0,
  }: { launchMode?: number; route?: string; campaignID?: number } = {}) => {
    if (Platform.OS === 'ios') {
      return TyradsSdk.showOffers(launchMode, route, campaignID);
    } else {
      return TyradsSdk.showOffers(route, campaignID);
    }
  },
};

export default Tyrads;
