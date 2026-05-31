//
//  LocalizationService.swift
//  Pods
//
//  Created by Basharat Mehdi on 02/10/25.
//

import Foundation

final class LocalizationService {
  
  static let shared = LocalizationService()
  private init() {}
  
  private var translations: [String: Any] = [:]
  private var supportedLocales: [String] = []
  
  private let userDefaults = UserDefaults.standard
  private let fallbackLocale = "en"
  
  // MARK: - Public Interface
  func initialize(locale: String) async {
    await loadTranslations(locale: locale)
  }
  
  func changeLanguage(locale: String, force: Bool = false) async {
    await loadTranslations(locale: locale, force: force)
  }
  
  func translate(_ key: String, args: [String: String]? = nil) -> String {
    let keys = key.split(separator: ".").map { String($0) }
    var current: Any? = translations
    
    for k in keys {
      if let dict = current as? [String: Any], let next = dict[k] {
        current = next
      } else {
        return key
      }
    }
    
    guard var result = current as? String else {
      return key
    }
    
    if let args = args {
      for (argKey, argValue) in args {
        let regex = try? NSRegularExpression(pattern: "\\{\(argKey)\\}", options: .caseInsensitive)
        if let regex = regex {
          result = regex.stringByReplacingMatches(in: result, range: NSRange(result.startIndex..., in: result), withTemplate: argValue)
        }
      }
    }
    
    return result
  }
  
  // MARK: - Private Loading Methods
  private func loadTranslations(locale: String, force: Bool = false) async {
    let hasUpdate = await checkForUpdate(locale: locale, force: force)
    
    if !hasUpdate {
      if let cachedData = userDefaults.data(forKey: "translations_\(locale)"),
         let json = try? JSONSerialization.jsonObject(with: cachedData, options: []) as? [String: Any] {
        translations = json
        return
      }
    }
    
    await fetchTranslations(locale: locale, force: force)
  }
  
  private func fetchTranslations(locale: String, force: Bool) async {
    var currentLocale = locale
    if !supportedLocales.contains(currentLocale) {
      currentLocale = fallbackLocale
    }
    
    
    let urlString = "\(AcmoConfig.BASE_URL)translations/\(currentLocale)?force=\(force)&format=nested"
    guard let url = URL(string: urlString) else {
      print("LocalizationService: Invalid URL for translations")
      return
    }
    
    var request = URLRequest(url: url)
    request.httpMethod = "GET"
    request.setTyradsHeaders(with: Tyrads.instance)
    
    do {
      let (data, response) = try await URLSession.shared.data(for: request)
      
      guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
        print("LocalizationService: Failed to load translations: \((response as? HTTPURLResponse)?.statusCode ?? -1)")
        return
      }
      
      if let jsonResponse = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
        translations = jsonResponse
        
        userDefaults.set(data, forKey: "translations_\(currentLocale)")
      } else {
        print("LocalizationService: Failed to parse JSON response.")
      }
    } catch {
      print("LocalizationService: Network error fetching translations: \(error)")
    }
  }
  
  private func checkForUpdate(locale: String, force: Bool) async -> Bool {
    let urlString = "\(AcmoConfig.BASE_URL)translations/version?force=\(force)"
    guard let url = URL(string: urlString) else {
      print("LocalizationService: Invalid URL for version check")
      return false
    }
    var request = URLRequest(url: url)
    request.httpMethod = "GET"
    request.setTyradsHeaders(with: Tyrads.instance)
    
    do {
      let (data, response) = try await URLSession.shared.data(for: request)
      
      guard (response as? HTTPURLResponse)?.statusCode == 200 else {
        print("LocalizationService: Failed to get version check response.")
        return false
      }
      
      struct VersionData: Decodable {
        let code: String
        let sha256: String
      }
      struct VersionResponse: Decodable {
        let data: [VersionData]
      }
      
      let jsonResponse = try JSONDecoder().decode(VersionResponse.self, from: data)
      let versionData = jsonResponse.data
      
      supportedLocales = versionData.map { $0.code }
      
      guard supportedLocales.contains(locale) else {
        return false
      }
      
      guard let currentLocaleVersion = versionData.first(where: { $0.code == locale }) else {
        return false
      }
      
      let currentSha256 = currentLocaleVersion.sha256
      let cachedVersion = userDefaults.string(forKey: "cached_version_\(locale)")
      
      if currentSha256 != cachedVersion {
        userDefaults.set(currentSha256, forKey: "cached_version_\(locale)")
        return true
      }
      
    } catch {
      print("LocalizationService: Error checking for update: \(error)")
    }
    
    return false
  }
}

extension URLRequest {
  mutating func setTyradsHeaders(with sdk: Tyrads) {
    self.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    self.setValue(sdk.apiKey, forHTTPHeaderField: "X-API-Key")
    self.setValue(sdk.apiSecret, forHTTPHeaderField: "X-API-Secret")
    
    self.setValue(AcmoConfig.SDK_PLATFORM, forHTTPHeaderField: "X-SDK-Platform")
    self.setValue(AcmoConfig.SDK_VERSION, forHTTPHeaderField: "X-SDK-Version")
  }
}
