import React from 'react';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

export const useList = () => {
  const { listsStore } = useContextStore();
  const { tabs } = useApplication();
  const firstTab = tabs[0];

  return React.useMemo(() => {
    if (firstTab.type === TabViewType.LIST && firstTab.entity_id) {
      return listsStore.getListWithId(firstTab.entity_id);
    }

    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstTab.entity_id, listsStore]);
};
