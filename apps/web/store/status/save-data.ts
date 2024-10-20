import type { StatussStoreType } from './store';

import type { SyncActionRecord } from 'common/types';

import { sigmaDatabase } from 'store/database';

export async function saveStatusData(
  data: SyncActionRecord[],
  statusesStore: StatussStoreType,
) {
  await Promise.all(
    data.map(async (record: SyncActionRecord) => {
      const status = {
        id: record.data.id,
        createdAt: record.data.createdAt,
        updatedAt: record.data.updatedAt,
        name: record.data.name,
        description: record.data.description,
        position: record.data.position,
        statusId: record.data.teamId,
        color: record.data.color,
        workspaceId: record.data.workspaceId,
      };

      switch (record.action) {
        case 'I': {
          await sigmaDatabase.statuses.put(status);
          return (
            statusesStore &&
            (await statusesStore.update(status, record.data.id))
          );
        }

        case 'U': {
          await sigmaDatabase.statuses.put(status);
          return (
            statusesStore &&
            (await statusesStore.update(status, record.data.id))
          );
        }

        case 'D': {
          await sigmaDatabase.statuses.delete(record.data.id);
          return (
            statusesStore && (await statusesStore.deleteById(record.data.id))
          );
        }
      }
    }),
  );
}
