import { logger, metadata, task } from '@trigger.dev/sdk/v3';

import { run } from './chat-utils';
import { MCP } from './mcp';
import {
  createConversationHistoryForAgent,
  createNotificationForActivity,
  getCreditsForUser,
  getPreviousExecutionHistory,
  init,
  RunChatPayload,
  updateConversationHistoryMessage,
  updateExecutionStep,
  updateUserCredits,
} from './utils';

// Save context to a JSON file before running the agent

/**
 * Main chat task that orchestrates the agent workflow
 * Handles conversation context, agent selection, and LLM interactions
 */
export const chat = task({
  id: 'chat',
  queue: {
    name: 'chat',
    concurrencyLimit: 10,
  },
  init,
  run: async (payload: RunChatPayload, { init }) => {
    const usageCredits = await getCreditsForUser(init.userId);

    if (usageCredits.availableCredits <= 0) {
      logger.error('No credits found for the user');
      return;
    }

    const contextFromAPI = payload.context;
    const { previousHistory, userContext, ...otherData } = contextFromAPI;

    let { agents = [] } = contextFromAPI;
    // Add sigma as a default agent if it's not already in the list
    if (!agents.includes('sigma')) {
      agents = [...agents, 'sigma'];
      logger.info(`Added sigma as a default agent`);
    }

    // Initialise mcp
    const mcp = new MCP();
    await mcp.init();
    await mcp.load(agents, init.mcp);

    // Prepare context with additional metadata
    const context = {
      // Currently this is assuming we only have one page in context
      context: {
        ...(otherData.page && otherData.page.length > 0
          ? { page: otherData.page[0] }
          : {}),
      },
      todayDate: new Date(),
      workpsaceId: init?.conversation.workspaceId,
    };

    // Log which agents will be used for this conversation
    logger.info(`Agents passed: ${JSON.stringify(agents)}`);

    // Extract user's goal from conversation history
    const message = init?.conversationHistory?.message;
    // Retrieve execution history from previous interactions
    const previousExecutionHistory =
      await getPreviousExecutionHistory(previousHistory);

    // Prepare conversation history in agent-compatible format
    const agentConversationHistory = await createConversationHistoryForAgent(
      payload.conversationId,
    );
    let agentUserMessage = '';
    let thoughtMessage = '';

    await updateConversationHistoryMessage(
      agentUserMessage,
      thoughtMessage,
      agentConversationHistory.id,
    );

    const llmResponse = run(
      message,
      context,
      userContext,
      previousExecutionHistory,
      mcp,
    );

    const stream = await metadata.stream('messages', llmResponse);

    for await (const step of stream) {
      if (step.type === 'STEP') {
        usageCredits.availableCredits -= 1;
        const stepDetails = JSON.parse(step.message);

        await updateExecutionStep(
          { ...stepDetails },
          agentConversationHistory.id,
        );

        agentUserMessage += stepDetails.userMessage;
        thoughtMessage += stepDetails.thought;

        await updateConversationHistoryMessage(
          agentUserMessage,
          thoughtMessage,
          agentConversationHistory.id,
        );
      } else if (step.type === 'STREAM_END') {
        break;
      }
    }

    await updateUserCredits(usageCredits.id, usageCredits.availableCredits);

    if (payload.activity) {
      await createNotificationForActivity(
        payload.activity,
        init?.conversation.workspaceId,
      );
    }
  },
});
