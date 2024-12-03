import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoSpellcheckerViewProps } from './ExpoSpellchecker.types';

const NativeView: React.ComponentType<ExpoSpellcheckerViewProps> =
  requireNativeView('ExpoSpellchecker');

export default function ExpoSpellcheckerView(props: ExpoSpellcheckerViewProps) {
  return <NativeView {...props} />;
}
