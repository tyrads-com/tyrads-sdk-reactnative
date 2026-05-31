import { NativeEventEmitter, NativeModules, Platform } from "react-native";
import { AcmoConfig } from "../../acmo_config";
import type { TyradsConfig, TyradsMediaSourceInfo, TyradsUserInfo } from "./types/external_types";
import NetworkCommon from "./network/network-common";
import { FcmManager } from "../modules/push-notifications/fcm-manager";
import { ApnsManager } from "../modules/push-notifications/apns-manager";
import { saveData } from "./storage/storage";
import { changeProviderLanguage, updateProviderLanguage } from "../modules/localization/localization_context";
import Localization from './services/localization_service';
import InAppNotificationController from "../modules/inapp-notifications/controller";

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

export interface PushNotificationEvent {
  type: 'received' | 'clicked' | 'dismissed';
  id?: string;
  data?: any;
}

export type PushNotificationCallback = (event: PushNotificationEvent) => void;

export class TyradsSdkCore {
  private static instance: TyradsSdkCore;
  private tyradsEmitter: NativeEventEmitter;
  private languageChangedSubscription: any = null;

  private constructor() {
    this.tyradsEmitter = new NativeEventEmitter(TyradsSdk);
  }

  public static getInstance(): TyradsSdkCore {
    if (!TyradsSdkCore.instance) {
      TyradsSdkCore.instance = new TyradsSdkCore();
    }
    return TyradsSdkCore.instance;
  }
  public userId: string = "";
  public apiKey: string = "";
  public apiSecret: string = "";
  public encKey?: string = "";
  public engagementId?: string = "";
  public placementId?: string = "";

  public premiumColor?: string;
  public mainColor?: string;
  public currentLanguage: string = "en";

  public async init(
    apiKey: string,
    apiSecret: string,
    encKey?: string,
    engagementId?: string,
    placementId?: string,
    mediaSourceInfo?: TyradsMediaSourceInfo,
    userInfo?: TyradsUserInfo,
    config?: TyradsConfig,
  ) {
    this.setSDKVersion();
    if (mediaSourceInfo) {
      this.setMediaSourceInfo(mediaSourceInfo);
    }
    if (userInfo) {
      this.setUserInfo(userInfo);
    }
    var data;
    if (Platform.OS === 'ios') {
      data = await TyradsSdk.init(apiKey, apiSecret, encKey, engagementId, placementId);
    } else {
      data = await TyradsSdk.init(apiKey, apiSecret, encKey, engagementId, placementId, config);
    }

    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.encKey = encKey;
    this.engagementId = engagementId;
    this.placementId = placementId;

    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (parsed?.languageCode) {
        this.currentLanguage = parsed.languageCode;
      }
    } catch { }

    await Localization.getInstance().init(this.currentLanguage);
    await NetworkCommon.getInstance().init();

    if (Platform.OS === 'android') {
      await FcmManager.getInstance().init().catch(console.error);
    }
    if (Platform.OS === 'ios') {
      await ApnsManager.getInstance().init().catch(console.error);
    }
    TyradsSdk.startObserving();
    this.languageChangedSubscription?.remove();
    this.languageChangedSubscription = this.tyradsEmitter.addListener(
      'LanguageChanged',
      async (lang: string) => {
        console.log('LanguageChanged event from Android SDK:', lang);
        await changeProviderLanguage(lang);
      }
    );
    await updateProviderLanguage(this.currentLanguage);

    return data;
  }

  public async loginUser(userId: string) {
    try {
      const data = await TyradsSdk.loginUser(userId);
      if (typeof data === "object") {
        await saveData('xUserId', data.xUserId);
        this.userId = data.xUserId;
        this.currentLanguage = data.currentLanguage;
        this.premiumColor = data.premiumColor;
        this.mainColor = data.mainColor;
      } else if (typeof data === "string") {
        await saveData('xUserId', JSON.parse(data).xUserId);
        this.userId = JSON.parse(data).xUserId;
        this.currentLanguage = JSON.parse(data).languageCode;
        this.premiumColor = JSON.parse(data).premiumColor;
        this.mainColor = JSON.parse(data).mainColor;
      }
      await NetworkCommon.getInstance().init();
      if (Platform.OS === 'android') {
        FcmManager.getInstance().setLoggedIn(true);
      } else {
        ApnsManager.getInstance().setLoggedIn(true);
      }

      InAppNotificationController.getInstance().init().catch(err => console.error("In-app notification init error:", err));

      return data;
    } catch (err) {
      console.error('Error logging in user:', err);
      return null;
    }
  }

  public async showOffers({
    launchMode = 3,
    route,
    campaignID,
  }: { launchMode?: number; route?: string; campaignID?: number | null } = {}) {
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
  }

  public async changeLanguage(lang: string) {
    return await TyradsSdk.changeLanguage(lang);
  }

  public async preloadOffers(route?: string) {
    if (Platform.OS !== 'ios') return;
    try {
      await TyradsSdk.preloadOffers(route || null);
    } catch (err) {
      console.error("Error preloading offers:", err);
    }
  }

  public setSDKVersion() {
    const version = AcmoConfig.SDK_VERSION;
    TyradsSdk.setSDKVersion(version);
  }

  public setMediaSourceInfo(mediaSourceInfo: TyradsMediaSourceInfo) {
    TyradsSdk.setMediaSourceInfo(mediaSourceInfo);
  }

  public setUserInfo(userInfo: TyradsUserInfo) {
    TyradsSdk.setUserInfo(userInfo);
  }


  public async isPrivacyAccepted() {
    try {
      return await TyradsSdk.isPrivacyAccepted();
    } catch (err) {
      console.error("Error checking privacy acceptance:", err);
      return false;
    }
  }

  public async checkOnboardingProcess() {
    try {
      const result = await TyradsSdk.checkOnboardingProcess();
      return result === true;
    } catch (err) {
      console.error("Error showing privacy flow:", err);
      return false;
    }
  }

  public async requestPushPermission(): Promise<boolean> {
    try {
      const granted = await TyradsSdk.pushRequestPermission();
      return granted === true;
    } catch (err) {
      console.error("Error requesting push permission:", err);
      return false;
    }
  }

  public async getApnsToken(): Promise<string | null> {
    try {
      const token = await TyradsSdk.pushGetApnsToken();
      return token || null;
    } catch (err) {
      console.error("Error getting APNs token:", err);
      return null;
    }
  }

  public addPushNotificationListener(callback: PushNotificationCallback) {
    return this.tyradsEmitter.addListener('PushNotificationEvent', callback);
  }

  public startObserving() {
    TyradsSdk.startObserving();
  }

  public stopObserving() {
    TyradsSdk.stopObserving();
  }

  public dismissInAppNotification() {
    TyradsSdk.dismissInAppNotification();
  }
}

export default TyradsSdkCore.getInstance();
