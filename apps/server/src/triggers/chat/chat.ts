import { logger, task } from '@trigger.dev/sdk/v3';
import axios from 'axios';

import {
  createConversationHistoryForAgent,
  getPreviousExecutionHistory,
  init,
  RunChatPayload,
  updateConversationHistoryMessage,
} from './utils';

// Save context to a JSON file before running the agent

/**
 * Main chat task that orchestrates the agent workflow
 * Handles conversation context, agent selection, and LLM interactions
 */
export const chat = task({
  id: 'chat',
  init,
  run: async (payload: RunChatPayload, { init }) => {
    // Fetch conversation context from the Sigma API
    const response = await axios.get(
      `/api/v1/conversation_history/${payload.conversationHistoryId}/context`,
    );
    const contextFromAPI = response.data;
    const { agents, previousHistory, ...otherData } = contextFromAPI;

    // Prepare context with additional metadata
    const context = {
      // Currently this is assuming we only have one page in context
      context: {
        ...(otherData.page && otherData.page.length > 0
          ? otherData.page[0]
          : {}),
      },
      agents,
      previousHistory,
      todayDate: new Date(),
      workpsaceId: init?.conversation.workspaceId,
    };

    // Log which agents will be used for this conversation
    logger.info(`Agents passed: ${JSON.stringify(context['agents'])}`);

    // Extract user's goal from conversation history
    const message = init?.conversationHistory?.message;
    // Retrieve execution history from previous interactions
    const previousExecutionHistory = await getPreviousExecutionHistory(
      context.previousHistory,
    );

    console.log(message, previousExecutionHistory);

    // Prepare conversation history in agent-compatible format
    const agentConversationHistory = await createConversationHistoryForAgent(
      payload.conversationId,
    );
    const agentUserMessage = '';

    await updateConversationHistoryMessage(
      agentUserMessage,
      agentConversationHistory.id,
    );
  },
});
