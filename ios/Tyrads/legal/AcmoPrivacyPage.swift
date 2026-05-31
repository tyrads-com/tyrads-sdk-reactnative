//
//  AcmoPrivacyPage.swift
//  Pods
//
//  Created by Basharat Mehdi on 29/09/25.
//

import SwiftUI
import UIKit

struct AcmoPrivacyPolicyPage: View {
  @Environment(\.presentationMode) var presentationMode
  
  var localization: LocalizationService = LocalizationService.shared
  
  var onAccept: (() -> Void)?
  
  public init(onAccept: (() -> Void)? = nil) {
    self.onAccept = onAccept
  }
  
  var body: some View {
    ZStack {
      if #available(iOS 14.0, *) {
        Color.white.ignoresSafeArea()
      } else {
        Color.white
      }
      
      VStack {
        HStack {
          Spacer()
          Button(action: {
            presentationMode.wrappedValue.dismiss()
          }) {
            Image(systemName: "xmark")
              .foregroundColor(Color.gray.opacity(0.6))
              .font(.system(size: 20))
              .padding()
          }
        }
        
        BodyView(localization: localization)
        
        Spacer().frame(height: 24)
        
        ScrollView {
          VStack {
            InfoView(localization: localization)
            Spacer().frame(height: 155)
          }
          .frame(maxWidth: .infinity)
        }
        .frame(maxHeight: UIScreen.main.bounds.height / 2)
        
        Spacer()
      }
      .padding(.horizontal, 30)
      
      VStack {
        Spacer()
        VStack(spacing: 16) {
          Info2View(localization: localization)
          TwoButtons(
            onAccept: {
              UserDefaults.standard.set(true, forKey: "\(AcmoKeyNames.PRIVACY_ACCEPTED_FOR_USER_ID)\(Tyrads.instance.publisherUserID)")
              presentationMode.wrappedValue.dismiss()
              onAccept?()
            },
            onReject: {
              presentationMode.wrappedValue.dismiss()
            },
            localization: localization
          )
        }
        .frame(width: UIScreen.main.bounds.width, height: 140)
        .padding(16)
        .background(Color.white)
      }
    }
  }
}

// MARK: - Body Section
struct BodyView: View {
  let localization: LocalizationService
  
  func decodeBase64Image(_ base64: String) -> UIImage? {
    guard let data = Data(base64Encoded: base64) else { return nil }
    return UIImage(data: data)
  }
  
  var body: some View {
    VStack(spacing: 12) {
      Text(localization.translate("data.initialization.intro.title"))
        .font(.system(size: 16, weight: .semibold))
        .multilineTextAlignment(.center)
      
      if let image = decodeBase64Image(AcmoAssets.privacyBannerBase64) {
        Image(uiImage: image)
          .resizable()
          .scaledToFit()
          .frame(height: 160)
      } else {
        Text("Image not found")
      }
      
      Text(localization.translate("data.initialization.intro.subtitle"))
        .font(.system(size: 16, weight: .medium))
        .multilineTextAlignment(.center)
        .lineSpacing(3)
    }
    .frame(maxWidth: UIScreen.main.bounds.width * 0.6)
  }
}

// MARK: - Info Section (scrollable legal text)
struct InfoView: View {
  let localization: LocalizationService
  var body: some View {
    Text(.init(localization.translate("data.initialization.legal.explanation")))
      .font(.system(size: 14))
      .padding(10)
      .foregroundColor(Color.black.opacity(0.65))
      .multilineTextAlignment(.leading)
  }
  func wrapLinks(text: String) -> String {
    let urlRegexPattern = "(https?:\\/\\/[^\\s]+)"
    
    do {
      let regex = try NSRegularExpression(pattern: urlRegexPattern, options: [])
      let range = NSRange(text.startIndex..., in: text)
      let replacedText = regex.stringByReplacingMatches(
        in: text,
        range: range,
        withTemplate: "https://tyrads.com/tyrsdk-privacy-policy"
      )
      
      return replacedText
      
    } catch {
      print("Error creating regex: \(error.localizedDescription)")
      return text
    }
  }
}

// MARK: - Info2 Section
struct Info2View: View {
  let localization: LocalizationService
  var body: some View {
    StyledTextView(text: localization.translate("data.initialization.intro.label.iHaveRead"))
      .padding(10)
      .multilineTextAlignment(.leading)
      .frame(width: UIScreen.main.bounds.width * 0.88)
  }
}


// MARK: - Buttons
struct TwoButtons: View {
  var onAccept: () -> Void
  var onReject: () -> Void
  let localization: LocalizationService
  
