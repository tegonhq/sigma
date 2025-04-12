import Handlebars from 'handlebars';

import { BaseAgent } from './base-agent';
import { AgentMessageType, Message } from './message';
import { PROMPT } from './prompt';
import {
  ExecutionState,
  HistoryStep,
  NextAction,
  PassedContext,
} from './types';
import { generate } from './utils';

export abstract class ReactBaseAgent extends BaseAgent {
  _formatParameter(
    paramName: string,
    paramInfo: any,
    required: boolean,
    depth: number = 0,
  ): string {
    // Limit recursion depth to avoid overly complex descriptions
    if (depth > 3) {
      return `${paramName}${required ? '*' : ''}: [complex nested structure]`;
    }

    // Handle array items
    if ('items' in paramInfo) {
      // If items is a dictionary with properties (complex object array)
      if (
        typeof paramInfo.items === 'object' &&
        'properties' in paramInfo.items
      ) {
        const nestedParams: string[] = [];
        for (const [propName, propInfo] of Object.entries(
          paramInfo.items.properties,
        )) {
          if (typeof propInfo !== 'object') {
            continue;
          }
          const propRequired = (propInfo as any).required ?? false;
          nestedParams.push(
            this._formatParameter(propName, propInfo, propRequired, depth + 1),
          );
        }

        if (nestedParams.length) {
          return `${paramName}${required ? '*' : ''}: [${nestedParams.join(', ')}]`;
        }
      }

      // If items is a dictionary with type definitions (simple object array)
      else if (typeof paramInfo.items === 'object') {
        const itemType = paramInfo.items.type || 'any';
        return `${paramName}${required ? '*' : ''}: [array of ${itemType}]`;
      }
    }

    // Handle objects with properties
    else if ('properties' in paramInfo) {
      const nestedParams: string[] = [];
      for (const [propName, propInfo] of Object.entries(paramInfo.properties)) {
        if (typeof propInfo !== 'object') {
          continue;
        }

        const propRequired = (propInfo as any).required ?? false;
        nestedParams.push(
          this._formatParameter(propName, propInfo, propRequired, depth + 1),
        );
      }

      if (nestedParams.length) {
        return `${paramName}${required ? '*' : ''}: {${nestedParams.join(', ')}}`;
      }
    }

    // Handle regular parameters
    return this.formatParam(paramName, paramInfo, required);
  }

  formatParam(name: string, info: any, required: boolean = false): string {
    const reqMarker = required ? '*' : '';
    const desc = info.description || 'No description';
    return `${name}${reqMarker}: ${desc}`;
  }

  _formatToolsForPrompt(): string {
    const tools = this.getTools();

    if (!tools || tools.length === 0) {
      return '';
    }

    const toolDescriptions: string[] = [];
    for (const tool of tools) {
      // Start with tool name and description
      let toolStr = `- ${tool.name}: ${tool.description || 'No description'}`;

      // Process parameters if they exist
      if (tool.params && typeof tool.params === 'object') {
        const paramsList: string[] = [];

        for (const [paramName, paramInfo] of Object.entries(tool.params)) {
          if (typeof paramInfo !== 'object') {
            continue;
          }

          const required = (paramInfo as any).required ?? false;
          paramsList.push(
            this._formatParameter(paramName, paramInfo, required),
          );
        }

        if (paramsList.length) {
          toolStr += `. Parameters: ${paramsList.join(', ')}`;
        }
      }

      toolDescriptions.push(toolStr);
    }

    return toolDescriptions.join('\n');
  }

