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
      
        let engagementId = self.engagementId

        var fd: [String: Any?] = [
            "publisherUserId": userId,
            "platform": "iOS",
            "identifierType": identifierType,
            "engagementId": (engagementId != nil || engagementId != "") ? Int(engagementId!) : nil,
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
        // Use the async URLSession API to get data
        let (data, _) = try await URLSession.shared.data(for: request)
        
        let responseString = String(data: data, encoding: .utf8)
        self.log("Received response: \(responseString ?? "nil")")

        guard let acmoInitModel = try? JSONDecoder().decode(AcmoInitModel.self, from: data) else {
            self.log("Failed to decode response")
            throw NSError(domain: "TyradsSdk", code: 2, userInfo: [NSLocalizedDescriptionKey: "Failed to decode response"])
        }

        self.loginData = acmoInitModel
        self.publisherUserID = acmoInitModel.data.user.publisherUserId
        self.newUser = acmoInitModel.data.newRegisteredUser
        self.token = acmoInitModel.data.token
        self.log("Login successful. Publisher User ID: \(self.publisherUserID), New User: \(self.newUser)")
        self.mainColor = acmoInitModel.data.publisherApp.mainColor
        

        let headers = await ApiHeaders(
            xApiKey: self.apiKey,
            xApiSecret: self.apiSecret,
            xUserId: self.publisherUserID,
            xSdkPlatform: AcmoConfig.SDK_PLATFORM,
            xSdkVersion: AcmoConfig.SDK_VERSION,
            userAgent: UIDevice.current.systemName + "/" + UIDevice.current.systemVersion,
            languageCode: self.currentLanguage,
            premiumColor: acmoInitModel.data.publisherApp.premiumColor,
            headerColor: acmoInitModel.data.publisherApp.headerColor,
            mainColor: acmoInitModel.data.publisherApp.mainColor,
            privacyAccepted: hasAccepted
        )
        return headers
    }




  public func showOffers(_ launchMode: Int = 3, route: String? = nil, campaignID: Int? = nil) async {
    //        self.initializationWait.wait()
    let skipUserUpdate = getSkipUserUpdate()
    await ensureInitialized()
    var components = URLComponents()
    components.scheme = "https"
    components.host = "sdk.tyrads.com"
    //    components.path = "/\(route ?? "")"
    components.queryItems = [
      URLQueryItem(name: "token", value: self.token),
      URLQueryItem(name: "to", value: campaignID != nil ? "\(route ?? "")/\(campaignID!)" : route),
      URLQueryItem(name: "lang", value: self.currentLanguage),
      URLQueryItem(name: "skipUserInfo", value: "\(skipUserUpdate)")
    ]
    var urlString: String = ""
    if let url = components.url {
      urlString = url.absoluteString
      print(urlString)
    } else {
      print("Failed to create URL with components: \(components)")
    }
    
    do {
      guard let url = URL(string: urlString) else {
        throw NSError(domain: "TyradsSdk", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])
      }
      
      switch launchMode {
      case 1, 2:
        DispatchQueue.main.async {
          guard let rootVC = UIApplication.shared.windows.first?.rootViewController else { return }
          
          let showWebView: () -> Void = {
            let webVC = AcmoWebViewController(url: url)
            webVC.modalPresentationStyle = .fullScreen
            rootVC.present(webVC, animated: true)
          }
          
          let showUserUpdateOrWeb: () -> Void = {
            if Tyrads.instance.newUser {
              let userUpdateVC = AcmoUsersUpdateController(onSubmit: {
                showWebView()
              })
              userUpdateVC.isModalInPresentation = false
              rootVC.present(userUpdateVC, animated: true)
            } else {
              showWebView()
            }
          }
          
          let hasAccepted = Tyrads.instance.isPrivacyAccepted()
          
          if launchMode == 1 || launchMode == 2 {
            if !hasAccepted {
              let privacyController = AcmoPrivacyPolicyController(onAccept: {
                showUserUpdateOrWeb()
              })
              privacyController.modalPresentationStyle = .fullScreen
              rootVC.present(privacyController, animated: true)
            } else {
              showUserUpdateOrWeb()
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
    } catch {
      print("An error occurred: \(error)")
    }
  }
  
  public func setNewUser(_ newValue: Bool){
    self.newUser = newValue
  }
  
  public func setSkipUserUpdate(_ newValue: Bool){
    let key = "\(AcmoKeyNames.SKIP_FOR_USER_ID)\(self.publisherUserID)"
    UserDefaults.standard.set(newValue, forKey: key)
  }
  public func getSkipUserUpdate() -> Bool{
    let key = "\(AcmoKeyNames.SKIP_FOR_USER_ID)\(self.publisherUserID)"
    return (UserDefaults.standard.bool(forKey: key) || newUser == false)
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
        
        let showUserUpdate: () -> Void = {
          let userUpdateVC = AcmoUsersUpdateController(onSubmit: {
            rootVC.dismiss(animated: true) {
              print("User Update submitted, view dismissed.")
              finishFlow()
            }
          })
          userUpdateVC.isModalInPresentation = false
          rootVC.present(userUpdateVC, animated: true)
        }
        
        let hasAcceptedPrivacy = self.isPrivacyAccepted()
        let isNewUser = Tyrads.instance.newUser
        
        print("showPrivacyFlowAndDismissOnComplete: Privacy Accepted: \(hasAcceptedPrivacy), New User: \(isNewUser)")
        
        if !hasAcceptedPrivacy {
          let privacyController = AcmoPrivacyPolicyController(onAccept: {
            if isNewUser {
              showUserUpdate()
            } else {
              rootVC.dismiss(animated: true) {
                print("Privacy accepted, user is not new, view dismissed.")
                finishFlow()
              }
            }
          })
          privacyController.modalPresentationStyle = .fullScreen
          rootVC.present(privacyController, animated: true)
        } else if isNewUser {
          showUserUpdate()
        } else {
          print("Privacy accepted and user not new. No flow presented.")
          finishFlow()
        }
      }
    }
  }
}