  var body: some View {
    VStack(spacing: 8) {
      Button(action: onAccept) {
        Text(localization
          .translate("data.initialization.intro.cta.accept"))
        .font(.system(size: 15, weight: .medium))
        .foregroundColor(.white)
        .frame(width: 160, height: 35)
        .background(Color(hex: Tyrads.instance.mainColor ?? "#000000"))
        .cornerRadius(5)
      }
      
      Button(action: onReject) {
        Text(localization
          .translate("data.initialization.intro.cta.reject"))
        .font(.system(size: 15, weight: .medium))
        .foregroundColor(Color(red: 179/255, green: 44/255, blue: 44/255))
        .frame(width: 150, height: 35)
      }
    }
  }
}

// MARK: StyledText View
struct StyledTextView: View {
  let text: String
  let fontSize: CGFloat = 14
  let fontWeight: Font.Weight = .regular
  let textColor: Color = .black
  let linkColor: Color = Color(hex: Tyrads.instance.mainColor ?? "#000000")
  
  var body: some View {
    WrappingHStack(components: parseTextComponents(), fontSize: fontSize, fontWeight: fontWeight, textColor: textColor, linkColor: linkColor)
      .font(.system(size: fontSize, weight: fontWeight))
  }
  
  private func parseTextComponents() -> [TextComponent] {
    var components: [TextComponent] = []
    let pattern = "<([a-z]+)>(.*?)</\\1>"
    
    do {
      let regex = try NSRegularExpression(pattern: pattern, options: [])
      let nsString = text as NSString
      let matches = regex.matches(in: text, options: [], range: NSRange(location: 0, length: nsString.length))
      
      if matches.isEmpty {
        return [TextComponent(text: text, isLink: false)]
      }
      
      var lastIndex = 0
      
      for match in matches {
        if match.range.location > lastIndex {
          let beforeRange = NSRange(location: lastIndex, length: match.range.location - lastIndex)
          let beforeText = nsString.substring(with: beforeRange)
          components.append(TextComponent(text: beforeText, isLink: false))
        }
        
        let tagNameRange = match.range(at: 1)
        let contentRange = match.range(at: 2)
        
        let tagName = nsString.substring(with: tagNameRange)
        let content = nsString.substring(with: contentRange)
        
        components.append(TextComponent(text: content, isLink: true, tag: tagName))
        lastIndex = match.range.location + match.range.length
      }
      
      if lastIndex < nsString.length {
        let remainingText = nsString.substring(from: lastIndex)
        components.append(TextComponent(text: remainingText, isLink: false))
      }
      
    } catch {
      components = [TextComponent(text: text, isLink: false)]
    }
    
    return components
  }
  
  private func handleLinkTap(for tag: String?) {
    guard let tag = tag else { return }
    
    switch tag {
    case "tos":
      if let url = URL(string: "https://tyrads.com/tyrsdk-terms-of-service/") {
        UIApplication.shared.open(url)
      }
    case "pp":
      if let url = URL(string: "https://tyrads.com/tyrsdk-privacy-policy/") {
        UIApplication.shared.open(url)
      }
    default:
      break
    }
  }
}

struct WrappingHStack: View {
  let components: [TextComponent]
  let fontSize: CGFloat
  let fontWeight: Font.Weight
  let textColor: Color
  let linkColor: Color
  
  var body: some View {
    GeometryReader { geometry in
      self.generateContent(in: geometry)
    }
  }
  
  private func generateContent(in geometry: GeometryProxy) -> some View {
    var width = CGFloat.zero
    var height = CGFloat.zero
    
    return ZStack(alignment: .topLeading) {
      ForEach(components, id: \.id) { component in
        self.item(for: component)
          .alignmentGuide(.leading) { dimension in
            if abs(width - dimension.width) > geometry.size.width {
              width = 0
              height -= dimension.height
            }
            let result = width
            if component.id == components.last?.id {
              width = 0
            } else {
              width -= dimension.width
            }
            return result
          }
          .alignmentGuide(.top) { dimension in
            let result = height
            if component.id == components.last?.id {
              height = 0
            }
            return result
          }
      }
    }
  }
  
  @ViewBuilder
  private func item(for component: TextComponent) -> some View {
    if component.isLink {
      Text(component.text)
        .font(.system(size: fontSize, weight: fontWeight))
        .foregroundColor(linkColor)
        .onTapGesture {
          handleLinkTap(for: component.tag)
        }
    } else {
      Text(component.text)
        .font(.system(size: fontSize, weight: fontWeight))
        .foregroundColor(textColor)
    }
  }
  
  private func handleLinkTap(for tag: String?) {
    guard let tag = tag else { return }
    
    switch tag {
    case "tos":
      if let url = URL(string: "https://tyrads.com/tyrsdk-terms-of-service/") {
        UIApplication.shared.open(url)
      }
    case "pp":
      if let url = URL(string: "https://tyrads.com/tyrsdk-privacy-policy/") {
        UIApplication.shared.open(url)
      }
    default:
      break
    }
  }
}

struct TextComponent: Identifiable {
  let id = UUID()
  let text: String
  let isLink: Bool
  let tag: String?
  
  init(text: String, isLink: Bool, tag: String? = nil) {
    self.text = text
    self.isLink = isLink
    self.tag = tag
  }
}
