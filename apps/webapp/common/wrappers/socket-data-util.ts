import { runInAction } from 'mobx';

import type { SyncActionRecord } from 'common/types';

import { saveActivityData } from 'store/activity';
import { saveAgentWorklog } from 'store/agent-worklog';
import { saveConversationHistorytData } from 'store/conversation-history';
import { saveConversationData } from 'store/conversations';
import { saveIntegrationAccountData } from 'store/integration-accounts';
import { saveListData } from 'store/lists';
import { MODELS } from 'store/models';
import { saveNotificationData } from 'store/notification';
import { savePageData } from 'store/pages';
import { saveTaskExternalLinkData } from 'store/task-external-links';
import { saveTaskOccurrencesData } from 'store/task-occurrences';
import { saveTaskData } from 'store/tasks';
import { saveWorkspaceData } from 'store/workspace';

// Saves the data from the socket and call explicitly functions from individual models
export async function saveSocketData(
  data: SyncActionRecord[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MODEL_STORE_MAP: Record<string, any>,
) {
  return await runInAction(async () => {
    // Pre-initialize the accumulator object with known model names
    const groupedRecords: Record<string, SyncActionRecord[]> = Object.values(
      MODELS,
    ).reduce(
      (acc, model) => {
        acc[model] = [];
        return acc;
      },
      {} as Record<string, SyncActionRecord[]>,
    );

    // Use for...of instead of reduce for better performance with large arrays
    for (const record of data) {
      if (groupedRecords[record.modelName]) {
        groupedRecords[record.modelName].push(record);
      }
    }

    // Create a map of model names to their save functions to avoid switch statement
    // eslint-disable-next-line @typescript-eslint/ban-types
    const saveHandlers: Record<string, Function> = {
      [MODELS.Workspace]: saveWorkspaceData,
      [MODELS.IntegrationAccount]: saveIntegrationAccountData,
      [MODELS.Conversation]: saveConversationData,
      [MODELS.ConversationHistory]: saveConversationHistorytData,
      [MODELS.Page]: savePageData,
      [MODELS.Task]: saveTaskData,
      [MODELS.TaskOccurrence]: saveTaskOccurrencesData,
      [MODELS.List]: saveListData,
      [MODELS.TaskExternalLink]: saveTaskExternalLinkData,
      [MODELS.AgentWorklog]: saveAgentWorklog,
      [MODELS.Notification]: saveNotificationData,
      [MODELS.Activity]: saveActivityData,
    };

    // Process records using the handler map
    return await Promise.all(
      Object.entries(groupedRecords)
        .map(([modelName, records]) => {
          if (records.length === 0) {
            return null;
          }
          const handler = saveHandlers[modelName];
          return handler ? handler(records, MODEL_STORE_MAP[modelName]) : null;
        })
        .filter(Boolean),
    );
  });
}
