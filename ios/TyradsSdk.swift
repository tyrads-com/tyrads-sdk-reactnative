import Foundation
import UIKit


@objc(TyradsSdk)
class TyradsSdk: NSObject {

  @objc
  func `init`(_ apiKey: String, secretKey: String, encKey: String? = nil, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    NSLog("TyradsModule: init called with apiKey: \(apiKey) and secretKey: \(secretKey)")
    Task {
      do{
        let locale = await Tyrads.instance.configure(apiKey: apiKey, secretKey: secretKey, encKey: encKey)
        let result: [String: Any] = [
                  "success": true,
                  "languageCode": locale
                ]
        resolve (result)
      } catch{
        reject("INIT_FAILED", "Failed to initialize", nil)
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
                  "mainColor": apiHeaders.mainColor
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

}
