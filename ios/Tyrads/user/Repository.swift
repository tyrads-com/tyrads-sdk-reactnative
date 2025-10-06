//
//  Repository.swift
//  Pods
//
//  Created by Basharat Mehdi on 01/10/25.
//

import Foundation
import UIKit

public class UserRepository {
  
  public static let shared = UserRepository()
  
  private init() {}
  
  public func updateUser(userID: String, gender: String, age: String) async throws {
    let sdk = Tyrads.instance
    
    guard let ageInt = Int(age) else {
      print("ERROR: Failed to convert age string '\(age)' to integer.")
      throw NSError(domain: "TyradsSdk", code: 4, userInfo: [NSLocalizedDescriptionKey: "Invalid age format."])
    }
    
    let fd: [String: Any] = [
      "gender": gender == "Male" ? 1 : 2,
      "age": ageInt,
    ]
    
    let fullURLString = AcmoConfig.BASE_URL + "update-user"
    
    print("--- USER UPDATE REQUEST ---")
    print("UserID: \(userID)")
    print("URL: \(fullURLString)")
    print("Data Sent: \(fd)")
    
    let requestBody = sdk.isSecure && !(sdk.encKey ?? "").isEmpty ? try AcmoEncrypt(sdk.encKey!).encryptDataAESGCM(data: fd) : fd
    
    guard let url = URL(string: fullURLString) else {
      throw NSError(domain: "TyradsSdk", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL for user update"])
    }
    
    var request = URLRequest(url: url)
    request.httpMethod = "PUT"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue(sdk.apiKey, forHTTPHeaderField: "X-API-Key")
    request.setValue(sdk.apiSecret, forHTTPHeaderField: "X-API-Secret")
    request.setValue(userID, forHTTPHeaderField: "X-User-ID")
    request.setValue(AcmoConfig.SDK_PLATFORM, forHTTPHeaderField: "X-SDK-Platform")
    request.setValue(AcmoConfig.SDK_VERSION, forHTTPHeaderField: "X-SDK-Version")
    request.setValue(sdk.isSecure ? "BASIC" : "PLAIN", forHTTPHeaderField: "X-Secure-Mode")
    
    print("X-API-Key: \(sdk.apiKey)")
    print("X-API-Secret: \(sdk.apiSecret)")
    print("X-Publisher-User-Id: \(userID)")
    print("Request Body: \(requestBody)")
    
    do {
      request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)
    } catch {
      print("ERROR: Failed to serialize request body: \(error)")
      throw error
    }
    
    let (data, response) = try await URLSession.shared.data(for: request)
    
    let responseString = String(data: data, encoding: .utf8) ?? "No readable response data"
    
    guard let httpResponse = response as? HTTPURLResponse else {
      print("ERROR: Response was not HTTPURLResponse.")
      throw NSError(domain: "TyradsSdk", code: 0, userInfo: [NSLocalizedDescriptionKey: "Non-HTTP response received."])
    }
    
    print("Response Status Code: \(httpResponse.statusCode)")
    print("Response Body: \(responseString)")
    
    guard (200...299).contains(httpResponse.statusCode) else {
      let statusCode = httpResponse.statusCode
      sdk.log("User update failed with status: \(statusCode)")
      
      let fullErrorDescription = "Failed to update user demographics."
      throw NSError(domain: "TyradsSdk", code: statusCode,
                    userInfo: [NSLocalizedDescriptionKey: "Failed to update user demographics."])
    }
    
    print("User has been updated please check")
    sdk.log("User update successful.")
  }
}
