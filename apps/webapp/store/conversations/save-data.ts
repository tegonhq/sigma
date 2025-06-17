import type { ConversationStoreType } from './models';

import type { SyncActionRecord } from 'common/types';

import { solDatabase } from 'store/database';

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
        taskId: record.data.taskId,
        unread: record.data.unread,
        status: record.data.status,
      };

      switch (record.action) {
        case 'I': {
          await solDatabase.conversations.put(conversation);
          return (
            conversationStore &&
            (await conversationStore.update(conversation, record.data.id))
          );
        }

        case 'U': {
          await solDatabase.conversations.put(conversation);
          return (
            conversationStore &&
            (await conversationStore.update(conversation, record.data.id))
          );
        }

        case 'D': {
          await solDatabase.conversations.delete(record.data.id);
          return (
            conversationStore &&
            (await conversationStore.deleteById(record.data.id))
          );
        }
      }
    }),
  );
}
