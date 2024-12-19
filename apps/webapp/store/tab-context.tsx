import React from "react";

export const TabContext = React.createContext<{ tabId: string }>({
  tabId: undefined,
}); // Create TabContext
