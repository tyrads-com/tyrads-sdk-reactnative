import Foundation
import UIKit
import AppTrackingTransparency
import AdSupport
import WebKit
import Combine


/// The TyradsSdk class provides methods for configuring the SDK and displaying offers.
public class Tyrads : NSObject {
  /// Shared instance of the TyradsSdk.
  public static let instance = Tyrads()
  
  internal var apiKey: String = ""
  internal var apiSecret: String = ""
  internal var encKey: String?
  internal var engagementId: String?
  internal var publisherUserID: String = ""
  internal var mainColor: String?
  private var token: String = ""
  internal var currentLanguage: String = "en" {
    didSet {
      if oldValue != currentLanguage {
        languagePublisher.send(currentLanguage)
      }
    }
  }
  
  public let languagePublisher = PassthroughSubject<String, Never>()
  internal var newUser: Bool = false
  private var loginData: AcmoInitModel?
  var initializationWait = DispatchSemaphore(value: 0)
  private var initializationContinuation: CheckedContinuation<Void, Never>?
  private var debugMode: Bool = false
  
  private var _isSecure: Bool = false
  public var isSecure: Bool {
    get {
      return _isSecure
    }
  }
  
  private var preloadedWebVC: AcmoWebViewController?
  
  internal func log(_ message: String) {
    if debugMode {
      NSLog(message)
    }
  }
  
  private func ensureInitialized() async {
    guard self.token.isEmpty else { return }
    
    await withCheckedContinuation { continuation in
      self.initializationContinuation = continuation
    }
  }
  
  private var mediaSourceInfo: TyradsMediaSourceInfo?
  private var userInfo: TyradsUserInfo?
  
  /// Configures the Tyrads SDK with the provided API key and secret key.
  ///
  /// - Parameters:
  ///   - apiKey: The API key provided by Tyrads.
  ///   - secretKey: The secret key provided by Tyrads.
  @objc public func configure( apiKey: String, secretKey: String, encKey: String? = nil, engagementId: String? = nil, debugMode: Bool = false) async -> String {
    self.apiKey = apiKey
    self.apiSecret = secretKey
    self.encKey = encKey
    self.engagementId = engagementId
    self._isSecure = (encKey != nil)
    self.debugMode = debugMode
    
    let savedLocale = UserDefaults.standard.string(forKey: "locale")
    let deviceLocale = Locale.current.languageCode ?? "en"
    self.currentLanguage = savedLocale ?? deviceLocale
    await LocalizationService.shared.initialize(locale: self.currentLanguage)
    return self.currentLanguage
  }
  
  /// Logs in the user with the provided user ID or retrieves the user ID from UserDefaults.
  ///
  /// - Parameter userID: Optional. The user ID to log in with. If nil, the SDK will attempt to retrieve the user ID from UserDefaults.
  public func loginUser(_ userID: String? = nil) async throws -> ApiHeaders? {
    let userId = userID ?? UserDefaults.standard.string(forKey: "acmo-tyrads-sdk-user-id") ?? ""
    var identifierType = "IDFA"
    var advertisingId = ""
    let deviceDetails = getDeviceDetails()
    
    if #available(iOS 14, *) {
      self.log("Requesting tracking authorization for iOS 14+")
      let status = await ATTrackingManager.requestTrackingAuthorization()
      switch status {
      case .authorized:
        advertisingId = ASIdentifierManager.shared().advertisingIdentifier.uuidString
        self.log("Tracking authorized. Advertising ID: \(advertisingId)")
      case .denied, .restricted, .notDetermined:
        advertisingId = "\(deviceDetails["deviceId"] ?? UUID().uuidString)"
        identifierType = "OTHER"
        self.log("Tracking not authorized or restricted")
      @unknown default:
        self.log("Unknown tracking status")
      }
    } else {
      advertisingId = ASIdentifierManager.shared().advertisingIdentifier.uuidString
      self.log("iOS version < 14. Advertising ID: \(advertisingId)")
    }
    
    let engagementIDInt: Int? = {
      guard let engagementId = self.engagementId, !engagementId.isEmpty else { return nil }
      return Int(engagementId)
    }()
    
