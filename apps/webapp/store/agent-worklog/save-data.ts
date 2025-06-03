import type { AgentWorklogStoreType } from './store';

import type { SyncActionRecord } from 'common/types';

import { solDatabase } from 'store/database';

export async function saveAgentWorklog(
  data: SyncActionRecord[],
  agentWorklogStoreType: AgentWorklogStoreType,
) {
  await Promise.all(
    data.map(async (record: SyncActionRecord) => {
      const agentWorklog = {
        id: record.data.id,
        createdAt: record.data.createdAt,
        updatedAt: record.data.updatedAt,

        modelId: record.data.modelId,
        modelName: record.data.modelName,
        state: record.data.state,
        type: record.data.type,
        workspaceId: record.data.workspaceId,
      };

      switch (record.action) {
        case 'I': {
          await solDatabase.agentWorklogs.put(agentWorklog);
          return (
            agentWorklogStoreType &&
            (await agentWorklogStoreType.update(agentWorklog, record.data.id))
          );
        }

        case 'U': {
          if (
            agentWorklog.state === 'Failed' ||
            agentWorklog.state === 'Done'
          ) {
            await solDatabase.agentWorklogs.delete(record.data.id);
            return (
              agentWorklogStoreType &&
              (await agentWorklogStoreType.deleteById(record.data.id))
            );
          }

          await solDatabase.agentWorklogs.put(agentWorklog);
          return (
            agentWorklogStoreType &&
            (await agentWorklogStoreType.update(agentWorklog, record.data.id))
          );
        }

        case 'D': {
          await solDatabase.agentWorklogs.delete(record.data.id);
          return (
            agentWorklogStoreType &&
            (await agentWorklogStoreType.deleteById(record.data.id))
          );
        }
      }
    }),
  );
}
