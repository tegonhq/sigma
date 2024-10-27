import type { PageType } from 'common/types';

import { useContextStore } from 'store/global-context-provider';
import { useApplication } from 'hooks/application';

export function usePage(): PageType {
  const { activeTab: tab } = useApplication();

  const { pagesStore } = useContextStore();

  return pagesStore.getPageWithId(tab.entity_id);
}