    let storedToken = UserDefaults.standard.string(forKey: AcmoKeyNames.APNS_TOKEN)
    
    var fd: [String: Any?] = [
      "publisherUserId": userId,
      "platform": "iOS",
      "devicePushToken": storedToken,
      "identifierType": identifierType,
      "engagementId": engagementIDInt,
      "identifier": advertisingId,
      "deviceData": deviceDetails
    ]
    
    if let info = mediaSourceInfo {
      if let sub1 = info.sub1 { fd["sub1"] = sub1 }
      if let sub2 = info.sub2 { fd["sub2"] = sub2 }
      if let sub3 = info.sub3 { fd["sub3"] = sub3 }
      if let sub4 = info.sub4 { fd["sub4"] = sub4 }
      if let sub5 = info.sub5 { fd["sub5"] = sub5 }
      if let mediaSourceName = info.mediaSourceName { fd["mediaSourceName"] = mediaSourceName }
      if let mediaSourceId = info.mediaSourceId { fd["mediaSourceId"] = mediaSourceId }
      if let mediaSubSourceId = info.mediaSubSourceId { fd["mediaSubSourceId"] = mediaSubSourceId }
      if let incentivized = info.incentivized { fd["incentivized"] = incentivized }
      if let mediaAdsetName = info.mediaAdsetName { fd["mediaAdsetName"] = mediaAdsetName }
      if let mediaAdsetId = info.mediaAdsetId { fd["mediaAdsetId"] = mediaAdsetId }
      if let mediaCreativeName = info.mediaCreativeName { fd["mediaCreativeName"] = mediaCreativeName }
      if let mediaCreativeId = info.mediaCreativeId { fd["mediaCreativeId"] = mediaCreativeId }
      if let mediaCampaignName = info.mediaCampaignName { fd["mediaCampaignName"] = mediaCampaignName }
    }
    
    if let info = userInfo {
      if let email = info.email { fd["email"] = email }
      if let phoneNumber = info.phoneNumber { fd["phoneNumber"] = phoneNumber }
      if let userGroup = info.userGroup { fd["userGroup"] = userGroup }
    }
    
