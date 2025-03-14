import type { ListsStoreType } from './store';

import type { SyncActionRecord } from 'common/types';

import { sigmaDatabase } from 'store/database';

export async function saveListData(
  data: SyncActionRecord[],
  listsStore: ListsStoreType,
) {
  await Promise.all(
    data.map(async (record: SyncActionRecord) => {
      const list = {
        id: record.data.id,
        createdAt: record.data.createdAt,
        updatedAt: record.data.updatedAt,

        pageId: record.data.pageId,
        icon: record.data.icon,
      };

      switch (record.action) {
        case 'I': {
          await sigmaDatabase.lists.put(list);
          return listsStore && (await listsStore.update(list, record.data.id));
        }

        case 'U': {
          await sigmaDatabase.lists.put(list);
          return listsStore && (await listsStore.update(list, record.data.id));
        }

        case 'D': {
          await sigmaDatabase.lists.delete(record.data.id);
          return listsStore && (await listsStore.deleteById(record.data.id));
        }
      }
    }),
  );
}
