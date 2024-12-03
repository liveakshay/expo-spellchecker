import * as React from 'react';

import { ExpoSpellcheckerViewProps } from './ExpoSpellchecker.types';

export default function ExpoSpellcheckerView(props: ExpoSpellcheckerViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
