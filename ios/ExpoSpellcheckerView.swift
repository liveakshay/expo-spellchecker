import ExpoModulesCore
import UIKit

// This view will be used as a native component. Make sure to inherit from `ExpoView`
class ExpoSpellcheckerView: ExpoView {
  let textField = UITextField()
  let onLoad = EventDispatcher()
  
  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    
    // Setup the UITextField
    textField.borderStyle = .roundedRect
    textField.translatesAutoresizingMaskIntoConstraints = false
    addSubview(textField)
    
    // Constraints for UITextField to fill the view
    NSLayoutConstraint.activate([
      textField.leadingAnchor.constraint(equalTo: leadingAnchor),
      textField.trailingAnchor.constraint(equalTo: trailingAnchor),
      textField.topAnchor.constraint(equalTo: topAnchor),
      textField.bottomAnchor.constraint(equalTo: bottomAnchor)
    ])
  }
  
  override func layoutSubviews() {
    super.layoutSubviews()
    textField.frame = bounds
  }
}
