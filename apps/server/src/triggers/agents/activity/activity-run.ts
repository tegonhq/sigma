import { logger, task, tasks } from '@trigger.dev/sdk/v3';

import {
  addConversationHistory,
  getOrCreateConversationForTask,
} from './utils';
import { createConversationTitle } from '../../conversation/create-conversation-title';
import {
  createConversation,
  getActivity,
  getAutomationContext,
  updateActivity,
  updateAutomations,
} from '../utils/utils';

interface RunActivityPayload {
  activityId: string;
  userContextPage: string;
}

export const activityRun = task({
  id: 'activity',
  queue: {
    name: 'activity',
    concurrencyLimit: 30,
  },
  run: async (payload: RunActivityPayload): Promise<string> => {
    const activity = await getActivity(payload.activityId);

    const automationContext = await getAutomationContext(
      activity.workspace.id,
      activity.text,
      payload.userContextPage,
    );

    const automationsToRun = automationContext;

    if (activity.taskId) {
      const conversation = await getOrCreateConversationForTask(
        activity.taskId,
      );

      const conversationHistory = await addConversationHistory(
        conversation.id,
        activity.text,
        activity.id,
      );

      // Trigger conversation title task
      await tasks.trigger<typeof createConversationTitle>(
        createConversationTitle.id,
        {
          conversationId: conversation.id,
          message: activity.text,
        },
        { tags: [conversation.id, activity.workspace.id] },
      );

      await tasks.trigger(
        'chat',
        {
          conversationHistoryId: conversationHistory.id,
          conversationId: conversation.id,
          autoMode: true,
          activity: activity.id,
          activityExecutionPlan: automationsToRun.executionPlan,
          context: {},
        },
        { tags: [conversationHistory.id, activity.workspaceId, activity.id] },
      );

      return 'Ran a conversation for task';
    }

    if (!automationsToRun.found) {
      await updateActivity(activity.id, automationsToRun.reason);
      logger.error(
        `No automations found: ${automationsToRun.reason}, skipping conversation`,
      );
      return `No automations found: ${automationsToRun.reason}, skipping conversation`;
    }

    const conversation = await createConversation(
      activity,
      activity.workspace,
      activity.integrationAccount.integrationDefinition,
      {
        automations: automationContext.automations,
        executionPlan: automationContext.executionPlan,
      },
    );

    // Trigger conversation title task
    await tasks.trigger<typeof createConversationTitle>(
      createConversationTitle.id,
      {
        conversationId: conversation.id,
        message: activity.text,
      },
      { tags: [conversation.id, activity.workspace.id] },
    );

    const conversationHistory = conversation.ConversationHistory[0];

    await updateAutomations(automationContext.automations);

    await tasks.trigger(
      'chat',
      {
        conversationHistoryId: conversationHistory.id,
        conversationId: conversation.id,
        autoMode: true,
        activity: activity.id,
        activityExecutionPlan: automationsToRun.executionPlan,
        context: {},
      },
      { tags: [conversationHistory.id, activity.workspaceId, activity.id] },
    );

    return 'Ran a conversation';
  },
});
