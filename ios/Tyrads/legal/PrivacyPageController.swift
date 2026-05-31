//
//  AcmoPrivacyPolicyController.swift
//  Pods
//
//  Created by Basharat Mehdi on 29/09/25.
//

import UIKit
import SwiftUI

public typealias PolicyCompletion = () -> Void

class AcmoPrivacyPolicyController: UIHostingController<AcmoPrivacyPolicyPage> {
  
  init(onAccept: PolicyCompletion? = nil) {
    
    let rootView = AcmoPrivacyPolicyPage(onAccept: onAccept)
    
    super.init(rootView: rootView)
    
    self.modalPresentationStyle = .fullScreen
  }
  
  @MainActor required dynamic init?(coder aDecoder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
  }
}
