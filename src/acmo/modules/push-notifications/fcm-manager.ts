import { Platform } from 'react-native';
import TyradsNativeMethods from '../../core/helpers/native_methods';

export interface PushNotificationEvent {
  type: 'received' | 'clicked' | 'dismissed';
  id?: string;
  data?: any;
}

export type PushEventCallback = (event: PushNotificationEvent) => void;

class FcmManager {
  private static instance: FcmManager;
  private pushEventSubscriptions: any[] = [];

  private initialized = false;
  private isLoggedIn = false;
  private pendingEvent: { identifier: string; userInfo: any } | null = null;

  private constructor() { }

  static getInstance(): FcmManager {
    if (!FcmManager.instance) {
      FcmManager.instance = new FcmManager();
    }
    return FcmManager.instance;
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
    if (Platform.OS !== 'android') {
      console.log('FCM is only available on Android');
      return;
    }

    if (this.initialized) {
      return;
    }

    try {
      this._setupPushEventListeners();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize FCM manager:', error);
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
          console.error('Failed to show offers from notification click:', err);
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
}

export default FcmManager.getInstance();

export { FcmManager };