import { logger, metadata, task } from '@trigger.dev/sdk/v3';
import axios from 'axios';

import { run } from './chat-utils';
import { MCP } from './mcp';
import {
  createConversationHistoryForAgent,
  getPreviousExecutionHistory,
  init,
  RunChatPayload,
  updateConversationHistoryMessage,
  updateExecutionStep,
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

    // Initialise mcp
    const mcp = new MCP();
    await mcp.init();
    await mcp.load(agents, init.mcp);

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
      JSON.stringify(context),
      previousExecutionHistory,
      mcp,
    );

    const stream = await metadata.stream('messages', llmResponse);

    for await (const step of stream) {
      if (step.type === 'STEP') {
        logger.info(`Current step response: ${step.message}`);
        const stepDetails = JSON.parse(step.message);

        await updateExecutionStep(
          { ...stepDetails },
          agentConversationHistory.id,
        );

        agentUserMessage += stepDetails.userMessage;
        thoughtMessage += stepDetails.thought;

        logger.info(`Current step message: ${agentUserMessage}`);
        await updateConversationHistoryMessage(
          agentUserMessage,
          thoughtMessage,
          agentConversationHistory.id,
        );
      }
    }
  },
});
