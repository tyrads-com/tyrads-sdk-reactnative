import Foundation
import CryptoKit

class AcmoEncrypt {
  private let encryptionKey: String
  
  init(_ encryptionKey: String) throws {
      self.encryptionKey = encryptionKey
      
      let keyData = Data(encryptionKey.utf8)
      if keyData.count != 32 {
          throw EncryptionError.invalidKeyLength
      }
  }
  
  func encryptDataAESGCM(data: [String: Any]) -> [String: String] {
    do {
        let jsonData = try JSONSerialization.data(withJSONObject: data)
        let key = SymmetricKey(data: Data(encryptionKey.utf8))
        let sealedBox = try AES.GCM.seal(jsonData, using: key)

        let nonce = sealedBox.nonce
        let ciphertext = sealedBox.ciphertext
        let tag = sealedBox.tag
        
        return [
            "val": ciphertext.base64EncodedString(),
            "vec": Data(nonce).base64EncodedString(),
            "tag": tag.base64EncodedString()
        ]
    } catch {
        print("Error encrypting data: \(error)")
        return emptyEncryptionResult()
    }
  }
  
  func decryptDataAESGCM(encryptedData: [String: String]) -> String {
      do {
          guard let valBase64 = encryptedData["val"],
                let vecBase64 = encryptedData["vec"],
                let tagBase64 = encryptedData["tag"],
                !valBase64.isEmpty,
                !vecBase64.isEmpty,
                !tagBase64.isEmpty else {
              return ""
          }
          
          let ciphertext = Data(base64Encoded: valBase64) ?? Data()
          let nonceData = Data(base64Encoded: vecBase64) ?? Data()
          let tag = Data(base64Encoded: tagBase64) ?? Data()
          
          let nonce = try AES.GCM.Nonce(data: nonceData)
          let sealedBox = try AES.GCM.SealedBox(
              nonce: nonce,
              ciphertext: ciphertext,
              tag: tag
          )
          
          let key = SymmetricKey(data: Data(encryptionKey.utf8))
          
          let decryptedData = try AES.GCM.open(sealedBox, using: key)
          
          return String(data: decryptedData, encoding: .utf8) ?? ""
      } catch {
          print("Error decrypting data: \(error)")
          return ""
      }
  }
  
  private func emptyEncryptionResult() -> [String: String] {
      return [
          "val": "",
          "vec": "",
          "tag": ""
      ]
  }
}

enum EncryptionError: Error {
  case invalidKeyLength
}
