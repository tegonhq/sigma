import type { TaskOccurrencesStoreType } from './store';

import type { SyncActionRecord } from 'common/types';

import { sigmaDatabase } from 'store/database';

export async function saveTaskOccurrencesData(
  data: SyncActionRecord[],
  taskOccurrencesStore: TaskOccurrencesStoreType,
) {
  await Promise.all(
    data.map(async (record: SyncActionRecord) => {
      const taskOccurrence = {
        id: record.data.id,
        createdAt: record.data.createdAt,
        updatedAt: record.data.updatedAt,

        startTime: record.data.startTime,
        endTime: record.data.endTime,
        status: record.data.status,

        workspaceId: record.data.workspaceId,
        taskId: record.data.taskId,
        pageId: record.data.pageId,
      };

      switch (record.action) {
        case 'I': {
          await sigmaDatabase.taskOccurrences.put(taskOccurrence);
          return (
            taskOccurrencesStore &&
            (await taskOccurrencesStore.update(taskOccurrence, record.data.id))
          );
        }

        case 'U': {
          await sigmaDatabase.taskOccurrences.put(taskOccurrence);
          return (
            taskOccurrencesStore &&
            (await taskOccurrencesStore.update(taskOccurrence, record.data.id))
          );
        }

        case 'D': {
          await sigmaDatabase.taskOccurrences.delete(record.data.id);
          return (
            taskOccurrencesStore &&
            (await taskOccurrencesStore.deleteById(record.data.id))
          );
        }
      }
    }),
  );
}
