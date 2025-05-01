import type { NotificationsStoreType } from './store';

import type { SyncActionRecord } from 'common/types';

import { sigmaDatabase } from 'store/database';

export async function saveNotificationData(
  data: SyncActionRecord[],
  notificationsStore: NotificationsStoreType,
) {
  await Promise.all(
    data.map(async (record: SyncActionRecord) => {
      const notification = {
        id: record.data.id,
        createdAt: record.data.createdAt,
        updatedAt: record.data.updatedAt,
        type: record.data.type,
        read: record.data.read,

        modelName: record.data.modelName,
        modelId: record.data.modelId,

        workspaceId: record.data.workspaceId,
      };

      switch (record.action) {
        case 'I': {
          await sigmaDatabase.notifications.put(notification);
          return (
            notificationsStore &&
            (await notificationsStore.update(notification, record.data.id))
          );
        }

        case 'U': {
          await sigmaDatabase.notifications.put(notification);
          return (
            notificationsStore &&
            (await notificationsStore.update(notification, record.data.id))
          );
        }

        case 'D': {
          await sigmaDatabase.notifications.delete(record.data.id);
          return (
            notificationsStore &&
            (await notificationsStore.deleteById(record.data.id))
          );
        }
      }
    }),
  );
}
