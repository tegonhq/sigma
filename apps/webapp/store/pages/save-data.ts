import type { PagesStoreType } from './store';

import type { SyncActionRecord } from 'common/types';

import { solDatabase } from 'store/database';

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
          await solDatabase.pages.put(page);
          let convertedPage = page;
          if (page.description) {
            convertedPage = {
              ...page,
            };
          }

          return (
            pagesStore &&
            (await pagesStore.update(convertedPage, record.data.id))
          );
        }

        case 'U': {
          let convertedPage = page;
          if (page.description) {
            convertedPage = {
              ...page,
            };
          }

          await solDatabase.pages.put(page);
          return (
            pagesStore &&
            (await pagesStore.update(convertedPage, record.data.id))
          );
        }

        case 'D': {
          await solDatabase.pages.delete(record.data.id);
          return pagesStore && (await pagesStore.deleteById(record.data.id));
        }
      }
    }),
  );
}
