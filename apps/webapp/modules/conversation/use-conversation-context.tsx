import React from 'react';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

export const useConversationContext = () => {
  const { activeTab } = useApplication();
  const { listsStore, tasksStore } = useContextStore();

  const getPageId = () => {
    if (activeTab.type === TabViewType.LIST) {
      return listsStore.getListWithId(activeTab.entity_id)?.pageId;
    }

    if (activeTab.type === TabViewType.MY_TASKS) {
      return tasksStore.getTaskWithId(activeTab.entity_id)?.pageId;
    }

    return undefined;
  };

  return React.useMemo(() => {
    return getPageId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab.entity_id, activeTab.type]);
};
