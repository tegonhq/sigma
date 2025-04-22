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
  TokenCount,
} from './types';
import { generateRandomId } from './utils';

interface LLMCountResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: AsyncGenerator<string, any, any>;
  tokenCount: TokenCount;
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
}): LLMCountResponse {
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
  const tokenCount: TokenCount = { inputTokens: 0, outputToken: 0 };

  // Get the next action from the LLM
  const response = generate(
    [{ role: 'user', content: actionResponsePrompt }],
    tokenCount,
  );

  return { response, tokenCount };
}

function makeNextCall(
  executionState: ExecutionState,
  TOOLS: string,
): LLMCountResponse {
  const { context, history, previousHistory, autoMode } = executionState;

  // Format the history for the prompt
  const historyText = getHistoryText(history);

  // Format context information
  let contextText = '';
  if (context) {
    contextText = Object.entries(context)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join('\n');
  }

  const promptInfo = {
    SERVICE_NAME: 'Agent',
    TOOLS,
    QUERY: executionState.query,
    CONTEXT: contextText,
    EXECUTION_HISTORY: historyText,
    AUTO_MODE: String(autoMode).toLowerCase(),
    PREVIOUS_EXECUTION_HISTORY: previousHistory ?? '',
  };

  console.log(TOOLS);

  const templateHandler = Handlebars.compile(REACT_PROMPT);
  const prompt = templateHandler(promptInfo);

  const tokenCount: TokenCount = { inputTokens: 0, outputToken: 0 };
  // Get the next action from the LLM
  const response = generate([{ role: 'user', content: prompt }], tokenCount);

  return { response, tokenCount };
}

function makeActionInputCall(
  executionState: ExecutionState,
  thought: string,
  skill: string,
): LLMCountResponse {
  const { context, history, previousHistory, autoMode } = executionState;

  // Format the history for the prompt
  const historyText = getHistoryText(history);
  // Format context information
  let contextText = '';
  if (context) {
    contextText = Object.entries(context)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join('\n');
  }

  const promptInfo = {
    QUERY: executionState.query,
    CONTEXT: contextText,
    EXECUTION_HISTORY: historyText,
    AUTO_MODE: String(autoMode).toLowerCase(),
    THOUGHT_PROCESS: thought,
    SELECTED_ACTION: skill,
    PREVIOUS_EXECUTION_HISTORY: previousHistory ?? '',
  };

  const templateHandler = Handlebars.compile(ACTION_PROMPT);
  const actionPrompt = templateHandler(promptInfo);

  const tokenCount: TokenCount = { inputTokens: 0, outputToken: 0 };

  // Get the next action from the LLM
  const response = generate(
    [{ role: 'user', content: actionPrompt }],
    tokenCount,
  );

  return { response, tokenCount };
}

export async function* run(
  message: string,
  context: string,
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

  try {
    while (!executionState.completed && guardLoop < 10) {
      const { response: llmResponse, tokenCount } = makeNextCall(
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
        tokenCount,
      };

      const agent = skillName.split('--')[1];
      const toolName = skillName.split('--')[0];
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

      const toolInfo = await mcp.getTool(skillName);
      const { response: skillLlmResponse, tokenCount: actionInputTokenCount } =
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

      stepRecord.tokenCount.inputTokens += actionInputTokenCount.inputTokens;
      stepRecord.tokenCount.outputToken += actionInputTokenCount.outputToken;

      // Add the input to the step

      const parsedInput = JSON.parse(skillState.message);
      stepRecord.skillInput = parsedInput;
      console.log(parsedInput);

      const result = await mcp.callTool(skillName, parsedInput);

      const {
        response: skillObservationResponse,
        tokenCount: observationTokenCount,
      } = makeActionObservationCall({
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

      stepRecord.tokenCount.inputTokens += observationTokenCount.inputTokens;
      stepRecord.tokenCount.outputToken += observationTokenCount.outputToken;

      // Extract observation content from tags
      const observationMatch = observationText.match(
        /<observation>(.*?)<\/observation>/s,
      );
      const observation = observationMatch
        ? observationMatch[1].trim()
        : observationText;

      // Record the observation
      stepRecord.observation = observation;

      yield Message(JSON.stringify(stepRecord), AgentMessageType.STEP);
      executionState.history.push(stepRecord);

      guardLoop++;
    }

    yield Message('Stream ended', AgentMessageType.STREAM_END);
  } catch (e) {
    yield Message(e.message, AgentMessageType.ERROR);
    yield Message('Stream ended', AgentMessageType.STREAM_END);
  }
}
