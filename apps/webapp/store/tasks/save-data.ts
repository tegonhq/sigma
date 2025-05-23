import type { TasksStoreType } from './store';

import type { SyncActionRecord } from 'common/types';

import { sigmaDatabase } from 'store/database';

export async function saveTaskData(
  data: SyncActionRecord[],
  taskStore: TasksStoreType,
) {
  await Promise.all(
    data.map(async (record: SyncActionRecord) => {
      const task = {
        id: record.data.id,
        createdAt: record.data.createdAt,
        updatedAt: record.data.updatedAt,

        source: JSON.stringify(record.data.source),
        completedAt: record.data.completedAt,
        number: record.data.number,
        status: record.data.status,
        startTime: record.data.startTime,
        endTime: record.data.endTime,
        recurrence: record.data.recurrence,
        metadata: JSON.stringify(record.data.metadata),
        pageId: record.data.pageId,
        integrationAccountId: record.data.integrationAccountId,
        workspaceId: record.data.workspaceId,
        listId: record.data.listId,
        dueDate: record.data.dueDate,
        remindAt: record.data.remindAt,
        scheduleText: record.data.scheduleText,
        parentId: record.data.parentId,
      };

      switch (record.action) {
        case 'I': {
          await sigmaDatabase.tasks.put(task);
          return taskStore && (await taskStore.update(task, record.data.id));
        }

        case 'U': {
          await sigmaDatabase.tasks.put(task);
          return taskStore && (await taskStore.update(task, record.data.id));
        }

        case 'D': {
          await sigmaDatabase.tasks.delete(record.data.id);
          return taskStore && (await taskStore.deleteById(record.data.id));
        }
      }
    }),
  );
}
