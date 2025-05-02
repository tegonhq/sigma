import type { ConversationStoreType } from './models';

import type { SyncActionRecord } from 'common/types';

import { sigmaDatabase } from 'store/database';

export async function saveConversationData(
  data: SyncActionRecord[],
  conversationStore: ConversationStoreType,
) {
  await Promise.all(
    data.map(async (record: SyncActionRecord) => {
      const conversation = {
        id: record.data.id,
        createdAt: record.data.createdAt,
        updatedAt: record.data.updatedAt,
        title: record.data.title,
        userId: record.data.userId,
        workspaceId: record.data.workspaceId,
        pageId: record.data.pageId,
        activityId: record.data.activityId,
        taskId: record.data.taskId,
      };

      switch (record.action) {
        case 'I': {
          await sigmaDatabase.conversations.put(conversation);
          return (
            conversationStore &&
            (await conversationStore.update(conversation, record.data.id))
          );
        }

        case 'U': {
          await sigmaDatabase.conversations.put(conversation);
          return (
            conversationStore &&
            (await conversationStore.update(conversation, record.data.id))
          );
        }

        case 'D': {
          await sigmaDatabase.conversations.delete(record.data.id);
          return (
            conversationStore &&
            (await conversationStore.deleteById(record.data.id))
          );
        }
      }
    }),
  );
}
