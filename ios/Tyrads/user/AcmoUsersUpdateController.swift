//
//  AcmoUserUpdatePageController.swift
//  Pods
//
//  Created by Basharat Mehdi on 30/09/25.
//

import UIKit
import SwiftUI

public typealias UserUpdateCompletion = () -> Void
class AcmoUsersUpdateController: UIHostingController<AcmoUsersUpdatePage> {
  public init(onSubmit: UserUpdateCompletion? = nil) {
    let rootView = AcmoUsersUpdatePage(onSubmit: onSubmit)
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
