import { createContext } from 'react';

export const TabContext = createContext<{ tabId: string }>({
  tabId: undefined,
}); // Create TabContext
