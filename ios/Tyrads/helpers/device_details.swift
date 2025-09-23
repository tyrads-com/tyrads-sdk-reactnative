import UIKit
import Foundation

func getDeviceDetails() -> [String: Any] {
    var fd = [String: Any]()

    let device = UIDevice.current
    let bundle = Bundle.main
    let locale = Locale.current

    // Device basic info
    fd["deviceId"] = device.identifierForVendor?.uuidString ?? "Unknown"
    fd["device"] = device.model.lowercased().contains("ipad") ? "iPad" : "iPhone"
    fd["deviceName"] = device.name
    fd["brand"] = "Apple"
    fd["model"] = device.model
    fd["baseOs"] = device.systemName
    fd["releaseVersion"] = device.systemVersion
    fd["modelName"] = getModelName()

    // App info
    fd["version"] = bundle.infoDictionary?["CFBundleShortVersionString"] as? String ?? "Unknown"
    fd["build"] = bundle.infoDictionary?["CFBundleVersion"] as? String ?? "Unknown"
    fd["package"] = bundle.bundleIdentifier ?? "Unknown"
    fd["installerStore"] = "App Store"

    fd["osLang"] = locale.languageCode ?? "en"

    // security and virtual check
    fd["rooted"] = isJailBroken()
    fd["virtual"] = isRunningOnSimulator()

    return fd
}

func isRunningOnSimulator() -> Bool {
    return ProcessInfo().environment["SIMULATOR_DEVICE_NAME"] != nil
}

func isJailBroken() -> Bool {
    #if targetEnvironment(simulator)
    return false
    #else
    let paths = [
        "/Applications/Cydia.app",
        "/Library/MobileSubstrate/MobileSubstrate.dylib",
        "/bin/bash",
        "/usr/sbin/sshd",
        "/etc/apt",
        "/private/var/lib/apt/"
    ]
    for path in paths {
        if FileManager.default.fileExists(atPath: path) {
            return true
        }
    }
    return false
    #endif
}

func deviceIdentifier() -> String {
   #if targetEnvironment(simulator)
      if let simIdentifier = ProcessInfo().environment["SIMULATOR_MODEL_IDENTIFIER"] {
          return simIdentifier
      }
      return "Simulator"
    #else
      var systemInfo = utsname()
      uname(&systemInfo)
      let machineMirror = Mirror(reflecting: systemInfo.machine)
      let identifier = machineMirror.children.reduce("") { identifier, element in
          guard let value = element.value as? Int8, value != 0 else { return identifier }
          return identifier + String(UnicodeScalar(UInt8(value)))
      }
      return identifier
    #endif
}


func getModelName() -> String {
    let identifier = deviceIdentifier()
    NSLog("Identifier for device: \(identifier)")
  
    let iphoneModelMapping: [String: String] = [
        "iPhone1,1": "iPhone",
        "iPhone1,2": "iPhone 3G",
        "iPhone2,1": "iPhone 3GS",
        "iPhone3,1": "iPhone 4",
        "iPhone3,2": "iPhone 4 GSM Rev A",
        "iPhone3,3": "iPhone 4 CDMA",
        "iPhone4,1": "iPhone 4S",
        "iPhone5,1": "iPhone 5 (GSM)",
        "iPhone5,2": "iPhone 5 (GSM+CDMA)",
        "iPhone5,3": "iPhone 5C (GSM)",
        "iPhone5,4": "iPhone 5C (Global)",
        "iPhone6,1": "iPhone 5S (GSM)",
        "iPhone6,2": "iPhone 5S (Global)",
        "iPhone7,1": "iPhone 6 Plus",
        "iPhone7,2": "iPhone 6",
        "iPhone8,1": "iPhone 6s",
        "iPhone8,2": "iPhone 6s Plus",
        "iPhone8,4": "iPhone SE (1st Gen)",
        "iPhone9,1": "iPhone 7",
        "iPhone9,2": "iPhone 7 Plus",
        "iPhone9,3": "iPhone 7",
        "iPhone9,4": "iPhone 7 Plus",
        "iPhone10,1": "iPhone 8",
        "iPhone10,2": "iPhone 8 Plus",
        "iPhone10,3": "iPhone X Global",
        "iPhone10,4": "iPhone 8",
        "iPhone10,5": "iPhone 8 Plus",
        "iPhone10,6": "iPhone X GSM",
        "iPhone11,2": "iPhone XS",
        "iPhone11,4": "iPhone XS Max",
        "iPhone11,6": "iPhone XS Max Global",
        "iPhone11,8": "iPhone XR",
        "iPhone12,1": "iPhone 11",
        "iPhone12,3": "iPhone 11 Pro",
        "iPhone12,5": "iPhone 11 Pro Max",
        "iPhone12,8": "iPhone SE (2nd Gen)",
        "iPhone13,1": "iPhone 12 Mini",
        "iPhone13,2": "iPhone 12",
        "iPhone13,3": "iPhone 12 Pro",
        "iPhone13,4": "iPhone 12 Pro Max",
        "iPhone14,2": "iPhone 13 Pro",
        "iPhone14,3": "iPhone 13 Pro Max",
        "iPhone14,4": "iPhone 13 Mini",
        "iPhone14,5": "iPhone 13",
        "iPhone14,6": "iPhone SE (3rd Gen)",
        "iPhone14,7": "iPhone 14",
        "iPhone14,8": "iPhone 14 Plus",
        "iPhone15,2": "iPhone 14 Pro",
        "iPhone15,3": "iPhone 14 Pro Max",
        "iPhone15,4": "iPhone 15",
        "iPhone15,5": "iPhone 15 Plus",
        "iPhone16,1": "iPhone 15 Pro",
        "iPhone16,2": "iPhone 15 Pro Max",
        "iPhone17,1": "iPhone 16 Pro",
        "iPhone17,2": "iPhone 16 Pro Max",
        "iPhone17,3": "iPhone 16",
        "iPhone17,4": "iPhone 16 Plus",
        "iPhone17,5": "iPhone 16e",
        "iPhone18,1": "iPhone 17 Pro",
        "iPhone18,2": "iPhone 17 Pro Max",
        "iPhone18,3": "iPhone 17",
        "iPhone18,4": "iPhone Air"
    ]
    return iphoneModelMapping[identifier] ?? identifier
}
