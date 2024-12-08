import * as React from "react";
import { requireNativeComponent } from "react-native";

import { ExpoSpellcheckerViewProps } from "./ExpoSpellchecker.types";

const NativeView: React.ComponentType<ExpoSpellcheckerViewProps> =
  requireNativeComponent<ExpoSpellcheckerViewProps>("ExpoSpellchecker");

export default function ExpoSpellcheckerView(props: ExpoSpellcheckerViewProps) {
  return <NativeView {...props} />;
}
