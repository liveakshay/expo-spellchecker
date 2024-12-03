import { registerWebModule, NativeModule } from 'expo';

import { ExpoSpellcheckerModuleEvents } from './ExpoSpellchecker.types';

class ExpoSpellcheckerModule extends NativeModule<ExpoSpellcheckerModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoSpellcheckerModule);
