import type { ActivityStoreType } from './store';

import type { SyncActionRecord } from 'common/types';

import { solDatabase } from 'store/database';

export async function saveActivityData(
  data: SyncActionRecord[],
  activitiesStore: ActivityStoreType,
) {
  await Promise.all(
    data.map(async (record: SyncActionRecord) => {
      const activity = {
        id: record.data.id,
        createdAt: record.data.createdAt,
        updatedAt: record.data.updatedAt,
        text: record.data.text,
        sourceId: record.data.sourceId,
        sourceURL: record.data.sourceURL,
        taskId: record.data.taskId,
        workspaceId: record.data.workspaceId,
        conversationId: record.data.conversationId,
        rejectionReason: record.data.rejectionReason,
        integrationAccountId: record.data.integrationAccountId,
      };

      switch (record.action) {
        case 'I': {
          await solDatabase.activities.put(activity);
          return (
            activitiesStore &&
            (await activitiesStore.update(activity, record.data.id))
          );
        }

        case 'U': {
          await solDatabase.activities.put(activity);
          return (
            activitiesStore &&
            (await activitiesStore.update(activity, record.data.id))
          );
        }

        case 'D': {
          await solDatabase.activities.delete(record.data.id);
          return (
            activitiesStore &&
            (await activitiesStore.deleteById(record.data.id))
          );
        }
      }
    }),
  );
}
