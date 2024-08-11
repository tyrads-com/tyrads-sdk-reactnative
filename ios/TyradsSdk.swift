import Foundation
import UIKit


@objc(TyradsSdk)
class TyradsSdk: NSObject {

  @objc
  func `init`(_ apiKey: String, secretKey: String) {
    NSLog("TyradsModule: init called with apiKey: \(apiKey) and secretKey: \(secretKey)")
  }

  @objc
  func loginUser(_ userId: String) {
    NSLog("TyradsModule: loginUser called with userId: \(userId)")
    // Implement your login logic here
  }

  @objc
  func showOffers() {
    NSLog("TyradsModule: showOffers called")
    if let url = URL(string: "https://example.com") {
      UIApplication.shared.open(url, options: [:], completionHandler: { _ in })
    }
  }
}
