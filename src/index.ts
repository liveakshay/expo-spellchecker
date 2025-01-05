// Reexport the native module. On web, it will be resolved to ExpoSpellcheckerModule.web.ts
// and on native platforms to ExpoSpellcheckerModule.ts
export { default } from "./ExpoSpellcheckerModule";
export * from "./ExpoSpellchecker.types";
