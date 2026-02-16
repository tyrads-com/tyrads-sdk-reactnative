//
//  AcmoUserUpdatePage.swift
//  Pods
//
//  Created by Basharat Mehdi on 30/09/25.
//

import SwiftUI

struct AcmoUsersUpdatePage: View {
  @Environment(\.presentationMode) var presentationMode
  
  var localization: LocalizationService = LocalizationService.shared
  
  var onSubmit: (() -> Void)?
  
  public init(onSubmit: (() -> Void)? = nil) {
    self.onSubmit = onSubmit
  }
  
  @State private var selectedGender: String? = nil
  @State private var selectedAge: String = "18"
  @State private var isSubmitting = false
  @State private var showError = false
  @State private var errorMessage = ""
  
  var body: some View {
    ZStack{
      VStack {
        HStack {
          Spacer()
          Button(action: {
            Tyrads.instance.setSkipUserUpdate(true)
            Tyrads.instance.setNewUser(false)
            presentationMode.wrappedValue.dismiss()
            onSubmit?()
          }) {
            Text(localization.translate("data.shared.button.skip"))
              .font(.system(size: 14))
              .fontWeight(.semibold)
              .frame(minWidth: 80, minHeight: 35)
              .foregroundColor(Color(hex: Tyrads.instance.mainColor ?? "#000000"))
              .overlay(
                RoundedRectangle(cornerRadius: 50)
                  .stroke(Color(hex: Tyrads.instance.mainColor ?? "#000000"), lineWidth: 2)
              ).padding(.horizontal, 16)
          }
        }.padding(.top, 30).padding(.bottom, 20)
        
        ScrollView {
          VStack(spacing: 40) {
            Text(localization.translate("data.initialization.userInfo.title"))
              .font(.system(size: 16, weight: .semibold))
              .multilineTextAlignment(.center)
              .foregroundColor(Color(hex: Tyrads.instance.mainColor ?? "#000000"))
            Spacer()
              .frame(height: 15)
            
            VStack(spacing: 25) {
              Text(localization.translate(
                "data.initialization.userInfo.chooseGender.label"))
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(Color(hex: Tyrads.instance.mainColor ?? "#000000"))
              
              GenderSelectView(selectedGender: $selectedGender, localization: localization)
              Spacer().frame(height: 40)
              
              Text(localization.translate(
                "data.initialization.userInfo.chooseAge.label"))
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(Color(hex: Tyrads.instance.mainColor ?? "#000000"))
              
              AgeSelectView(selectedAge: $selectedAge)
            }
            
            Spacer().frame(height: 10)
            
            Button(action: {
              submit()
            }) {
              Text(isSubmitting ? "Submitting..." : localization.translate(
                "data.initialization.userInfo.cta.continue"))
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 44)
                .background(Color(hex: Tyrads.instance.mainColor ?? "#000000"))
                .cornerRadius(4)
            }
            .disabled(isSubmitting)
          }
          .padding(.horizontal, 20)
        }
      }
      .alert(isPresented: $showError) {
        Alert(title: Text("Error"), message: Text(errorMessage), dismissButton: .default(Text("OK")))
      }
    }
    
  }
  func submit() {
    guard let gender = selectedGender, !gender.isEmpty else {
      errorMessage = localization.translate("data.initialization.userInfo.toast.selectAgeGender")
      showError = true
      return
    }
    
    isSubmitting = true
    errorMessage = ""
    showError = false
    
    Task {
      do {
        try await UserRepository.shared.updateUser(
          userID: Tyrads.instance.publisherUserID,
          gender: gender,
          age: selectedAge
        )
        
        await MainActor.run {
          self.isSubmitting = false
          Tyrads.instance.setNewUser(false)
          self.presentationMode.wrappedValue.dismiss()
          self.onSubmit?()
        }
        
      } catch {
        await MainActor.run {
          self.isSubmitting = false
          self.errorMessage = "Failed to update user data: \(error.localizedDescription)"
          self.showError = true
        }
      }
    }
  }
}

struct GenderSelectView: View {
  @Binding var selectedGender: String?
  let localization: LocalizationService
  
  var body: some View {
    HStack(spacing: 20) {
      GenderButton(title: localization.translate("data.initialization.userInfo.gender.male"), selectedGender: $selectedGender,
                   localization: localization
      )
      GenderButton(title: localization.translate("data.initialization.userInfo.gender.female"), selectedGender: $selectedGender, localization: localization)
    }
  }
}

struct GenderButton: View {
  
