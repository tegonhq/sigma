/* eslint-disable @typescript-eslint/no-explicit-any */

import { logger } from '@trigger.dev/sdk/v3';
import { CoreMessage, ToolSet } from 'ai';
import Handlebars from 'handlebars';

import {
  ACTIVITY_SYSTEM_PROMPT,
  REACT_SYSTEM_PROMPT,
  REACT_USER_PROMPT,
} from './prompt';
import { generate, processTag } from './stream-utils';
import { AgentMessage, AgentMessageType, Message } from './types';
import { callSigmaTool, getSigmaTools } from '../sigma-tools/sigma-tools';
import { MCP } from '../utils/mcp';
import { ExecutionState, HistoryStep, TotalCost } from '../utils/types';
import { flattenObject } from '../utils/utils';
interface LLMOutputInterface {
  response: AsyncGenerator<
    | string
    | {
        type: string;
        toolName: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args?: any;
        toolCallId?: string;
        message?: string;
      },
    any,
    any
  >;
}

function toolToMessage(history: HistoryStep[], messages: CoreMessage[]) {
  for (let i = 0; i < history.length; i++) {
    const step = history[i];

    // Add assistant message with tool calls
    if (step.observation && step.skillId) {
      messages.push({
        role: 'assistant',
        content: [
          {
            type: 'tool-call',
            toolCallId: step.skillId,
            toolName: step.skill,
            args:
              typeof step.skillInput === 'string'
                ? JSON.parse(step.skillInput)
                : step.skillInput,
          },
        ],
      });

      messages.push({
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolName: step.skill,
            toolCallId: step.skillId,
            result: step.observation,
            isError: step.isError,
          },
        ],
      } as any);
    }
    // Handle format correction steps (observation exists but no skillId)
    else if (step.observation && !step.skillId) {
      // Add as a system message for format correction
      messages.push({
        role: 'system',
        content: step.observation,
      });
    }
  }

  return messages;
}

function makeNextCall(
  executionState: ExecutionState,
  TOOLS: ToolSet,
  totalCost: TotalCost,
): LLMOutputInterface {
  const { context, history, previousHistory, autoMode } = executionState;

  const promptInfo = {
    USER_MESSAGE: executionState.query,
    CONTEXT: context,
    AUTO_MODE: String(autoMode).toLowerCase(),
    USER_MEMORY: executionState.userMemoryContext,
    AUTOMATION_CONTEXT: executionState.automationContext,
  };

  let messages: CoreMessage[] = [];

  const systemTemplateHandler = Handlebars.compile(REACT_SYSTEM_PROMPT);
  let systemPrompt = systemTemplateHandler(promptInfo);

  const userTemplateHandler = Handlebars.compile(REACT_USER_PROMPT);
  const userPrompt = userTemplateHandler(promptInfo);

  if (executionState.context.includes('activityId')) {
    const activityTemplateHandler = Handlebars.compile(ACTIVITY_SYSTEM_PROMPT);
    const activityPrompt = activityTemplateHandler(promptInfo);
    systemPrompt += `\n\n\n ${activityPrompt}`;
  }

  // Always start with a system message (this does use tokens but keeps the instructions clear)
  messages.push({ role: 'system', content: systemPrompt });

  // For subsequent queries, include only final responses from previous exchanges if available
  if (previousHistory && previousHistory.length > 0) {
    messages = [...messages, ...previousHistory];
  }

  // Add the current user query (much simpler than the full prompt)
  messages.push({ role: 'user', content: userPrompt });

  // Include any steps from the current interaction
  if (history.length > 0) {
    messages = toolToMessage(history, messages);
  }

  // Get the next action from the LLM
  const response = generate(
    messages,
    (event) => {
      const usage = event.usage;
      totalCost.inputTokens += usage.promptTokens;
      totalCost.outputTokens += usage.completionTokens;
    },
    TOOLS,
  );

  return { response };
}

