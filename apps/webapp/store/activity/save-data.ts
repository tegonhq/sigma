import type { ActivityStoreType } from './store';

import type { SyncActionRecord } from 'common/types';

import { sigmaDatabase } from 'store/database';

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
        rejectionReason: record.data.rejectionReason,
        integrationAccountId: record.data.integrationAccountId,
      };

      switch (record.action) {
        case 'I': {
          await sigmaDatabase.activities.put(activity);
          return (
            activitiesStore &&
            (await activitiesStore.update(activity, record.data.id))
          );
        }

        case 'U': {
          await sigmaDatabase.activities.put(activity);
          return (
            activitiesStore &&
            (await activitiesStore.update(activity, record.data.id))
          );
        }

        case 'D': {
          await sigmaDatabase.activities.delete(record.data.id);
          return (
            activitiesStore &&
            (await activitiesStore.deleteById(record.data.id))
          );
        }
      }
    }),
  );
}
