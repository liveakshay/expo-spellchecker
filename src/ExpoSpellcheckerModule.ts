import { NativeModule, requireNativeModule } from 'expo';

import { ExpoSpellcheckerModuleEvents } from './ExpoSpellchecker.types';

declare class ExpoSpellcheckerModule extends NativeModule<ExpoSpellcheckerModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoSpellcheckerModule>('ExpoSpellchecker');
