import React from 'react';

import { useContextStore } from 'store/global-context-provider';
import { TabContext } from 'store/tab-context';

export const useTab = () => {
  const tabContext = React.useContext(TabContext);
  const { applicationStore } = useContextStore();
  const tabGroup = applicationStore.getTabGroup();

  return { tab: tabGroup.tabs.find((tab) => tab.id === tabContext.tabId) };
};
