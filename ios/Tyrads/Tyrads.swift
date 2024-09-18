import Foundation
import UIKit
import AppTrackingTransparency
import AdSupport
import WebKit



/// The TyradsSdk class provides methods for configuring the SDK and displaying offers.
public class Tyrads {
    /// Shared instance of the TyradsSdk.
    public static let instance = Tyrads()

    private var apiKey: String = ""
    private var apiSecret: String = ""
    private var publisherUserID: String = ""
    private var newUser: Bool = false
    private var loginData: AcmoInitModel?
    var initializationWait = DispatchSemaphore(value: 0)
    private var debugMode: Bool = false

    private func log(_ message: String) {
        if debugMode {
            NSLog(message)
        }
    }

    /// Configures the Tyrads SDK with the provided API key and secret key.
    ///
    /// - Parameters:
    ///   - apiKey: The API key provided by Tyrads.
    ///   - secretKey: The secret key provided by Tyrads.
    @objc public func configure( apiKey: String, secretKey: String, debugMode: Bool = false) {
        self.apiKey = apiKey
        self.apiSecret = secretKey
        self.debugMode = debugMode
    }

    /// Logs in the user with the provided user ID or retrieves the user ID from UserDefaults.
    ///
    /// - Parameter userID: Optional. The user ID to log in with. If nil, the SDK will attempt to retrieve the user ID from UserDefaults.
    @objc public func loginUser(_ userID: String? = nil) {
        do {
            let userId = userID ?? UserDefaults.standard.string(forKey: "acmo-tyrads-sdk-user-id") ?? ""

            let identifierType = "IDFA"
            var advertisingId = ""
            if #available(iOS 14, *) {
                log("Requesting tracking authorization for iOS 14+")
                ATTrackingManager.requestTrackingAuthorization { status in
                    switch status {
                    case .authorized:
                        advertisingId = ASIdentifierManager.shared().advertisingIdentifier.uuidString
                        self.log("Tracking authorized. Advertising ID: \(advertisingId)")
                    case .denied:
                        advertisingId = ""
                        self.log("Tracking denied")
                    case .restricted:
                        advertisingId = ""
                        self.log("Tracking restricted")
                    case .notDetermined:
                        advertisingId = ""
                        self.log("Tracking not determined")
                    @unknown default:
                        self.log("Unknown tracking status")
                    }
                }
            } else {
                advertisingId = ASIdentifierManager.shared().advertisingIdentifier.uuidString
                log("iOS version < 14. Advertising ID: \(advertisingId)")
            }
            let fd: [String: Any] = [
                "publisherUserId": userId,
                "platform": "iOS",
                "identifierType": identifierType,
                "identifier": advertisingId
            ]

            log("Initializing with data: \(fd)")

            guard let url = URL(string: AcmoConfig.BASE_URL + "initialize") else {
                log("Failed to create URL")
                return
            }

            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue(AcmoConfig.SDK_PLATFORM, forHTTPHeaderField: "X-SDK-Platform")
            request.setValue(AcmoConfig.SDK_VERSION, forHTTPHeaderField: "X-SDK-Version")
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue(self.apiKey, forHTTPHeaderField: "X-API-Key")
            request.setValue(self.apiSecret, forHTTPHeaderField: "X-API-Secret")

            do {
                request.httpBody = try JSONSerialization.data(withJSONObject: fd)
            } catch {
                log("Failed to serialize request body: \(error)")
                return
            }

            let task = URLSession.shared.dataTask(with: request) { data, response, error in

            if let error = error {
                self.log("Network request failed: \(error)")
                return
            }

            guard let data = data else {
                self.log("No data received from the server")
                return
            }

            if let responseString = String(data: data, encoding: .utf8) {
                self.log("Received response: \(responseString)")

                let jsonData = responseString.data(using: .utf8)!
                let decoder = JSONDecoder()
                guard let acmoInitModel = try? decoder.decode(AcmoInitModel.self, from: jsonData) else {
                    self.log("Failed to decode response")
                    return
                }
                self.loginData = acmoInitModel
                self.publisherUserID = self.loginData?.data.user.publisherUserId ?? ""
                self.newUser = self.loginData?.data.newRegisteredUser ?? false
                self.log("Login successful. Publisher User ID: \(self.publisherUserID), New User: \(self.newUser)")
                self.initializationWait.signal()
            }


            }

            task.resume()
            log("Network request started")


        } catch {
            log("An error occurred: \(error)")
        }
    }




     public func showOffers(_ launchMode: Int = 3, route: String? = nil, campaignID: Int? = nil) {
        self.initializationWait.wait()
        var urlString =
        "https://websdk.tyrads.com/?apiKey=\(Tyrads.instance.apiKey)&apiSecret=\(Tyrads.instance.apiSecret)&userID=\(Tyrads.instance.publisherUserID)&newUser=\(Tyrads.instance.newUser)&platform=\(AcmoConfig.SDK_PLATFORM)&hc=\(Tyrads.instance.loginData?.data.publisherApp.headerColor ?? "")&mc=\(Tyrads.instance.loginData?.data.publisherApp.mainColor ?? "")&launchMode=\(launchMode)&route=\(route ?? "")&campaignID=\(campaignID)"


        if let url = URL(string: urlString) {
            switch launchMode {
            case 1, 2:
                DispatchQueue.main.async {
                    let webView = WKWebView(frame: UIScreen.main.bounds)
                    webView.load(URLRequest(url: url))

                    let viewController = UIViewController()
                    viewController.view = webView
                    viewController.modalPresentationStyle = .fullScreen // Add this line to set the presentation style

                    if let rootViewController = UIApplication.shared.windows.first?.rootViewController {
                        rootViewController.present(viewController, animated: true, completion: nil)
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
    }
}
