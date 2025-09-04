import UIKit

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

