import type { LabelsStoreType } from './store';

import type { SyncActionRecord } from 'common/types';

import { sigmaDatabase } from 'store/database';

export async function saveLabelData(
  data: SyncActionRecord[],
  labelsStore: LabelsStoreType,
) {
  await Promise.all(
    data.map(async (record: SyncActionRecord) => {
      const label = {
        id: record.data.id,
        createdAt: record.data.createdAt,
        updatedAt: record.data.updatedAt,
        name: record.data.name,
        color: record.data.color,
        description: record.data.description,
        workspaceId: record.data.workspaceId,
        groupId: record.data.groupId,
      };

      switch (record.action) {
        case 'I': {
          await sigmaDatabase.labels.put(label);
          return (
            labelsStore && (await labelsStore.update(label, record.data.id))
          );
        }

        case 'U': {
          await sigmaDatabase.labels.put(label);
          return (
            labelsStore && (await labelsStore.update(label, record.data.id))
          );
        }

        case 'D': {
          await sigmaDatabase.labels.delete(record.data.id);
          return labelsStore && (await labelsStore.deleteById(record.data.id));
        }
      }
    }),
  );
}