  async determineNextAction(
    executionState: ExecutionState,
  ): Promise<NextAction> {
    const { context, history, previousHistory, autoMode } = executionState;

    // Format the history for the prompt
    let historyText = '';
    if (history) {
      history.forEach((step, i) => {
        historyText += `Step ${i + 1}:\n`;
        historyText += `Thought: ${step.thought || 'N/A'}\n`;
        historyText += `Action: ${step.action || 'N/A'}\n`;
        historyText += `Action Input: ${step.actionInput || 'N/A'}\n`;
        historyText += `Observation: ${step.observation || 'N/A'}\n\n`;
      });
    }

    // Format context information
    let contextText = '';
    if (context) {
      contextText = Object.entries(context)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n');
    }

    const promptInfo = {
      SERVICE_NAME: this.constructor.name,
      TOOLS: this._formatToolsForPrompt(),
      QUERY: executionState.query,
      SERVICE_JARGON: this.getJargon(),
      CONTEXT: contextText,
      EXECUTION_HISTORY: historyText,
      AUTO_MODE: String(autoMode).toLowerCase(),
      PREVIOUS_EXECUTION_HISTORY: previousHistory ?? '',
    };

    const templateHandler = Handlebars.compile(PROMPT);
    const prompt = templateHandler(promptInfo);

    // Get the next action from the LLM
    const response = generate([{ role: 'user', content: prompt }]);

    // Extract the response by concatenating all chunks from the stream
    let responseText = '';
    for await (const chunk of response) {
      responseText += chunk;
    }

    // Parse the response to extract thought, action, and action input
    const result: NextAction = {
      completed: false,
      thought: '',
      action: '',
      actionInput: '',
      userMessage: '',
    };

    // Check if this is a final answer
    const finalAnswerMatch = responseText.match(
      /<final_answer>(.+?)<\/final_answer>/s,
    );

    if (finalAnswerMatch && finalAnswerMatch[1]) {
      const innerThoughtMatch = finalAnswerMatch[1].match(
        /Thought:(.+?)(?=\nFinal Answer:|$)/s,
      );
      const finalAnswerTextMatch = finalAnswerMatch[1].match(
        /Final Answer:(.+?)(?=\n<\/final_answer>|$)/s,
      );

      return {
        action: 'end_execution',
        completed: true,
        thought: innerThoughtMatch?.[1]?.trim() || '',
        finalAnswer: finalAnswerTextMatch?.[1]?.trim() || '',
      };
    }

    // Check if this is a question response
    const questionMatch = responseText.match(
      /<question_response>(.+?)<\/question_response>/s,
    );

    if (questionMatch && questionMatch[1]) {
      const innerThoughtMatch = questionMatch[1].match(
        /Thought:(.+?)(?=\nQuestion:|$)/s,
      );
      const questionTextMatch = questionMatch[1].match(
        /Question:(.+?)(?=\n\n|$)/s,
      );

      return {
        action: 'ask_user',
        completed: true,
        thought: innerThoughtMatch?.[1]?.trim() || '',
        question: questionTextMatch?.[1]?.trim() || '',
      };
    }

    // Otherwise extract the next ReAct step
    const thoughtMatch = responseText.match(
      /Thought:(.+?)(?=\nUserMessage:|$)/s,
    );
    const userMessageMatch = responseText.match(
      /UserMessage:(.+?)(?=\nAction:|$)/s,
    );
    const actionMatch = responseText.match(
      /Action:(.+?)(?=\nAction Input:|$)/s,
    );
    const actionInputMatch = responseText.match(
      /Action Input:(.+?)(?=\n\n|<\/react_continuation>|$)/s,
    );

    result.thought = thoughtMatch?.[1]?.trim() || '';
    result.action = actionMatch?.[1]?.trim() || '';
    result.actionInput = actionInputMatch?.[1]?.trim() || '';
    result.userMessage = userMessageMatch?.[1]?.trim() || '';

    return result;
  }

  async *run(
    message: string,
    context: string,
    auth: string,
    autoMode?: boolean,
  ) {
    let authConfig = {};

    try {
      authConfig = JSON.parse(auth);
    } catch (e) {
      authConfig = {};
    }

    let contextObj: PassedContext = {};

    try {
      contextObj = JSON.parse(context) as PassedContext;
    } catch (e) {
      contextObj = {} as PassedContext;
    }

    yield Message(false, 'Starting process', AgentMessageType.STREAM_START);

    let guardLoop = 0;

    const executionState: ExecutionState = {
      query: message,
      context: contextObj.context,
      previousHistory: contextObj.previousHistory,
      history: [], // Track the full ReAct history
      completed: false,
      autoMode: autoMode ?? false,
      finalAnswer: undefined,
    };

    while (!executionState.completed && guardLoop < 10) {
      const nextAction = await this.determineNextAction(executionState);

      if (nextAction.action === 'end_execution') {
        executionState.completed = true;
        executionState.finalAnswer = nextAction.finalAnswer;
        executionState.history.push({
          thought: nextAction.thought,
          finalAnswer: nextAction.finalAnswer,
        });

        yield Message(
          true,
          nextAction.finalAnswer ?? '',
          AgentMessageType.MESSAGE,
        );
        break;
      }

      if (nextAction.action === 'ask_user') {
        executionState.completed = true;
        executionState.history.push({
          thought: nextAction.thought,
          question: nextAction.question,
        });

        yield Message(
          true,
          nextAction.question ?? '',
          AgentMessageType.QUESTION,
        );
        break;
      }

      // Extract action details
      const actionName = nextAction.action;
      const actionInput = nextAction.actionInput || '{}';
      const thought = nextAction.thought || '';
      const userMessage = nextAction.userMessage || '';

      // Record this step in history
      const stepRecord: HistoryStep = {
        thought,
        action: actionName,
        actionInput,
        userMessage,
      };

      // this.agentMessages.push(userMessage);

      // Yield thought and action
      yield Message(false, userMessage, AgentMessageType.MESSAGE);

      const parsedInput = JSON.parse(actionInput);
      const result = await this.runAction(
        actionName ?? '',
        parsedInput,
        authConfig,
      );

      // Record the observation
      stepRecord.observation = result;
      stepRecord.success = true;

      executionState.history.push(stepRecord);

      guardLoop++;
    }

    yield Message(false, 'Stream ended', AgentMessageType.STREAM_END);
  }

  /**
   * Abstract method to run the action
   * @param actionName Which action to run
   * @param parameters The data to the action
   * @param intergrationConfig headers for the API to run
   */
  abstract runAction(
    actionName: string,
    parameters: any,
    intergrationConfig: Record<string, string>,
  ): Promise<string>;
}
