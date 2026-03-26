//
//  InitModel.swift
//  TyradsSdk
//
//  Created by ibnShamas on 8/13/24.
//

import Foundation

struct AcmoInitModel: Codable {
    let code: Int
    let message: String
    let timestamp: Int64
    let responseTime: Double
    let data: InitData
}

struct InitData: Codable {
    let newRegisteredUser: Bool
    let newRegisteredDevice: Bool
    let accountInfo: AccountInfo
    let appInfo: AppInfo
    let token: String
    
    enum CodingKeys: String, CodingKey {
        case newRegisteredUser
        case newRegisteredDevice
        case accountInfo
        case appInfo
        case token
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        newRegisteredUser = try container.decodeIfPresent(Bool.self, forKey: .newRegisteredUser) ?? false
        newRegisteredDevice = try container.decodeIfPresent(Bool.self, forKey: .newRegisteredDevice) ?? false
        accountInfo = try container.decode(AccountInfo.self, forKey: .accountInfo)
        appInfo = try container.decode(AppInfo.self, forKey: .appInfo)
        token = try container.decodeIfPresent(String.self, forKey: .token) ?? ""
    }
}

struct AccountInfo: Codable {
    let id: Int
    let publisherUserId: String
}

struct AppInfo: Codable {
    let headerColor: String
    let mainColor: String
    let premiumColor: String
    
    enum CodingKeys: String, CodingKey {
        case headerColor
        case mainColor
        case premiumColor
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        headerColor = try container.decodeIfPresent(String.self, forKey: .headerColor) ?? ""
        mainColor = try container.decodeIfPresent(String.self, forKey: .mainColor) ?? ""
        premiumColor = try container.decodeIfPresent(String.self, forKey: .premiumColor) ?? ""
    }
}
