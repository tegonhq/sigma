import type { ActivityStoreType } from './store';

import type { SyncActionRecord } from 'common/types';

import { sigmaDatabase } from 'store/database';

export async function saveActivityData(
  data: SyncActionRecord[],
  activityStore: ActivityStoreType,
) {
  await Promise.all(
    data.map(async (record: SyncActionRecord) => {
      const activity = {
        id: record.data.id,
        createdAt: record.data.createdAt,
        updatedAt: record.data.updatedAt,

        type: record.data.type,
        eventData: JSON.stringify(record.data.eventData),
        name: record.data.name,
        integrationAccountId: record.data.integrationAccountId,
        workspaceId: record.data.workspaceId,
      };

      switch (record.action) {
        case 'I': {
          await sigmaDatabase.activity.put(activity);
          return (
            activityStore &&
            (await activityStore.update(activity, record.data.id))
          );
        }

        case 'U': {
          await sigmaDatabase.activity.put(activity);
          return (
            activityStore &&
            (await activityStore.update(activity, record.data.id))
          );
        }

        case 'D': {
          await sigmaDatabase.activity.delete(record.data.id);
          return (
            activityStore && (await activityStore.deleteById(record.data.id))
          );
        }
      }
    }),
  );
}
