import type { TaskExternalLinksStoreType } from './store';

import type { SyncActionRecord } from 'common/types';

import { sigmaDatabase } from 'store/database';

export async function saveTaskExternalLinkData(
  data: SyncActionRecord[],
  taskExternalLinksStore: TaskExternalLinksStoreType,
) {
  await Promise.all(
    data.map(async (record: SyncActionRecord) => {
      const taskExternalLink = {
        id: record.data.id,
        createdAt: record.data.createdAt,
        updatedAt: record.data.updatedAt,

        taskId: record.data.taskId,
        integrationAccountId: record.data.integrationAccountId,
        url: record.data.url,
        sourceId: record.data.sourceId,
      };

      switch (record.action) {
        case 'I': {
          await sigmaDatabase.taskExternalLinks.put(taskExternalLink);
          return (
            taskExternalLinksStore &&
            (await taskExternalLinksStore.update(
              taskExternalLink,
              record.data.id,
            ))
          );
        }

        case 'U': {
          await sigmaDatabase.taskExternalLinks.put(taskExternalLink);
          return (
            taskExternalLinksStore &&
            (await taskExternalLinksStore.update(
              taskExternalLink,
              record.data.id,
            ))
          );
        }

        case 'D': {
          await sigmaDatabase.taskExternalLinks.delete(record.data.id);
          return (
            taskExternalLinksStore &&
            (await taskExternalLinksStore.deleteById(record.data.id))
          );
        }
      }
    }),
  );
}
