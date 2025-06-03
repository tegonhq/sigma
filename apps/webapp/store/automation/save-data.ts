import type { AutomationStoreType } from './store';

import type { SyncActionRecord } from 'common/types';

import { solDatabase } from 'store/database';

export async function saveAutomationData(
  data: SyncActionRecord[],
  automationsStore: AutomationStoreType,
) {
  await Promise.all(
    data.map(async (record: SyncActionRecord) => {
      const automation = {
        id: record.data.id,
        createdAt: record.data.createdAt,
        updatedAt: record.data.updatedAt,
        text: record.data.text,
        mcps: record.data.mcps,
        usedCount: record.data.usedCount,
        workspaceId: record.data.workspaceId,
        integrationAccountIds: record.data.integrationAccountIds,
      };

      switch (record.action) {
        case 'I': {
          await solDatabase.automations.put(automation);
          return (
            automationsStore &&
            (await automationsStore.update(automation, record.data.id))
          );
        }

        case 'U': {
          await solDatabase.automations.put(automation);
          return (
            automationsStore &&
            (await automationsStore.update(automation, record.data.id))
          );
        }

        case 'D': {
          await solDatabase.automations.delete(record.data.id);
          return (
            automationsStore &&
            (await automationsStore.deleteById(record.data.id))
          );
        }
      }
    }),
  );
}
