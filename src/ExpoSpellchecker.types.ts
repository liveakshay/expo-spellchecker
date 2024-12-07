import type { StyleProp, ViewStyle } from "react-native";

export type ExpoSpellcheckerViewProps = {
  keyboardType?: string;
  spellCheckingType?: boolean;
  autocorrectionType?: boolean;
  hidden?: boolean;
  style?: StyleProp<ViewStyle>;
};
