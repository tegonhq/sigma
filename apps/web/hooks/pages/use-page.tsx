import type { PageType } from 'common/types';

import { useContextStore } from 'store/global-context-provider';
import { useApplication } from 'hooks/application';

export function usePage(pageId: string): PageType {
  const { pagesStore } = useContextStore();

  return pagesStore.getPageWithId(pageId);
}
