import { idempotencyKeys, logger, metadata, task } from '@trigger.dev/sdk/v3';
import { format } from 'date-fns';

import { run } from './chat-utils';
import { memoryUpdateSchedule } from '../memory/memory';
import { MCP } from '../utils/mcp';
import {
  createConversationHistoryForAgent,
  getActivityDetails,
  getCreditsForUser,
  getMemoryContext,
  getPreviousExecutionHistory,
  init,
  RunChatPayload,
  updateConversationHistoryMessage,
  updateConversationStatus,
  updateExecutionStep,
  updateUserCredits,
} from '../utils/utils';

/**
 * Main chat task that orchestrates the agent workflow
 * Handles conversation context, agent selection, and LLM interactions
 */
export const chat = task({
  id: 'chat',
  queue: {
    name: 'chat',
    concurrencyLimit: 30,
  },
  init,
  run: async (payload: RunChatPayload, { init }) => {
    await updateConversationStatus('running', payload.conversationId);

    try {
      const usageCredits = await getCreditsForUser(init.userId);
      let creditForChat = 0;
      const activity = await getActivityDetails(payload.activity);

      logger.info(`Activity: ${JSON.stringify(activity)}`);

      if (usageCredits.availableCredits <= 0) {
        logger.error('No credits found for the user');
        return;
      }

      const { previousHistory, ...otherData } = payload.context;

      const { agents = [] } = payload.context;

      // Initialise mcp
      const mcp = new MCP();
      await mcp.init();
      await mcp.load(agents, init.mcp);

      let userContext: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let rawMemory: Record<string, any> = {};
      let automationContext: string;
      if (activity) {
        automationContext = payload.activityExecutionPlan;
        userContext = [];
      } else {
        rawMemory = await getMemoryContext(
          init?.conversationHistory?.message,
          init?.userContextPageHTML,
        );

        userContext = rawMemory
          ? [...rawMemory.newFacts, ...rawMemory.existingFacts]
          : [];
      }

      // Prepare context with additional metadata
      const context = {
        // Currently this is assuming we only have one page in context
        context: {
          ...(otherData.page && otherData.page.length > 0
            ? { page: otherData.page[0] }
            : {}),
          ...activity,
        },
        todayDate: format(
          new Date().toLocaleString('en-US', { timeZone: init.timezone }),
          "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
        ),
        workpsaceId: init?.conversation.workspaceId,
      };

      // Log which agents will be used for this conversation
      logger.info(`Agents passed: ${JSON.stringify(agents)}`);

      // Extract user's goal from conversation history
      const message = init?.conversationHistory?.message;
      // Retrieve execution history from previous interactions
      const previousExecutionHistory = getPreviousExecutionHistory(
        previousHistory ?? [],
      );

      // Prepare conversation history in agent-compatible format
      const agentConversationHistory = await createConversationHistoryForAgent(
        payload.conversationId,
      );
      let agentUserMessage = '';

      await updateConversationHistoryMessage(
        agentUserMessage,
        agentConversationHistory.id,
        { memory: rawMemory, automation: automationContext },
      );

      const llmResponse = run(
        message,
        context,
        userContext,
        previousExecutionHistory,
        mcp,
        automationContext,
      );

      const stream = await metadata.stream('messages', llmResponse);

      for await (const step of stream) {
        if (step.type === 'STEP') {
          creditForChat += 1;
          const stepDetails = JSON.parse(step.message);

          await updateExecutionStep(
            { ...stepDetails },
            agentConversationHistory.id,
          );

          agentUserMessage += stepDetails.userMessage;

          await updateConversationHistoryMessage(
            agentUserMessage,
            agentConversationHistory.id,
          );
        } else if (step.type === 'STREAM_END') {
          break;
        }
      }

      await updateUserCredits(usageCredits, creditForChat);
      await updateConversationStatus('success', payload.conversationId);

      const idempotencyKey = await idempotencyKeys.create(
        payload.conversationId,
      );

      await memoryUpdateSchedule.trigger(
        { conversationId: payload.conversationId },
        { delay: '10m', idempotencyKey, idempotencyKeyTTL: '8m' },
      );
    } catch (e) {
      await updateConversationStatus('failed', payload.conversationId);
      throw new Error(e);
    }
  },
});
