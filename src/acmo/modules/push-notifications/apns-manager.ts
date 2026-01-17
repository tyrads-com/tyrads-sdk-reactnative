import { Platform } from 'react-native';
import TyradsNativeMethods from '../../core/helpers/native_methods';

export interface PushNotificationEvent {
  type: 'received' | 'clicked' | 'dismissed';
  id?: string;
  data?: any;
}

export type PushEventCallback = (event: PushNotificationEvent) => void;

class ApnsManager {
  private static instance: ApnsManager;
  private tokenFetched: boolean = false;
  private pushEventSubscriptions: any[] = [];

  private initialized = false;
  private isLoggedIn = false;
  private pendingEvent: { identifier: string; userInfo: any } | null = null;

  private constructor() { }

  static getInstance(): ApnsManager {
    if (!ApnsManager.instance) {
      ApnsManager.instance = new ApnsManager();
    }
    return ApnsManager.instance;
  }

  setLoggedIn(status: boolean): void {
    this.isLoggedIn = status;
    if (this.isLoggedIn && this.pendingEvent) {
      const { identifier, userInfo } = this.pendingEvent;
      this.pendingEvent = null;
      this._onNotificationClicked(identifier, userInfo);
    }
  }

  async init(): Promise<void> {
    if (Platform.OS !== 'ios') {
      console.log('APNs is only available on iOS');
      return;
    }

    if (this.initialized) {
      return;
    }

    try {
      this._requestPushPermission();
      this._fetchTokenSafely();
      this._setupPushEventListeners();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize APNs manager:', error);
    }
  }

  private async _fetchTokenSafely(): Promise<void> {
    if (this.tokenFetched) {
      return;
    }

    try {
      const token = await this._fetchTokenWithRetry(3);
      if (token) {
        console.log('APNs token:', token);
        this.tokenFetched = true;
        this.emit('tokenFetched', token);
      } else {
        console.log('APNs token not available after retries');
      }
    } catch (error) {
      console.log('APNs token fetch failed:', error);
    }
  }

  private async _fetchTokenWithRetry(maxRetries: number): Promise<string | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Fetching APNs token (attempt ${attempt}/${maxRetries})...`);

        const token = await TyradsNativeMethods.getApnsToken();

        if (token && typeof token === 'string' && token.length > 0) {
          return token;
        }

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.log(`Attempt ${attempt} failed:`, error);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }
    return null;
  }


  private async _requestPushPermission(): Promise<void> {
    try {
      const granted = await TyradsNativeMethods.requestPushPermission();
      console.log('Push permission granted:', granted);
    } catch (error) {
      console.error('Error requesting push permission:', error);
    }
  }

  private _setupPushEventListeners(): void {
    const subscription = TyradsNativeMethods.addPushNotificationListener(
      (event: PushNotificationEvent) => {
        console.log('Push event:', event);
        const eventParsed = typeof event === 'string' ? JSON.parse(event) : event;
        this._handlePushEvent(eventParsed);
      }
    );

    this.pushEventSubscriptions.push(subscription);
  }

  private _handlePushEvent(event: PushNotificationEvent): void {
    switch (event.type) {
      case 'received':
        this._onNotificationReceived(event.data);
        break;
      case 'clicked':
        this._onNotificationClicked(event.id!, event.data);
        break;
      case 'dismissed':
        this._onNotificationDismissed(event.id!);
        break;
    }
  }

  private _onNotificationReceived(userInfo: any): void {
    console.log('Notification received:', userInfo);
    this.emit('notificationReceived', userInfo);
  }

  private async _onNotificationClicked(identifier: string, userInfo: any): Promise<void> {
    console.log('Notification clicked:', identifier, userInfo);
    const deepLink = userInfo['deepLink']

    if (!this.isLoggedIn && deepLink) {
      console.log('Notification clicked (iOS) but user not logged in. Queueing navigation.');
      this.pendingEvent = { identifier, userInfo };
      this.emit('notificationClicked', { identifier, userInfo });
      return;
    }

    this.emit('notificationClicked', { identifier, userInfo });
    if (deepLink != null && deepLink != '') {
      setTimeout(() => {
        TyradsNativeMethods.showOffers({
          route: deepLink,
          launchMode: 2,
        }).catch(err => {
          console.error('Failed to show offers from notification click (iOS):', err);
        });
      }, 500);
    }
  }

  private _onNotificationDismissed(identifier: string): void {
    console.log('Notification dismissed:', identifier);
    this.emit('notificationDismissed', identifier);
  }

  private listeners: Map<string, Function[]> = new Map();

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  async fetchToken(): Promise<string | null> {
    try {
      const token = await TyradsNativeMethods.getApnsToken();
      if (token) {
        this.tokenFetched = true;
        console.log('Manually fetched APNs token:', token);
      }
      return token;
    } catch (error) {
      console.error('Error fetching token:', error);
      return null;
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      return await TyradsNativeMethods.requestPushPermission();
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }

  addPushEventHandler(callback: PushEventCallback): any {
    return TyradsNativeMethods.addPushNotificationListener(callback);
  }

  dispose(): void {
    this.pushEventSubscriptions.forEach(subscription => {
      subscription.remove();
    });
    this.pushEventSubscriptions = [];
    this.listeners.clear();
    this.initialized = false;
  }

  isTokenFetched(): boolean {
    return this.tokenFetched;
  }

  async getCurrentToken(): Promise<string | null> {
    if (!this.tokenFetched) {
      return await this.fetchToken();
    }
    return await TyradsNativeMethods.getApnsToken();
  }
}

export default ApnsManager.getInstance();

export { ApnsManager };