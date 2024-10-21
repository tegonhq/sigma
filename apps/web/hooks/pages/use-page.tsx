import { useParams } from 'next/navigation';

import type { PageType } from 'common/types';

import { useContextStore } from 'store/global-context-provider';

export function usePage(): PageType {
  const { pageId } = useParams();

  const { pagesStore } = useContextStore();

  return pagesStore.getPageWithId(pageId);
}
