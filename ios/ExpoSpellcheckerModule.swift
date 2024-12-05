import ExpoModulesCore

public class ExpoSpellcheckerModule: Module {

  private let sharedTextChecker = UITextChecker()


  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {

    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ExpoSpellchecker')` in JavaScript.
    Name("ExpoSpellchecker")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants([
      "PI": Double.pi
    ])

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      return "Hello world! 👋"
    }


    AsyncFunction("checkSpelling") { (input: String, language: String) -> [String] in
      return await withCheckedContinuation { continuation in
        DispatchQueue.global().async {
          // Find the range of the last word in the input
          let lastSpaceIndex = input.lastIndex(of: " ") // Find the last space character
          let lastWordStartIndex: String.Index
          if let spaceIndex = lastSpaceIndex {
            lastWordStartIndex = input.index(after: spaceIndex) // Start after the last space
          } else {
            lastWordStartIndex = input.startIndex // No space found, start at the beginning
          }
          let lastWord = String(input[lastWordStartIndex...]) // Extract the last word
          let range = NSRange(location: lastWordStartIndex.utf16Offset(in: input), length: lastWord.utf16.count)
          
          // Check for misspellings
          let misspelledRange = self.sharedTextChecker.rangeOfMisspelledWord(
            in: input,
            range: range,
            startingAt: 0,
            wrap: false,
            language: language
          )

          if misspelledRange.location == NSNotFound {
            // Word is correctly spelled, return an empty list
            continuation.resume(returning: [])
          } else {
            // Get suggestions for the misspelled word
            let suggestions = self.sharedTextChecker.guesses(forWordRange: misspelledRange, in: input, language: language) ?? []
            continuation.resume(returning: suggestions)
          }
        }
      }
    }


    AsyncFunction("getCompletions") { (input: String, language: String) -> [String] in
      return await withCheckedContinuation { continuation in
        DispatchQueue.global().async {
          // Find the range of the last word in the input
          let lastSpaceIndex = input.lastIndex(of: " ") // Find the last space character
          let lastWordStartIndex: String.Index
          if let spaceIndex = lastSpaceIndex {
            lastWordStartIndex = input.index(after: spaceIndex) // Start after the last space
          } else {
            lastWordStartIndex = input.startIndex // No space found, start at the beginning
          }
          let lastWord = String(input[lastWordStartIndex...]) // Extract the last word
          let range = NSRange(location: lastWordStartIndex.utf16Offset(in: input), length: lastWord.utf16.count)

          // Check for misspellings in the last word
          let misspelledRange = self.sharedTextChecker.rangeOfMisspelledWord(
            in: input,
            range: range,
            startingAt: 0,
            wrap: false,
            language: language
          )

          if misspelledRange.location == NSNotFound {
            // Word is correct, no completions needed
            continuation.resume(returning: [])
          } else {
            // Get suggestions for the misspelled word
            let suggestions = self.sharedTextChecker.guesses(forWordRange: misspelledRange, in: input, language: language) ?? []
            continuation.resume(returning: suggestions)
          }
        }
      }
    }

    // return available languages
    AsyncFunction("getAvailableLanguages") { () async throws -> [String] in
      return UITextChecker.availableLanguages
    }

    // Ignore the specified word during spell-checking
    AsyncFunction("ignoreWord") { (word: String) async throws in
      return await MainActor.run {
        self.sharedTextChecker.ignoreWord(word)
      }
    }

    // Return the words currently ignored by the text checker
    AsyncFunction("getIgnoredWords") { () async throws -> [String] in
      return await MainActor.run {
        self.sharedTextChecker.ignoredWords ?? []
      }
    }

    // Learn the specified word so it won’t be evaluated as misspelled
    AsyncFunction("learnWord") { (word: String) async throws in
      return await MainActor.run {
        UITextChecker.learnWord(word)
      }
    }

    // Unlearn the specified word so it can be evaluated as misspelled again
    AsyncFunction("unlearnWord") { (word: String) async throws in
      return await MainActor.run {
        UITextChecker.unlearnWord(word)
      }
    }

    // Has learned the specified word?
    AsyncFunction("hasLearnedWord") { (word: String) async throws -> Bool in
      return await MainActor.run {
        UITextChecker.hasLearnedWord(word)
      }
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { (value: String) in
      // Send an event to JavaScript.
      self.sendEvent("onChange", [
        "value": value
      ])
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of the
    // view definition: Prop, Events.
    View(ExpoSpellcheckerView.self) {
      // Defines a setter for the `url` prop.
      Prop("url") { (view: ExpoSpellcheckerView, url: URL) in
        if view.webView.url != url {
          view.webView.load(URLRequest(url: url))
        }
      }

      Events("onLoad")
    }
  }
}
