import Foundation
import UIKit


@objc(TyradsSdk)
class TyradsSdk: NSObject {

  @objc
  func `init`(_ apiKey: String, secretKey: String) {
    NSLog("TyradsModule: init called with apiKey: \(apiKey) and secretKey: \(secretKey)")
    Tyrads.instance.configure(apiKey: apiKey, secretKey: secretKey)
  }

  @objc
  func loginUser(_ userId: String) {
    NSLog("TyradsModule: loginUser called with userId: \(userId)")
    Tyrads.instance.loginUser(userId)
    // Implement your login logic here
  }

  @objc
  func showOffers() {
    NSLog("TyradsModule: showOffers called")
    Tyrads.instance.showOffers()
  }
}
