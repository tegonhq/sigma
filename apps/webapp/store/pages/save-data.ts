import type { PagesStoreType } from './store';

import type { SyncActionRecord } from 'common/types';

import { sigmaDatabase } from 'store/database';

export async function savePageData(
  data: SyncActionRecord[],
  pagesStore: PagesStoreType,
) {
  await Promise.all(
    data.map(async (record: SyncActionRecord) => {
      const page = {
        id: record.data.id,
        createdAt: record.data.createdAt,
        updatedAt: record.data.updatedAt,
        archived: record.data.archived,

        title: record.data.title,
        description: record.data.description,
        sortOrder: record.data.sortOrder,
        parentId: record.data.parentId,
        workspaceId: record.data.workspaceId,
        type: record.data.type,
        tags: record.data.tags,
      };

      switch (record.action) {
        case 'I': {
          await sigmaDatabase.pages.put(page);
          return pagesStore && (await pagesStore.update(page, record.data.id));
        }

        case 'U': {
          await sigmaDatabase.pages.put(page);
          return pagesStore && (await pagesStore.update(page, record.data.id));
        }

        case 'D': {
          await sigmaDatabase.pages.delete(record.data.id);
          return pagesStore && (await pagesStore.deleteById(record.data.id));
        }
      }
    }),
  );
}
