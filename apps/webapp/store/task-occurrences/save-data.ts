import type { TaskOccurrencesStoreType } from './store';

import type { SyncActionRecord } from 'common/types';

import { solDatabase } from 'store/database';

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
      };

      switch (record.action) {
        case 'I': {
          await solDatabase.taskOccurrences.put(taskOccurrence);
          return (
            taskOccurrencesStore &&
            (await taskOccurrencesStore.update(taskOccurrence, record.data.id))
          );
        }

        case 'U': {
          await solDatabase.taskOccurrences.put(taskOccurrence);
          return (
            taskOccurrencesStore &&
            (await taskOccurrencesStore.update(taskOccurrence, record.data.id))
          );
        }

        case 'D': {
          await solDatabase.taskOccurrences.delete(record.data.id);
          return (
            taskOccurrencesStore &&
            (await taskOccurrencesStore.deleteById(record.data.id))
          );
        }
      }
    }),
  );
}
