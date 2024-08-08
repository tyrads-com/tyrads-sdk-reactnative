import {NativeModules} from 'react-native';

const {TyradsModule} = NativeModules;

export default {
  init: (apiKey, apiSecret) => TyradsModule.init(apiKey, apiSecret),
  loginUser: userId => TyradsModule.loginUser(userId),
  showOffers: () => TyradsModule.showOffers(),
};