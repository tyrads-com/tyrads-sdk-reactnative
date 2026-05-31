import Foundation
import UIKit
import Combine
import React


@objc(TyradsSdk)
class TyradsSdk: RCTEventEmitter , APNsNotificationListener{
  
  class PassthroughRootView: RCTRootView {
    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
      return super.hitTest(point, with: event)
    }
  }
  
  private var pushEventSink: RCTResponseSenderBlock?
  private var notificationViewController: UIViewController? = nil
  private var notificationView: UIView? = nil
  private var notificationWindow: UIWindow? = nil
  
  private var cancellable: AnyCancellable?

  override init() {
    super.init()
    APNsNotificationReceiver.shared.setListener(self)
  }
  
  override func startObserving() {
    cancellable = Tyrads.instance.languagePublisher
      .sink { [weak self] lang in
        self?.sendEvent(withName: "LanguageChanged", body: lang)
      }
  }
  
  override func stopObserving() {
    cancellable?.cancel()
    cancellable = nil
    APNsNotificationReceiver.shared.clearAll()
  }
  
  func onNotificationReceived(userInfo: [AnyHashable : Any]) {
    sendEvent(withName: "PushNotificationEvent", body: [
          "type": "received",
          "data": userInfo
        ])
  }
  
  func onNotificationClicked(identifier: String, userInfo: [AnyHashable : Any]) {
    sendEvent(withName: "PushNotificationEvent", body: [
          "type": "clicked",
          "id": identifier,
          "data": userInfo
        ])
  }
  
  func onNotificationDismissed(identifier: String) {
    sendEvent(withName: "PushNotificationEvent", body: [
          "type": "dismissed",
          "id": identifier
        ])
  }
  
  override func supportedEvents() -> [String]! {
    return ["LanguageChanged", "PushNotificationEvent"]
  }
  
  @objc
  func `init`(_ apiKey: String, secretKey: String, encKey: String? = nil, engagementId: String? = nil, placementId: String? = nil, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    NSLog("TyradsModule: init called with apiKey: \(apiKey) and secretKey: \(secretKey)")
    Task {
      do{
        let locale = await Tyrads.instance.configure(apiKey: apiKey, secretKey: secretKey, encKey: encKey, engagementId: engagementId, placementId: placementId)
        let result: [String: Any] = [
          "success": true,
          "languageCode": locale
        ]
        resolve (result)
      } catch {
        reject("INIT_FAILED", "Failed to initialize", error)
      }
    }
    
  }
  
  @objc
  func loginUser(_ userId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    NSLog("TyradsModule: loginUser called with userId: \(userId)")
    
    Task {
      do {
        guard let apiHeaders = try await Tyrads.instance.loginUser(userId) else {
          reject("LOGIN_ERROR", "Login failed or returned nil headers", nil)
          return
        }
        
        let result: [String: Any] = [
          "xApiKey": apiHeaders.xApiKey,
          "xApiSecret": apiHeaders.xApiSecret,
          "xUserId": apiHeaders.xUserId,
          "xSdkPlatform": apiHeaders.xSdkPlatform ?? "",
          "xSdkVersion": apiHeaders.xSdkVersion ?? "",
          "userAgent": apiHeaders.userAgent,
          "languageCode": apiHeaders.languageCode,
          "premiumColor": apiHeaders.premiumColor,
          "headerColor": apiHeaders.headerColor,
          "mainColor": apiHeaders.mainColor,
          "privacyAccepted": apiHeaders.privacyAccepted
        ]
        
        resolve(result)
      } catch {
        reject("LOGIN_ERROR", error.localizedDescription, error)
      }
    }
  }
  
  
  @objc(showOffers:route:resolver:rejecter:)
  func showOffers(_ launchMode: Int, route: String?, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task {
      await Tyrads.instance.showOffers(launchMode, route: route, campaignID: nil)
      resolve(nil)
    }
  }
  
  @objc(showOfferDetails:route:campaignID:resolver:rejecter:)
  func showOfferDetails(_ launchMode: Int, route: String?, campaignID: Int, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task {
      await Tyrads.instance.showOffers(launchMode, route: route, campaignID: campaignID)
      resolve(nil)
    }
  }

  @objc(preloadOffers:resolver:rejecter:)
  func preloadOffers(_ route: String?, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task { @MainActor in
      Tyrads.instance.preloadOffers(route: route)
      resolve(nil)
    }
  }
  
  @objc(changeLanguage:resolver:rejecter:)
  func changeLanguage(_ lang: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task {
      await Tyrads.instance.changeLanguage(lang)
      resolve(nil)
    }
  }
  
  @objc
  func setSDKVersion(_ version: String) {
    Tyrads.instance.setSDKVersion(version)
  }
  
  @objc
  func setMediaSourceInfo(_ mediaSourceInfo: NSDictionary) {
    do {
      let data = try JSONSerialization.data(withJSONObject: mediaSourceInfo, options: [])
      let decoded = try JSONDecoder().decode(TyradsMediaSourceInfo.self, from: data)
      
      Tyrads.instance.setMediaSourceInfo(decoded)
    } catch {
      NSLog("TyradsSDK Error: setMediaSourceInfo failed → \(error.localizedDescription)")
    }
  }
  
  @objc
  func setUserInfo(_ userInfo: NSDictionary) {
    do {
      let data = try JSONSerialization.data(withJSONObject: userInfo, options: [])
      let decoded = try JSONDecoder().decode(TyradsUserInfo.self, from: data)
      
      Tyrads.instance.setUserInfo(decoded)
    } catch {
      NSLog("TyradsSDK Error: setUserInfo failed → \(error.localizedDescription)")
    }
  }

  
  @objc
  func isPrivacyAccepted(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let accepted = Tyrads.instance.isPrivacyAccepted()
    resolve(accepted)
  }
  
  @objc
  func checkOnboardingProcess(_ resolver: @escaping RCTPromiseResolveBlock,rejecter: @escaping RCTPromiseRejectBlock) {
    Task {
      let result = await Tyrads.instance.checkOnboardingProcess()
      resolver(result)
    }
  }
  
  // APNs
  @objc(pushRequestPermission:rejecter:)
    func pushRequestPermission(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      APNsNotificationManager.shared.requestPermission { success in
        resolve(success)
      }
    }
    
  @objc(pushGetApnsToken:rejecter:)
  func pushGetApnsToken(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    APNsNotificationManager.shared.getToken { token in
      resolve(token)
    }
  }

  @objc
  func showInAppNotification() {
    print("TyradsSdk: showInAppNotification called")
    DispatchQueue.main.async {
      guard let bridge = self.bridge else { 
        print("TyradsSdk: ERROR - Bridge not available")
        return 
      }
      print("TyradsSdk: Bridge bundle URL: \(bridge.bundleURL?.absoluteString ?? "nil")")
      self.notificationView?.removeFromSuperview()
      self.notificationView = nil
      self.notificationWindow?.isHidden = true
      self.notificationWindow = nil

      let frame = UIScreen.main.bounds
      let window: UIWindow
      if #available(iOS 13.0, *), let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
          window = UIWindow(windowScene: windowScene)
      } else {
          window = UIWindow(frame: frame)
      }
      window.windowLevel = .alert + 1
      window.frame = frame
      window.backgroundColor = .clear
      
      let rootView = PassthroughRootView(
        bridge: bridge,
        moduleName: "TyradsSdkExample",
        initialProperties: nil
      )
      
      rootView.backgroundColor = .yellow
      rootView.frame = frame
      let vc = UIViewController()
      vc.view = rootView
      window.rootViewController = vc
      
      self.notificationView = rootView
      self.notificationWindow = window
      window.isHidden = false
      print("TyradsSdk: Notification window is now visible (isHidden = false)")
    }
  }

  @objc
  func dismissInAppNotification() {
    print("TyradsSdk: dismissInAppNotification called")
    DispatchQueue.main.async {
      self.notificationView?.removeFromSuperview()
      self.notificationView = nil
      self.notificationWindow?.isHidden = true
      self.notificationWindow = nil
    }
  }

}
