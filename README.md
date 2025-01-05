# expo-spellchecker

Expo module that exposes underlying native spell checker (iOS  and android) and word completions (iOS only) - to react-native apps, via TypeScript interface.

This allows access to the underlying spellchecker (and word completion on iOS only) functionality, without using/showing the native platform keyboard on iOS and Android.  I.e. the native platform keyboards typically expose spellcheck and completion capabilities by default to users, but sometimes there is a need to hide the keyboard but still use the underlying spellcheck/completion capability - that's the gap this module addresses.

The input parameter is usually a *sentence (string with words separated by spaces)*.

- For *checkSpelling*, the module parses out the last word in the sentence, and runs a spellcheck on it, then returns results if any were produced by the underlying platform API.
  
- For *getCompletions*, the module parses out the last 'partial word' in the sentence, but uses the prior sentence as context, to predict word choices and returns those as 'completion' suggestions (iOS only).

The other input parameter is *language* - see notes below to understand how to use this.

# API documentation

- See included example app for more details on how to use.

# Installation in managed Expo projects

For [managed](https://docs.expo.dev/archive/managed-vs-bare/) Expo projects, please follow the installation instructions in the [API documentation for the latest stable release](#api-documentation). If you follow the link and there is no documentation available then this library is not yet usable within managed projects &mdash; it is likely to be included in an upcoming Expo SDK release.

# Installation in bare React Native projects

For bare React Native projects, you must ensure that you have [installed and configured the `expo` package](https://docs.expo.dev/bare/installing-expo-modules/) before continuing.

### Add the package to your npm dependencies

```
npm install expo-spellchecker
```

### Configure for Android

1. The Android implementation uses the underlying [SpellCheckerSession API](https://developer.android.com/reference/android/view/textservice/SpellCheckerSession).  This functionality works well only when the "GBoard" google keyboard app/extension is installed from Play Store and enabled on the device as the primary keyboard.  User must install that first before expecting reliable results. 

2. To enable/disable languages, please add/remove languages in GBoard settings within the 'Android Settings' app.  This may require a restart of the device to reset and apply correctly.  The language input parameter to API calls has no effect - the only way to include/exclude languages is thru GBoard settings, and has to be done directly by the user in the device.

3. Unlike iOS, Android exposes only 'spellcheck' functionality - Android doesn't provide a distinct and explicit 'word completion' capability like iOS does.  As a result any calls to the 'getCompletions' API will just run a spell check on the last word in the input sentence and return spellcheck suggestions.

4. Android doesn't expose learn/unlearn or ignoreWords functionality.  So learn/unlearn has been custom built in this module using SQLite (similar to iOS).  And, ignoreWords is managed in-memory, for the duration of the session object (similar to iOS).  Any learned or ignored words will thereafter be interpreted as correct spellings.


### Configure for iOS

1. The iOS implementation uses the underlying [UITextChecker API](https://developer.apple.com/documentation/uikit/uitextchecker).

2. To enable/disable languages, add/remove languages in spell check settings within the 'iOS Settings' app.  The language input parameter in API calls is actually used - but it won't work correctly, if the settings are applied/updated first to include/exclude a specific language in iOS settings.  After settings are changed a restart of the device may be required.

3. No other caveats to note - all standard iOS capability is exposed via a TypeScript interface.  Learn/unlearn and ignoreWords are all natively supported by underlying iOS capability of UITextChecker.

4. Run `npx pod-install` after installing the npm package.

# Contributing

Contributions are very welcome! Please refer to guidelines described in the [contributing guide]( https://github.com/expo/expo#contributing).
