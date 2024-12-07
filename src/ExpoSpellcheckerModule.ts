import { NativeModule, requireNativeModule } from "expo";

import { ExpoSpellcheckerModuleEvents } from "./ExpoSpellchecker.types";

declare class ExpoSpellcheckerModule extends NativeModule<ExpoSpellcheckerModuleEvents> {
  checkSpelling(word: string, language: string): Promise<string[]>;
  getCompletions(sentence: string, language: string): Promise<string[]>;

  //Tells the text checker to ignore the specified word when spell-checking.
  ignoreWord(word: string): Promise<void>;

  //Returns the words that the text checker ignores when spell-checking.
  getIgnoredWords(): Promise<string[]>;

  //Tells the text checker to learn the specified word so that it doesn’t evaluate it as misspelled.
  learnWord(word: string): Promise<void>;

  //Tells the text checker to unlearn the specified word.
  unlearnWord(word: string): Promise<void>;

  hasLearnedWord(word: string): Promise<boolean>;

  getAvailableLanguages(): Promise<string[]>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoSpellcheckerModule>("ExpoSpellchecker");
