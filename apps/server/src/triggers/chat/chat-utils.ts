/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from '@trigger.dev/sdk/v3';
import Handlebars from 'handlebars';

import { MCP } from './mcp';
import { ACTION_PROMPT, OBSERVATION_PROMPT, REACT_PROMPT } from './prompt';
import { generate, processTag } from './stream-utils';
import {
  AgentMessage,
  AgentMessageType,
  ExecutionState,
  HistoryStep,
  Message,
  TotalCost,
} from './types';
import { flattenObject, generateRandomId, getCost } from './utils';

interface LLMOutputInterface {
  response: AsyncGenerator<string, any, any>;
  input: string;
}

function getHistoryText(history: HistoryStep[]) {
  // Format the history for the prompt
  let historyText = '';
  if (history) {
    history.forEach((step, i) => {
      historyText += `Step ${i + 1}:\n`;
      historyText += `Thought: ${step.thought || 'N/A'}\n`;
      historyText += `Action: ${step.skill || 'N/A'}\n`;
      historyText += `Action Input: ${step.skillInput || 'N/A'}\n`;
      historyText += `Observation: ${step.observation || 'N/A'}\n\n`;
    });
  }

  return historyText;
}

function makeActionObservationCall({
  skillName,
  skillResponse,
  skillInput,
  thought,
  executionState,
}: {
  skillName: string;
  skillResponse: string;
  skillInput: string;
  thought: string;
  executionState: ExecutionState;
}): LLMOutputInterface {
  const historyText = getHistoryText(executionState.history);

  const promptInfo = {
    API_RESPONSE: skillResponse,
    QUERY: executionState.query,
    THOUGHT: thought,
    ACTION_NAME: skillName,
    ACTION_INPUT: skillInput,
    EXECUTION_HISTORY: historyText,
  };

  const templateHandler = Handlebars.compile(OBSERVATION_PROMPT);
  const actionResponsePrompt = templateHandler(promptInfo);

  // Get the next action from the LLM
  const response = generate([{ role: 'user', content: actionResponsePrompt }]);

  return { response, input: actionResponsePrompt };
}

function makeNextCall(
  executionState: ExecutionState,
  TOOLS: string,
): LLMOutputInterface {
  const { context, history, previousHistory, autoMode } = executionState;

  // Format the history for the prompt
  const historyText = getHistoryText(history);
  // Format context information
  let contextText = '';
  if (context) {
    // Process the entire context object at once
    contextText = flattenObject(context).join('\n');
  }

  const previousHistoryText = previousHistory
    .map((item) => item.history)
    .join('\n');

  const promptInfo = {
    SERVICE_NAME: 'Agent',
    TOOLS,
    QUERY: executionState.query,
    CONTEXT: contextText,
    EXECUTION_HISTORY: historyText,
    AUTO_MODE: String(autoMode).toLowerCase(),
    PREVIOUS_EXECUTION_HISTORY: previousHistoryText ?? '',
  };

  const templateHandler = Handlebars.compile(REACT_PROMPT);
  const prompt = templateHandler(promptInfo);

  // Get the next action from the LLM
  const response = generate([{ role: 'user', content: prompt }]);

  return { response, input: prompt };
}

function makeActionInputCall(
  executionState: ExecutionState,
  thought: string,
  skill: string,
): LLMOutputInterface {
  const { context, history, previousHistory, autoMode } = executionState;

  // Format the history for the prompt
  const historyText = getHistoryText(history);
  // Format context information
  let contextText = '';
  if (context) {
    // Process the entire context object at once
    contextText = flattenObject(context).join('\n');
  }

  const previousHistoryText = previousHistory
    .map((item) => item.history)
    .join('\n');

  const promptInfo = {
    QUERY: executionState.query,
    CONTEXT: contextText,
    EXECUTION_HISTORY: historyText,
    AUTO_MODE: String(autoMode).toLowerCase(),
    THOUGHT_PROCESS: thought,
    SELECTED_ACTION: skill,
    PREVIOUS_EXECUTION_HISTORY: previousHistoryText ?? '',
  };

  const templateHandler = Handlebars.compile(ACTION_PROMPT);
  const actionPrompt = templateHandler(promptInfo);

  // Get the next action from the LLM
  const response = generate([{ role: 'user', content: actionPrompt }]);

  return { response, input: actionPrompt };
}