  func decodeBase64Image(_ base64: String) -> UIImage? {
    guard let data = Data(base64Encoded: base64) else { return nil }
    return UIImage(data: data)
  }
  let title: String
  @Binding var selectedGender: String?
  let localization: LocalizationService
  
  var body: some View {
    Button(action: {
      selectedGender = title
    }) {
      VStack{
        if let image = decodeBase64Image(title == localization.translate("data.initialization.userInfo.gender.male") ? AcmoAssets.maleBase64 : AcmoAssets.femaleBase64) {
          Image(uiImage: image)
            .renderingMode(.template)
            .resizable()
            .scaledToFit()
            .foregroundColor(selectedGender == title ? .white : Color(hex: "#667085"))
            .frame(width: 24, height: 24)
        }
        Text(title)
          .foregroundColor(selectedGender == title ? .white : Color(hex: "#667085"))
      }
    }
    .frame(width: 100, height: 102)
    .background(selectedGender == title ? Color(hex: Tyrads.instance.mainColor ?? "#000000") : Color.white)
    .cornerRadius(4)
    .shadow(color: Color.black.opacity(0.25), radius: 4, x: 0, y: 1)
  }
}

struct AgeSelectView: View {
  @Binding var selectedAge: String
  private let ages = Array(13..<109).map { String($0) }
  
  var body: some View {
    HorizontalAgePicker(selectedAge: $selectedAge)
  }
}

struct HorizontalAgePicker: View {
  @Binding var selectedAge: String
  private let ages = Array(13...108).map { String($0) }
  
  var body: some View {
    GeometryReader { geometry in
      let screenCenter = geometry.size.width / 2
      
      if #available(iOS 14.0, *) {
        ScrollViewReader{ proxy in
          ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 4) {
              Spacer()
                .frame(width: screenCenter - 30)
              
              ForEach(ages, id: \.self) { age in
                GeometryReader { geo in
                  let itemCenter = geo.frame(in: .global).midX
                  let distance = abs(itemCenter - screenCenter)
                  let scale = max(0.8, 1.2 - distance / 200)
                  
                  var fontSize: CGFloat {
                    selectedAge == age ? 30 : 17
                  }
                  
                  var fontWeight: Font.Weight {
                    selectedAge == age ? .semibold : .regular
                  }
                  
                  Text(age)
                    .font(.system(size: fontSize, weight: fontWeight))
                    .frame(width: 90, height: 58)
                    .background(selectedAge == age ? Color(hex: "#F6F6F6") : .clear)
                    .foregroundColor(selectedAge == age ? Color(hex: Tyrads.instance.mainColor ?? "#FFFFFF") : .gray)
                    .cornerRadius(10)
                    .animation(.easeOut(duration: 0.2), value: scale)
                    .onAppear {
                      DispatchQueue.main.async {
                        proxy.scrollTo("18", anchor: .center)
                      }
                    }
                    .onChange(of: distance) { _ in
                      if distance < 20 {
                        if selectedAge != age {
                          DispatchQueue.main.async {
                            selectedAge = age
                          }
                        }
                      }
                    }
                  
                }
                .frame(width: 60, height: 74)
              }
              
              Spacer()
                .frame(width: screenCenter - 30)
            }
          }
        }
      } else {
        ScrollView(.horizontal, showsIndicators: false) {
          HStack(spacing: 4) {
            Spacer()
              .frame(width: screenCenter - 30)
            
            ForEach(ages, id: \.self) { age in
              GeometryReader { geo in
                let itemCenter = geo.frame(in: .global).midX
                let distance = abs(itemCenter - screenCenter)
                let scale = max(0.8, 1.2 - distance / 200)
                
                var fontSize: CGFloat {
                  selectedAge == age ? 30 : 17
                }
                
                var fontWeight: Font.Weight {
                  selectedAge == age ? .semibold : .regular
                }
                Text(age)
                  .font(.system(size: selectedAge == age ? 30 : 20, weight: .semibold))
                  .frame(width: 90, height: 58)
                  .background(selectedAge == age ? Color("#F6F6F6") : .clear)
                  .foregroundColor(selectedAge == age ? Color(hex: Tyrads.instance.mainColor ?? "#FFFFFF") : .black)
                  .cornerRadius(10)
                  .animation(.easeOut(duration: 0.2), value: scale)
                  .onAppear {
                    if age == ages.first {
                      selectedAge = age
                    }
                  }
                
              }
              .frame(width: 60, height: 74)
            }
            
            Spacer()
              .frame(width: screenCenter - 30)
          }
          
        }
      }
    }
    .frame(height: 100)
  }
}


