import type { Source } from '@sigma/types';

import React from 'react';

interface EditorContextType {
  source: Source;
  date?: Date;
}

export const EditorContext = React.createContext<EditorContextType>(undefined);
