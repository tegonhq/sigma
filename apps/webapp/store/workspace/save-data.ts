import type { WorkspaceStoreType } from './store';

import type { SyncActionRecord } from 'common/types';

import { solDatabase } from 'store/database';

export async function saveWorkspaceData(
  data: SyncActionRecord[],
  workspaceStore: WorkspaceStoreType,
) {
  await Promise.all(
    data.map(async (record: SyncActionRecord) => {
      const workspace = {
        id: record.data.id,
        createdAt: record.data.createdAt,
        updatedAt: record.data.updatedAt,
        name: record.data.name,
        slug: record.data.slug,
        userId: record.data.userId,
      };

      await solDatabase.workspaces.put(workspace);

      // Update the store
      return workspaceStore && (await workspaceStore.update(workspace));
    }),
  );
}