export async function* run(
  message: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: Record<string, any>,
  userContext: string[],
  previousHistory: CoreMessage[],
  mcp: MCP,
  automationContext: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): AsyncGenerator<AgentMessage, any, any> {
  let guardLoop = 0;

  const tools = {
    ...(await mcp.vercelTools()),
    ...getSigmaTools(),
  };

  logger.info('Tools have been formed');

  let contextText = '';
  if (context) {
    // Process the entire context object at once
    contextText = flattenObject(context).join('\n');
  }

  const executionState: ExecutionState = {
    query: message,
    context: contextText,
    previousHistory,
    userMemoryContext:
      userContext !== undefined ? userContext.join('\n') : undefined,
    automationContext,
    history: [], // Track the full ReAct history
    completed: false,
    autoMode: true,
  };

  const totalCost: TotalCost = { inputTokens: 0, outputTokens: 0, cost: 0 };

  try {
    while (!executionState.completed && guardLoop < 10) {
      logger.info(`Starting the loop: ${guardLoop}`);

      const { response: llmResponse } = makeNextCall(
        executionState,
        tools,
        totalCost,
      );

      let toolCallInfo;

      const messageState = {
        inTag: false,
        message: '',
        messageEnded: false,
        lastSent: '',
      };

      const questionState = {
        inTag: false,
        message: '',
        messageEnded: false,
        lastSent: '',
      };

      let totalMessage = '';
      const toolCalls = [];

      // LLM thought response
      for await (const chunk of llmResponse) {
        if (typeof chunk === 'object' && chunk.type === 'tool-call') {
          toolCallInfo = chunk;
          toolCalls.push(chunk);
        }

        totalMessage += chunk;

        if (!messageState.messageEnded) {
          yield* processTag(
            messageState,
            totalMessage,
            chunk as string,
            '<final_response>',
            '</final_response>',
            {
              start: AgentMessageType.MESSAGE_START,
              chunk: AgentMessageType.MESSAGE_CHUNK,
              end: AgentMessageType.MESSAGE_END,
            },
          );
        }

        if (!questionState.messageEnded) {
          yield* processTag(
            questionState,
            totalMessage,
            chunk as string,
            '<question_response>',
            '</question_response>',
            {
              start: AgentMessageType.MESSAGE_START,
              chunk: AgentMessageType.MESSAGE_CHUNK,
              end: AgentMessageType.MESSAGE_END,
            },
          );
        }
      }

      logger.info(`Cost for thought: ${JSON.stringify(totalCost)}`);

      // Replace the error-handling block with this self-correcting implementation
      if (
        !totalMessage.includes('final_response') &&
        !totalMessage.includes('question_response') &&
        !toolCallInfo
      ) {
        // Log the issue for debugging
        logger.info(
          `Invalid response format detected. Attempting to get proper format.`,
        );

        // Extract the raw content from the invalid response
        const rawContent = totalMessage
          .replace(/(<[^>]*>|<\/[^>]*>)/g, '')
          .trim();

        // Create a correction step
        const stepRecord: HistoryStep = {
          thought: '',
          skill: '',
          skillId: '',
          userMessage: 'Sigma agent error, retrying \n',
          isQuestion: false,
          isFinal: false,
          tokenCount: totalCost,
          skillInput: '',
          observation: `Your last response was not in a valid format. You must respond with EXACTLY ONE of the required formats: either a tool call, <question_response> tags, or <final_response> tags. Please reformat your previous response using the correct format:\n\n${rawContent}`,
        };

        yield Message('', AgentMessageType.MESSAGE_START);
        yield Message(stepRecord.userMessage, AgentMessageType.MESSAGE_CHUNK);
        yield Message('', AgentMessageType.MESSAGE_END);

        // Add this step to the history
        yield Message(JSON.stringify(stepRecord), AgentMessageType.STEP);
        executionState.history.push(stepRecord);

        // Log that we're continuing the loop with a correction request
        logger.info(`Added format correction request to history.`);

        // Don't mark as completed - let the loop continue
        guardLoop++; // Still increment to prevent infinite loops
        continue;
      }

      // Record this step in history
      const stepRecord: HistoryStep = {
        thought: '',
        skill: '',
        skillId: '',
        userMessage: '',
        isQuestion: false,
        isFinal: false,
        tokenCount: totalCost,
        skillInput: '',
      };

      if (totalMessage && totalMessage.includes('final_response')) {
        executionState.completed = true;
        stepRecord.isFinal = true;
        stepRecord.userMessage = messageState.message;
        stepRecord.finalTokenCount = totalCost;
        yield Message(JSON.stringify(stepRecord), AgentMessageType.STEP);
        executionState.history.push(stepRecord);
        break;
      }

      if (totalMessage && totalMessage.includes('question_response')) {
        executionState.completed = true;
        stepRecord.isQuestion = true;
        stepRecord.userMessage = questionState.message;
        stepRecord.finalTokenCount = totalCost;
        yield Message(JSON.stringify(stepRecord), AgentMessageType.STEP);
        executionState.history.push(stepRecord);
        break;
      }

      if (toolCalls && toolCalls.length > 0) {
        // Run all tool calls in parallel
        for (const toolCallInfo of toolCalls) {
          const stepRecord: HistoryStep = {
            thought: '',
            skill: '',
            skillId: '',
            userMessage: '',
            isQuestion: false,
            isFinal: false,
            tokenCount: totalCost,
            skillInput: '',
          };

          const skillName = toolCallInfo.toolName;
          const skillId = toolCallInfo.toolCallId;
          const skillInput = toolCallInfo.args;

          const toolName = skillName.split('--')[1];
          const agent = skillName.split('--')[0];

          stepRecord.agent = agent;
          stepRecord.skill = skillName;
          stepRecord.skillId = skillId;
          stepRecord.skillInput = JSON.stringify(skillInput);

          if (skillName) {
            const skillMessageToSend = `\n<skill id="${skillId}" name="${toolName}" agent=${agent}></skill>\n`;
            stepRecord.userMessage += skillMessageToSend;

            yield Message('', AgentMessageType.MESSAGE_START);
            yield Message(skillMessageToSend, AgentMessageType.MESSAGE_CHUNK);
            yield Message('', AgentMessageType.MESSAGE_END);
          }

          let result;
          try {
            logger.info(
              `skillName: ${skillName} \n Parsed Input: ${JSON.stringify(skillInput)}`,
            );
            if (agent === 'sigma') {
              result = await callSigmaTool(skillName, skillInput);
            } else {
              result = await mcp.callTool(skillName, skillInput);
            }

            stepRecord.skillOutput =
              typeof result === 'object'
                ? JSON.stringify(result, null, 2)
                : result;
            stepRecord.observation = stepRecord.skillOutput;
          } catch (e) {
            logger.error(e);
            stepRecord.skillInput = skillInput;
            stepRecord.observation = JSON.stringify(e);
            stepRecord.isError = true;
          }

          logger.info(`Skill step: ${JSON.stringify(stepRecord)}`);

          yield Message(JSON.stringify(stepRecord), AgentMessageType.STEP);
          executionState.history.push(stepRecord);
        }
      }
      guardLoop++;
    }
    yield Message('Stream ended', AgentMessageType.STREAM_END);
  } catch (e) {
    logger.error(e);
    yield Message(e.message, AgentMessageType.ERROR);
    yield Message('Stream ended', AgentMessageType.STREAM_END);
  }
}
