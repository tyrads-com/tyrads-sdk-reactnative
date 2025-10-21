//
//  FcmServices.swift
//  Pods
//
//  Created by Basharat Mehdi on 16/10/25.
//

import Foundation
import FirebaseCore
import FirebaseMessaging
import UserNotifications

@objc class FCMService: NSObject {
  
  static let shared = FCMService()
  private override init() {}
  
  private var useNativeImplementation = false
  private var isInitialized = false
  private var lastNotificationTime: Date?
  private let notificationCooldown: TimeInterval = 2.0
  
  // MARK: - Public Methods
  
  @objc func initialize() {
    print("Initializing FCM service...")
    setupNotificationDelegate()
    
    do {
      try initializeStandardFirebase()
      setupMessageHandlers()
      print("FCM service initialized successfully")
    } catch {
      print("Standard Firebase failed, trying native fallback...")
      useNativeImplementation = true
    }
  }
  
  @objc func dispose() {
    NotificationCenter.default.removeObserver(self)
    print("FCM service disposed")
  }
  
  // MARK: - Firebase Setup
  
  private func initializeStandardFirebase() throws {
    if FirebaseApp.app() == nil {
      let options = FirebaseOptions(
        googleAppID: FirebaseConfig.appId,
        gcmSenderID: FirebaseConfig.messagingSenderId
      )
      options.apiKey = FirebaseConfig.apiKey
      options.projectID = FirebaseConfig.projectId
      options.storageBucket = FirebaseConfig.storageBucket
      
      FirebaseApp.configure(options: options)
      print("Standard Firebase initialization successful")
    }
    
    requestNotificationPermission()
    handleToken()
  }
  
  // MARK: - Token Handling
  
  private func handleToken() {
    Messaging.messaging().token { token, error in
      if let error = error {
        print("Failed to get FCM token: \(error.localizedDescription)")
        return
      }
      if let token = token {
        print("FCM Token: \(token)")
        self.saveToken(token)
      }
    }
  }
  
  private func saveToken(_ token: String) {
    print("Saving FCM token: \(token)")
    UserDefaults.standard.set(token, forKey: "fcm_token")
  }
  
  // MARK: - Message Handling
  
