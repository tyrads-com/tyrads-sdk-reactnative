import Foundation
import UIKit
import AppTrackingTransparency
import AdSupport
import WebKit



/// The TyradsSdk class provides methods for configuring the SDK and displaying offers.
public class Tyrads : NSObject {
    /// Shared instance of the TyradsSdk.
    public static let instance = Tyrads()

    private var apiKey: String = ""
    private var apiSecret: String = ""
    private var encKey: String?
    private var publisherUserID: String = ""
    private var token: String = ""
    private var currentLanguage: String = "en"
    private var newUser: Bool = false
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

    private func log(_ message: String) {
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

    /// Configures the Tyrads SDK with the provided API key and secret key.
    ///
    /// - Parameters:
    ///   - apiKey: The API key provided by Tyrads.
    ///   - secretKey: The secret key provided by Tyrads.
  @objc public func configure( apiKey: String, secretKey: String, encKey: String? = nil, debugMode: Bool = false) {
        self.apiKey = apiKey
        self.apiSecret = secretKey
        self.encKey = encKey
        self._isSecure = (encKey != nil)
        self.debugMode = debugMode
        self.currentLanguage = Locale.current.languageCode ?? ""
    }

    /// Logs in the user with the provided user ID or retrieves the user ID from UserDefaults.
    ///
    /// - Parameter userID: Optional. The user ID to log in with. If nil, the SDK will attempt to retrieve the user ID from UserDefaults.
    public func loginUser(_ userID: String? = nil) async throws -> ApiHeaders? {
        let userId = userID ?? UserDefaults.standard.string(forKey: "acmo-tyrads-sdk-user-id") ?? ""
        let identifierType = "IDFA"
        var advertisingId = ""

        if #available(iOS 14, *) {
            self.log("Requesting tracking authorization for iOS 14+")
            let status = await ATTrackingManager.requestTrackingAuthorization()
            switch status {
            case .authorized:
                advertisingId = ASIdentifierManager.shared().advertisingIdentifier.uuidString
                self.log("Tracking authorized. Advertising ID: \(advertisingId)")
            case .denied, .restricted, .notDetermined:
                advertisingId = ""
                self.log("Tracking not authorized or restricted")
            @unknown default:
                self.log("Unknown tracking status")
            }
        } else {
            advertisingId = ASIdentifierManager.shared().advertisingIdentifier.uuidString
            self.log("iOS version < 14. Advertising ID: \(advertisingId)")
        }

        let deviceDetails = getDeviceDetails()
        let fd: [String: Any] = [
            "publisherUserId": userId,
            "platform": "iOS",
            "identifierType": identifierType,
            "identifier": advertisingId,
            "deviceData": deviceDetails
        ]

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

        let headers = await ApiHeaders(
            xApiKey: self.apiKey,
            xApiSecret: self.apiSecret,
            xUserId: self.publisherUserID,
            xSdkPlatform: AcmoConfig.SDK_PLATFORM,
            xSdkVersion: AcmoConfig.SDK_VERSION,
            userAgent: UIDevice.current.systemName + "/" + UIDevice.current.systemVersion,
            languageCode: Locale.current.languageCode ?? "en",
            premiumColor: acmoInitModel.data.publisherApp.premiumColor,
            headerColor: acmoInitModel.data.publisherApp.headerColor,
            mainColor: acmoInitModel.data.publisherApp.mainColor
        )
        return headers
    }




     public func showOffers(_ launchMode: Int = 3, route: String? = nil, campaignID: Int? = nil) async {
//        self.initializationWait.wait()
       await ensureInitialized()
       var components = URLComponents()
       components.scheme = "https"
       components.host = "sdk.tyrads.com"
    //    components.path = "/\(route ?? "")"
       components.queryItems = [
          URLQueryItem(name: "token", value: self.token),
          URLQueryItem(name: "to", value: campaignID != nil ? "\(route ?? "")/\(campaignID!)" : route)
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
                    let acmoVC = AcmoWebViewController(url: url)
                    acmoVC.modalPresentationStyle = .fullScreen
                    
//                    if let rootViewController = UIApplication.shared.windows.first?.rootViewController {
//                        rootViewController.present(acmoVC, animated: true, completion: nil)
//                    }
                  if let rootViewController = UIApplication.shared.windows.first?.rootViewController {
                                      var topViewController = rootViewController
                                      while let presentedVC = topViewController.presentedViewController {
                                          topViewController = presentedVC
                                      }
                                      topViewController.present(acmoVC, animated: true, completion: nil)
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
}
