import ExpoModulesCore

public class ExpoSpellcheckerModule: Module {

  private let sharedTextChecker = UITextChecker()
  private func log(_ message: String) {
    NSLog("ExpoSpellchecker: %@", message)
  }

  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {

    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ExpoSpellchecker')` in JavaScript.
    Name("ExpoSpellchecker")

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

          // Check if the word is ignored or learned
          if self.sharedTextChecker.ignoredWords?.contains(lastWord) == true || UITextChecker.hasLearnedWord(lastWord) {
            continuation.resume(returning: [])
            return
          }

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

          let nextIndex = input.index(after: lastWordStartIndex) // Calculate next index
          let lastWord = String(input[lastWordStartIndex...]) // Extract the last word

          // Check if the word is ignored or learned
          if self.sharedTextChecker.ignoredWords?.contains(lastWord) == true || UITextChecker.hasLearnedWord(lastWord) {
            continuation.resume(returning: [])
            return
          }

          let range = NSRange(location: lastWordStartIndex.utf16Offset(in: input), length: lastWord.utf16.count)

          // Get suggestions for the misspelled word
          let completions = self.sharedTextChecker.completions(forPartialWordRange: range, in: input, language: language) ?? []
          continuation.resume(returning: completions)
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
  }
}