  private func setupMessageHandlers() {
    guard !useNativeImplementation else {
      print("Using native message handlers")
      return
    }
    
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(onForegroundMessage(_:)),
      name: NSNotification.Name("FCMForegroundMessage"),
      object: nil
    )
    
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(onBackgroundMessage(_:)),
      name: NSNotification.Name("FCMBackgroundMessage"),
      object: nil
    )
    
    print("Standard message handlers setup complete")
  }
  
  @objc private func onForegroundMessage(_ notification: Notification) {
    guard let userInfo = notification.userInfo else { return }
    guard shouldShowNotification() else {
      print("Skipping duplicate notification")
      return
    }
    print("Foreground message received: \(userInfo)")
    if shouldDisplayNotification(userInfo) {
      showNotification(userInfo)
    }
    handleMessageData(userInfo)
  }
  
  @objc private func onBackgroundMessage(_ notification: Notification) {
    guard let userInfo = notification.userInfo else { return }
    print("Background message received: \(userInfo)")
    handleMessageData(userInfo)
  }
  
  private func handleMessageData(_ data: [AnyHashable: Any]) {
    print("Message data: \(data)")
    // handle custom data payload logic here
  }
  
  // MARK: - Notification Helpers
  
  private func setupNotificationDelegate() {
    UNUserNotificationCenter.current().delegate = self
    Messaging.messaging().delegate = self
  }
  
  private func requestNotificationPermission() {
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
      print("Notification permission granted: \(granted)")
      DispatchQueue.main.async {
        UIApplication.shared.registerForRemoteNotifications()
      }
    }
  }
  
  private func shouldDisplayNotification(_ data: [AnyHashable: Any]) -> Bool {
    let title: String?
    let body: String?
    
    if let directTitle = data["title"] as? String, let directBody = data["body"] as? String {
      title = directTitle
      body = directBody
    } else if let aps = data["aps"] as? [String: Any],
              let alert = aps["alert"] as? [String: Any] {
      title = alert["title"] as? String
      body = alert["body"] as? String
    } else if let notification = data["notification"] as? [String: Any] {
      title = notification["title"] as? String
      body = notification["body"] as? String
    } else {
      title = nil
      body = nil
    }
    
    let hasTitle = !(title?.isEmpty ?? true)
    let hasBody = !(body?.isEmpty ?? true)
    
    return hasTitle || hasBody
  }
  
  private func shouldShowNotification() -> Bool {
    let now = Date()
    if let lastTime = lastNotificationTime, now.timeIntervalSince(lastTime) < notificationCooldown {
      return false
    }
    lastNotificationTime = now
    return true
  }
  
  private func showNotification(_ data: [AnyHashable: Any]) {
    let title: String
    let body: String
    
    if let directTitle = data["title"] as? String, let directBody = data["body"] as? String {
      title = directTitle
      body = directBody
    } else if let aps = data["aps"] as? [String: Any],
              let alert = aps["alert"] as? [String: Any] {
      title = alert["title"] as? String ?? "TyrAds Notification"
      body = alert["body"] as? String ?? ""
    } else if let notification = data["notification"] as? [String: Any] {
      title = notification["title"] as? String ?? "TyrAds Notification"
      body = notification["body"] as? String ?? ""
    } else {
      print("No valid notification content found")
      return
    }
    
    guard !title.isEmpty || !body.isEmpty else {
      print("Empty notification content, skipping")
      return
    }
    
    let content = UNMutableNotificationContent()
    content.title = title
    content.body = body
    content.sound = .default
    let imageUrl = (data["fcm_options"] as? [String: Any])?["image"] as? String
    if let imageUrl = imageUrl, let url = URL(string: imageUrl) {
      downloadImage(url: url) { attachment in
        if let attachment = attachment {
          content.attachments = [attachment]
        }
        self.scheduleNotification(content: content)
      }
    } else {
      scheduleNotification(content: content)
    }
  }
  
  func showNotification(title: String,
                        body: String,
                        imageUrl: String? = nil,
                        userInfo: [AnyHashable: Any]? = nil) {
    
    let content = UNMutableNotificationContent()
    content.title = title
    content.body = body
    content.sound = .default
    if let userInfo = userInfo {
      content.userInfo = userInfo
    }
    
    if let imageUrl = imageUrl, let url = URL(string: imageUrl) {
      downloadImage(url: url) { attachment in
        if let attachment = attachment {
          content.attachments = [attachment]
        }
        self.scheduleNotification(content: content)
      }
    } else {
      scheduleNotification(content: content)
    }
  }
  
  private func scheduleNotification(content: UNNotificationContent) {
    let request = UNNotificationRequest(
      identifier: UUID().uuidString,
      content: content,
      trigger: nil
    )
    UNUserNotificationCenter.current().add(request)
  }
  
  private func downloadImage(url: URL, completion: @escaping (UNNotificationAttachment?) -> Void) {
    URLSession.shared.downloadTask(with: url) { localUrl, _, _ in
      guard let localUrl = localUrl else {
        completion(nil)
        return
      }
      
      let tempDir = FileManager.default.temporaryDirectory
      let fileURL = tempDir.appendingPathComponent(UUID().uuidString + ".jpg")
      
      do {
        try FileManager.default.moveItem(at: localUrl, to: fileURL)
        let attachment = try UNNotificationAttachment(identifier: "image", url: fileURL, options: nil)
        completion(attachment)
      } catch {
        print("Failed to create attachment: \(error)")
        completion(nil)
      }
    }.resume()
  }
}

// MARK: - Firebase Messaging Delegates

extension FCMService: MessagingDelegate {
  func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
    guard let token = fcmToken else { return }
    print("FCM refreshed token: \(token)")
    saveToken(token)
  }
}

// MARK: - UNUserNotificationCenterDelegate

extension FCMService: UNUserNotificationCenterDelegate {
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    let userInfo = notification.request.content.userInfo
    print("User info \(userInfo)")
    NotificationCenter.default.post(
      name: NSNotification.Name("FCMForegroundMessage"),
      object: nil,
      userInfo: userInfo
    )
    completionHandler([.banner, .sound])
  }
  
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    NotificationCenter.default.post(
      name: NSNotification.Name("FCMBackgroundMessage"),
      object: nil,
      userInfo: response.notification.request.content.userInfo
    )
    completionHandler()
  }
}

class NotificationService: UNNotificationServiceExtension {
  
  override func didReceive(
    _ request: UNNotificationRequest,
    withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
  ) {
    let bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)
    
    if let imageUrlString = request.content.userInfo["fcm_options"] as? [String: Any],
       let imageUrl = imageUrlString["image"] as? String,
       let url = URL(string: imageUrl) {
      
      URLSession.shared.dataTask(with: url) { data, _, _ in
        if let data = data,
           let tmpURL = FileManager.default.temporaryDirectory.appendingPathComponent("image.jpg") as URL?,
           (try? data.write(to: tmpURL)) != nil,
           let attachment = try? UNNotificationAttachment(identifier: "image", url: tmpURL, options: nil) {
          bestAttemptContent?.attachments = [attachment]
        }
        if let content = bestAttemptContent {
          contentHandler(content)
        }
      }.resume()
    } else if let content = bestAttemptContent {
      contentHandler(content)
    }
  }
}
