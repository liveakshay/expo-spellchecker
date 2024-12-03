// Reexport the native module. On web, it will be resolved to ExpoSpellcheckerModule.web.ts
// and on native platforms to ExpoSpellcheckerModule.ts
export { default } from './ExpoSpellcheckerModule';
export { default as ExpoSpellcheckerView } from './ExpoSpellcheckerView';
export * from  './ExpoSpellchecker.types';