export async function* run(
  message: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: Record<string, any>,
  previousHistory: ExecutionState['previousHistory'],
  mcp: MCP,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): AsyncGenerator<AgentMessage, any, any> {
  let guardLoop = 0;
  const tools = await mcp.tools();

  const executionState: ExecutionState = {
    query: message,
    context,
    previousHistory,
    history: [], // Track the full ReAct history
    completed: false,
    autoMode: true,
  };

  const totalCost: TotalCost = { inputTokens: 0, outputTokens: 0, cost: 0 };

  try {
    while (!executionState.completed && guardLoop < 10) {
      const { response: llmResponse, input: thoughtInput } = makeNextCall(
        executionState,
        tools,
      );

      let totalMessage = '';
      const thoughtState = {
        inTag: false,
        message: '',
        messageEnded: false,
        lastSent: '',
      };

      const messageState = {
        inTag: false,
        message: '',
        messageEnded: false,
        lastSent: '',
      };

      // LLm thought response
      for await (const chunk of llmResponse) {
        totalMessage += chunk;

        if (!thoughtState.messageEnded) {
          yield* processTag(
            thoughtState,
            totalMessage,
            chunk,
            '<thought>',
            '</thought>',
            {
              start: AgentMessageType.THOUGHT_START,
              chunk: AgentMessageType.THOUGHT_CHUNK,
              end: AgentMessageType.THOUGHT_END,
            },
          );
        }

        if (!messageState.messageEnded) {
          yield* processTag(
            messageState,
            totalMessage,
            chunk,
            '<message>',
            '</message>',
            {
              start: AgentMessageType.MESSAGE_START,
              chunk: AgentMessageType.MESSAGE_CHUNK,
              end: AgentMessageType.MESSAGE_END,
            },
          );
        }
      }

      const costForThought = await getCost(thoughtInput, totalMessage);
      totalCost.inputTokens += costForThought.inputTokens ?? 0;
      totalCost.outputTokens += costForThought.outputTokens ?? 0;
      totalCost.cost += costForThought.cost ?? 0;

      logger.info(`Cost for thought: ${JSON.stringify(costForThought)}`);

      const skillMatch = totalMessage.match(/<action>(.*?)<\/action>/s);
      const isFinalAnswer = totalMessage.includes('<final_response>');
      const isQuestion = totalMessage.includes('<question_response>');

      // Extract skill details
      const thought = thoughtState.message;
      const skillName = skillMatch ? skillMatch[1].trim() : '';
      const skillId = skillMatch ? generateRandomId() : undefined;
      // Record this step in history
      const stepRecord: HistoryStep = {
        thought,
        skill: skillName,
        skillId,
        userMessage: messageState.message,
        isQuestion,
        isFinal: isFinalAnswer,
        tokenCount: costForThought,
      };

      const toolName = skillName.split('--')[1];
      const agent = skillName.split('--')[0];
      stepRecord.agent = agent;
      const skillMessageToSend = skillMatch
        ? `\n<skill id="${skillId}" name="${toolName}" agent=${agent}></skill>\n`
        : '';

      if (skillName) {
        yield Message('', AgentMessageType.MESSAGE_START);
        // Here we are replacing agent to match the key with the one in spec.json for every agent. Need to fix this later
        yield Message(skillMessageToSend, AgentMessageType.MESSAGE_CHUNK);
        yield Message('', AgentMessageType.MESSAGE_END);
      }

      stepRecord.userMessage += skillMessageToSend;

      // If this is the final break here
      if (isFinalAnswer) {
        executionState.completed = true;
        yield Message(JSON.stringify(stepRecord), AgentMessageType.STEP);
        executionState.history.push(stepRecord);
        break;
      }

      // If it is question break the while loop here
      if (isQuestion) {
        yield Message(JSON.stringify(stepRecord), AgentMessageType.STEP);
        executionState.history.push(stepRecord);
        break;
      }

      logger.info(`Going ahead with action: ${skillName}`);

      const toolInfo = await mcp.getTool(skillName);
      const { response: skillLlmResponse, input: actionInput } =
        makeActionInputCall(executionState, thought, toolInfo);

      let totalSkillResponse = '';

      const skillState = {
        inTag: false,
        message: '',
        messageEnded: false,
        lastSent: '',
      };

      // Skill Input
      for await (const chunk of skillLlmResponse) {
        totalSkillResponse += chunk;

        yield* processTag(
          skillState,
          totalSkillResponse,
          chunk,
          '<action_input>',
          '</action_input>',
          {
            start: AgentMessageType.SKILL_START,
            chunk: AgentMessageType.SKILL_CHUNK,
            end: AgentMessageType.SKILL_END,
          },
          { skillId },
        );
      }

      const costForActionInput = await getCost(actionInput, totalSkillResponse);
      totalCost.inputTokens += costForActionInput.inputTokens ?? 0;
      totalCost.outputTokens += costForActionInput.outputTokens ?? 0;
      totalCost.cost += costForActionInput.cost ?? 0;

      logger.info(
        `Cost for actionInput: ${JSON.stringify(costForActionInput)}`,
      );

      // Add the input to the step
      const parsedInput = JSON.parse(skillState.message);
      stepRecord.skillInput = JSON.stringify(parsedInput);
      const result = await mcp.callTool(skillName, parsedInput);

      stepRecord.skillOutput = JSON.stringify(result);
      const { response: skillObservationResponse, input: observationInput } =
        makeActionObservationCall({
          skillInput: skillState.message,
          skillName,
          skillResponse: JSON.stringify(result),
          thought,
          executionState,
        });

      let observationText = '';
      for await (const chunk of skillObservationResponse) {
        observationText += chunk;
      }

      const costForObservation = await getCost(
        observationInput,
        observationText,
      );
      totalCost.inputTokens += costForObservation.inputTokens ?? 0;
      totalCost.outputTokens += costForObservation.outputTokens ?? 0;
      totalCost.cost += costForObservation.cost ?? 0;

      logger.info(
        `Cost for observation: ${JSON.stringify(costForObservation)}`,
      );

      // Extract observation content from tags
      const observationMatch = observationText.match(
        /<observation>(.*?)<\/observation>/s,
      );
      const observation = observationMatch
        ? observationMatch[1].trim()
        : observationText;

      // Record the observation
      stepRecord.observation = observation;
      stepRecord.tokenCount = totalCost;

      yield Message(JSON.stringify(stepRecord), AgentMessageType.STEP);
      executionState.history.push(stepRecord);

      guardLoop++;
    }

    yield Message('Stream ended', AgentMessageType.STREAM_END);
  } catch (e) {
    logger.error(e);
    yield Message(e.message, AgentMessageType.ERROR);
    yield Message('Stream ended', AgentMessageType.STREAM_END);
  }
}