    self.log("Initializing with data: \(fd)")
    guard let url = URL(string: AcmoConfig.BASE_URL + "initialize") else {
      self.log("Failed to create URL")
      throw NSError(domain: "TyradsSdk", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])
    }
    
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue(AcmoConfig.SDK_PLATFORM, forHTTPHeaderField: "X-SDK-Platform")
    request.setValue(AcmoConfig.SDK_VERSION, forHTTPHeaderField: "X-SDK-Version")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue(self.apiKey, forHTTPHeaderField: "X-API-Key")
    request.setValue(self.apiSecret, forHTTPHeaderField: "X-API-Secret")
    request.setValue(_isSecure ? "BASIC" : "PLAIN", forHTTPHeaderField: "X-Secure-Mode")
    
    do {
      let requestBody = _isSecure && !(encKey ?? "").isEmpty ? try AcmoEncrypt(encKey!).encryptDataAESGCM(data: fd) : fd
      request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)
    } catch {
      self.log("Failed to serialize request body: \(error)")
      throw error
    }
    let hasAccepted = UserDefaults.standard.bool(forKey: "\(AcmoKeyNames.PRIVACY_ACCEPTED_FOR_USER_ID)\(Tyrads.instance.publisherUserID)")
    let (data, _) = try await URLSession.shared.data(for: request)
    
    let responseString = String(data: data, encoding: .utf8)
    self.log("Received response: \(responseString ?? "nil")")
    
    let acmoInitModel: AcmoInitModel
    do {
      acmoInitModel = try JSONDecoder().decode(AcmoInitModel.self, from: data)
    } catch {
      self.log("Failed to decode response: \(error)")
      throw NSError(domain: "TyradsSdk", code: 2, userInfo: [NSLocalizedDescriptionKey: "Failed to decode response: \(error) \nResponse: \(responseString)\nRequestHeaders: \(request.allHTTPHeaderFields ?? [:])"])
    }
    
    self.loginData = acmoInitModel
    self.publisherUserID = acmoInitModel.data.accountInfo.publisherUserId
    self.newUser = acmoInitModel.data.newRegisteredUser
    self.token = acmoInitModel.data.token
    self.log("Login successful. Publisher User ID: \(self.publisherUserID), New User: \(self.newUser)")
    self.mainColor = acmoInitModel.data.appInfo.mainColor
    
    let headers = await ApiHeaders(
      xApiKey: self.apiKey,
      xApiSecret: self.apiSecret,
      xUserId: self.publisherUserID,
      xSdkPlatform: AcmoConfig.SDK_PLATFORM,
      xSdkVersion: AcmoConfig.SDK_VERSION,
      userAgent: UIDevice.current.systemName + "/" + UIDevice.current.systemVersion,
      languageCode: self.currentLanguage,
      premiumColor: acmoInitModel.data.appInfo.premiumColor,
      headerColor: acmoInitModel.data.appInfo.headerColor,
      mainColor: acmoInitModel.data.appInfo.mainColor,
      privacyAccepted: hasAccepted
    )
    
    Task { @MainActor in
      self.preloadOffers()
    }
    
    return headers
  }
  
  
  
  
  public func getOffersURL(route: String? = nil, campaignID: Int? = nil) -> URL? {
    
    let normalizedRoute = (route?.isEmpty ?? true) ? nil : route
    
    var components = URLComponents()
    components.scheme = "https"
    components.host = "v4.sdk.tyrads.com"
    components.queryItems = [
      URLQueryItem(name: "token", value: self.token),
      URLQueryItem(name: "to", value: campaignID != nil ? "\(normalizedRoute ?? "")/\(campaignID!)" : normalizedRoute),
      URLQueryItem(name: "lang", value: self.currentLanguage)
    ]
    return components.url
  }
  
  @MainActor
  public func preloadOffers(route: String? = nil) {
    let normalizedRoute = (route?.isEmpty ?? true) ? nil : route
    
    // only preload the default offerwall (no specific route)
    if normalizedRoute != nil {
      self.log("Preload: Skipping specific route \(normalizedRoute!)")
      return
    }
    
    guard !self.token.isEmpty else {
      self.log("Preload failed: token is empty")
      return
    }
    guard let url = getOffersURL(route: nil) else {
      self.log("Preload failed: failed to generate URL")
      return
    }
    
    self.log("Preloading default webview for URL: \(url.absoluteString)")
    
    if let existing = self.preloadedWebVC, existing.initialURL.absoluteString == url.absoluteString {
      self.log("Preload: Already have a matching preloaded VC, skipping recreation.")
      return
    }
    
    let webVC = AcmoWebViewController(url: url)
    _ = webVC.view
    self.preloadedWebVC = webVC
  }
  
  public func showOffers(_ launchMode: Int = 2, route: String? = nil, campaignID: Int? = nil) async {
    await ensureInitialized()
    
    guard let url = getOffersURL(route: route, campaignID: campaignID) else {
      self.log("Failed to create URL for showOffers")
      return
    }
    
    switch launchMode {
    case 1, 2:
      DispatchQueue.main.async {
        guard let rootVC = UIApplication.shared.windows.first?.rootViewController else { return }
        
        let showWebView: () -> Void = {
          let webVC: AcmoWebViewController
          
          let isDefault = (route?.isEmpty ?? true) && campaignID == nil
          
          let isMatch: Bool = {
            guard isDefault else { return false }
            
            guard let preloaded = self.preloadedWebVC else {
              self.log("Preload Check: No preloaded webview found.")
              return false
            }
            let preloadedURL = preloaded.initialURL
            
            if preloadedURL.absoluteString == url.absoluteString { return true }
            
            guard let comp1 = URLComponents(url: preloadedURL, resolvingAgainstBaseURL: false),
                  let comp2 = URLComponents(url: url, resolvingAgainstBaseURL: false) else { return false }
            
            let q1 = comp1.queryItems ?? []
            let q2 = comp2.queryItems ?? []
            
            if q1.count != q2.count {
              return false
            }
            
            let matchesAll = q1.allSatisfy { item1 in
              q2.contains { item2 in item1.name == item2.name && item1.value == item2.value }
            }
            
            return matchesAll && comp1.host == comp2.host && comp1.path == comp2.path
          }()
          
          if isMatch, let preloaded = self.preloadedWebVC {
            self.log("Preload Check: MATCH FOUND. Using shared default webview.")
            webVC = preloaded
          } else {
            self.log("Preload Check: Loading normally. (Req: \(isDefault ? "default" : "specific route"), Preload Available: \(self.preloadedWebVC != nil))")
            webVC = AcmoWebViewController(url: url)
          }
          
          webVC.onDismiss = {
            webVC.onDismiss = nil
          }
          
          if webVC.presentingViewController != nil || webVC.isBeingPresented || webVC.isBeingDismissed {
            self.log("Preload Check: WebView is already busy/showing. Ignoring tap.")
            return
          }
          
          webVC.modalPresentationStyle = .fullScreen
          rootVC.present(webVC, animated: true)
        }
        
        let hasAccepted = Tyrads.instance.isPrivacyAccepted()
        
        if launchMode == 1 || launchMode == 2 {
          if !hasAccepted {
            let privacyController = AcmoPrivacyPolicyController(onAccept: {
              showWebView()
            })
            privacyController.modalPresentationStyle = .fullScreen
            rootVC.present(privacyController, animated: true)
          } else {
            showWebView()
          }
        } else {
          UIApplication.shared.open(url, options: [:], completionHandler: nil)
        }
      }
    case 3:
      DispatchQueue.main.async {
        UIApplication.shared.open(url, options: [:], completionHandler: nil)
      }
    default:
      DispatchQueue.main.async {
        UIApplication.shared.open(url, options: [:], completionHandler: nil)
      }
    }
  }
  
  public func setNewUser(_ newValue: Bool){
    self.newUser = newValue
  }
  
  public func setSDKVersion(_ sdkVersion: String) {
    AcmoConfig.SDK_VERSION = sdkVersion
  }
  
  public func setMediaSourceInfo(_ mediaSourceInfo: TyradsMediaSourceInfo){
    self.mediaSourceInfo = mediaSourceInfo
  }
  
  public func setUserInfo(_ userInfo: TyradsUserInfo){
    self.userInfo = userInfo
  }
  
  public func changeLanguage(_ lang: String) async {
    self.currentLanguage = lang
    UserDefaults.standard.set(lang, forKey: "locale")
    await LocalizationService.shared.changeLanguage(locale: lang)
    
    self.preloadedWebVC = nil
  }
  
  public func isPrivacyAccepted() -> Bool {
    let key = "\(AcmoKeyNames.PRIVACY_ACCEPTED_FOR_USER_ID)\(self.publisherUserID)"
    return UserDefaults.standard.bool(forKey: key)
  }
  
  public func checkOnboardingProcess() async -> Bool {
    await ensureInitialized()
    
    return await withCheckedContinuation { continuation in
      Task { @MainActor in
        guard let rootVC = UIApplication.shared.windows.first?.rootViewController else {
          continuation.resume(returning: false)
          return
        }
        
        let finishFlow: () -> Void = {
          continuation.resume(returning: true)
        }
        
        let hasAcceptedPrivacy = self.isPrivacyAccepted()
        
        print("showPrivacyFlowAndDismissOnComplete: Privacy Accepted: \(hasAcceptedPrivacy)")
        
        if !hasAcceptedPrivacy {
          let privacyController = AcmoPrivacyPolicyController(onAccept: {
            rootVC.dismiss(animated: true) {
              print("Privacy accepted, view dismissed.")
              finishFlow()
            }
          })
          privacyController.modalPresentationStyle = .fullScreen
          rootVC.present(privacyController, animated: true)
        } else {
          print("Privacy accepted. No flow presented.")
          finishFlow()
        }
      }
    }
  }
}
