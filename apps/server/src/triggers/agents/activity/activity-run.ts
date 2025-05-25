import { logger, task, tasks } from '@trigger.dev/sdk/v3';
import axios from 'axios';

import { createConversationTitle } from '../../conversation/create-conversation-title';
import {
  createConversation,
  getActivity,
  getAutomationContext,
  updateActivity,
} from '../utils/utils';

interface RunActivityPayload {
  activityId: string;
  userContextPage: string;
  pat: string;
}

export const activityRun = task({
  id: 'activity',
  queue: {
    name: 'activity',
    concurrencyLimit: 30,
  },
  init: async (payload: RunActivityPayload) => {
    axios.interceptors.request.use((config) => {
      // Check if URL starts with /api and doesn't have a full host

      if (config.url?.startsWith('/api')) {
        config.url = `${process.env.BACKEND_HOST}${config.url.replace('/api', '')}`;
        config.headers.Authorization = `Bearer ${payload.pat}`;
      }

      return config;
    });
  },
  run: async (payload: RunActivityPayload): Promise<string> => {
    const activity = await getActivity(payload.activityId);

    const automationContext = await getAutomationContext(
      activity.workspace.id,
      activity.text,
      payload.userContextPage,
    );

    const automationsToRun = automationContext;

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
        pat: payload.pat,
      },
      { tags: [conversation.id, activity.workspace.id] },
    );

    const conversationHistory = conversation.ConversationHistory[0];

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
