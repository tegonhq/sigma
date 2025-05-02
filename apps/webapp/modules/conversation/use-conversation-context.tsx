import React from 'react';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

export const useConversationContext = () => {
  const { tabs } = useApplication();
  const { listsStore, tasksStore, pagesStore } = useContextStore();
  const firstTab = tabs[0];

  const getPageId = () => {
    if (firstTab.type === TabViewType.LIST) {
      return listsStore.getListWithId(firstTab.entity_id)?.pageId;
    }

    if (firstTab.type === TabViewType.MY_TASKS) {
      return tasksStore.getTaskWithId(firstTab.entity_id)?.pageId;
    }

    if (firstTab.type === TabViewType.DAYS) {
      const { date = new Date() } = firstTab.data;

      const page = pagesStore.getDailyPageWithDate(date);
      return page.id;
    }

    return undefined;
  };

  return React.useMemo(() => {
    return getPageId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstTab.entity_id, firstTab.type]);
};
