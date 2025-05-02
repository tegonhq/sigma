import type { Source } from '@sigma/types';

import React from 'react';

interface EditorContextType {
  source: Source;
  date?: Date;
}

export const EditorContext = React.createContext<EditorContextType>(undefined);

export const EditorContextProvider = ({
  source,
  date,
  children,
}: {
  source: Source;
  date?: Date;
  children: React.ReactNode;
}) => {
  return (
    <EditorContext.Provider value={{ source, date }}>
      {children}
    </EditorContext.Provider>
  );
};
