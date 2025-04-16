import fs from 'fs';

import Handlebars from 'handlebars';

import { BaseAgent } from './base-agent';
import { AgentMessageType, Message } from './message';
import { ACTION_PROMPT, OBSERVATION_PROMPT, REACT_PROMPT } from './prompts';
import { ExecutionState, HistoryStep, PassedContext } from './types';
import { formatToolForPrompt, formatToolsForPrompt, generate } from './utils';

export interface State {
  inTag: boolean;
  messageEnded: boolean;
  message: string;
  lastSent: string;
}
export abstract class ReactBaseAgent extends BaseAgent {
  makeNextCall(
    executionState: ExecutionState,
  ): AsyncGenerator<string, any, any> {
    const { context, history, previousHistory, autoMode } = executionState;

    // Format the history for the prompt
    const historyText = this.getHistoryText(history);

    // Format context information
    let contextText = '';
    if (context) {
      contextText = Object.entries(context)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n');
    }

    const promptInfo = {
      SERVICE_NAME: this.constructor.name,
      TOOLS: formatToolsForPrompt(this.skills()),
      QUERY: executionState.query,
      SERVICE_JARGON: this.terms(),
      CONTEXT: contextText,
      EXECUTION_HISTORY: historyText,
      AUTO_MODE: String(autoMode).toLowerCase(),
      PREVIOUS_EXECUTION_HISTORY: previousHistory ?? '',
    };

    const templateHandler = Handlebars.compile(REACT_PROMPT);
    const prompt = templateHandler(promptInfo);

    // Get the next action from the LLM
    const response = generate([{ role: 'user', content: prompt }]);

    return response;
  }

  getHistoryText(history: HistoryStep[]) {
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

    return historyText;
  }

  makeActionInputCall(
    executionState: ExecutionState,
    thought: string,
    skill: string,
  ): AsyncGenerator<string, any, any> {
    const { context, history, previousHistory, autoMode } = executionState;
    // Format the history for the prompt
    const historyText = this.getHistoryText(history);
    const skills = this.skills();
    // Format context information
    let contextText = '';
    if (context) {
      contextText = Object.entries(context)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n');
    }

    const promptInfo = {
      SERVICE_NAME: this.constructor.name,
      QUERY: executionState.query,
      CONTEXT: contextText,
      EXECUTION_HISTORY: historyText,
      AUTO_MODE: String(autoMode).toLowerCase(),
      THOUGHT_PROCESS: thought,
      SELECTED_ACTION: formatToolForPrompt(skills, skill),
      PREVIOUS_EXECUTION_HISTORY: previousHistory ?? '',
    };

    const templateHandler = Handlebars.compile(ACTION_PROMPT);
    const actionPrompt = templateHandler(promptInfo);

    // Get the next action from the LLM
    const response = generate([{ role: 'user', content: actionPrompt }]);

    return response;
  }

  makeActionObservationCall({
    skillName,
    actionResponse,
    actionInput,
    thought,
    executionState,
  }: {
    skillName: string;
    actionResponse: string;
    actionInput: string;
    thought: string;
    executionState: ExecutionState;
  }) {
    const historyText = this.getHistoryText(executionState.history);

    const promptInfo = {
      API_RESPONSE: actionResponse,
      SERVICE_NAME: this.constructor.name,
      QUERY: executionState.query,
      THOUGHT: thought,
      ACTION_NAME: skillName,
      ACTION_INPUT: actionInput,
      EXECUTION_HISTORY: historyText,
    };

    const templateHandler = Handlebars.compile(OBSERVATION_PROMPT);
    const actionResponsePrompt = templateHandler(promptInfo);
    // Get the next action from the LLM
    const response = generate([
      { role: 'user', content: actionResponsePrompt },
    ]);

    return response;
  }

  async *processTag(
    state: State,
    totalMessage: string,
    chunk: string,
    startTag: string,
    endTag: string,
    states: { start: string; chunk: string; end: string },
  ) {
    let comingFromStart = false;

    if (!state.messageEnded) {
      if (!state.inTag) {
        const startIndex = totalMessage.indexOf(startTag);
        if (startIndex !== -1) {
          state.inTag = true;
          // Send MESSAGE_START when we first enter the tag
          yield Message('', states.start as AgentMessageType);
          const chunkToSend = totalMessage.slice(startIndex + startTag.length);
          state.message += chunkToSend.trim();
          comingFromStart = true;
        }
      }

      if (state.inTag) {
        if (chunk.includes('</') ? chunk.includes(endTag) : true) {
          let currentMessage = comingFromStart
            ? state.message
            : state.message + chunk;

          const endIndex = currentMessage.indexOf(endTag);

          if (endIndex !== -1) {
            // For the final chunk before the end tag
            currentMessage = currentMessage.slice(0, endIndex).trim();
            const messageToSend = currentMessage.slice(
              currentMessage.indexOf(state.lastSent) + state.lastSent.length,
            );

            if (messageToSend) {
              yield Message(messageToSend, states.chunk as AgentMessageType);
            }
            // Send MESSAGE_END when we reach the end tag
            yield Message('', states.end as AgentMessageType);
            state.messageEnded = true;
          } else {
            // For chunks in between start and end
            const messageToSend = comingFromStart ? state.message : chunk;
            if (messageToSend) {
              state.lastSent = messageToSend;
              yield Message(
                comingFromStart ? state.message : chunk,
                states.chunk as AgentMessageType,
              );
            }
          }

          state.message = currentMessage;
          state.lastSent = state.message;
        } else {
          state.message += chunk;
        }
      }
    }
  }

  async *ask(
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
      // First try to parse as JSON
      contextObj = JSON.parse(context) as PassedContext;
    } catch (e) {
      try {
        // If JSON parsing fails, try to load from file
        const fileContent = fs.readFileSync(context, 'utf8');
        contextObj = JSON.parse(fileContent) as PassedContext;
      } catch (fileError) {
        // If both approaches fail, use empty object
        contextObj = {} as PassedContext;
      }
    }

    yield Message('Starting process', AgentMessageType.STREAM_START);

    let guardLoop = 0;

    const executionState: ExecutionState = {
      query: message,
      context: contextObj.context,
      previousHistory: contextObj.previousHistory,
      history: contextObj.history ?? [], // Track the full ReAct history
      completed: false,
      autoMode: autoMode ?? false,
      finalAnswer: undefined,
    };

    while (!executionState.completed && guardLoop < 10) {
      const llmResponse = this.makeNextCall(executionState);

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

        yield* this.processTag(
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

        yield* this.processTag(
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

      // Parse the response to extract thought and skill

      const skillMatch = totalMessage.match(/<action>(.*?)<\/action>/s);
      const isFinalAnswer = totalMessage.includes('<final_response>');
      const isQuestion = totalMessage.includes('<question_response>');

      // Extract skill details
      const thought = thoughtState.message;
      const skillName = skillMatch ? skillMatch[1].trim() : '';

      // Record this step in history
      const stepRecord: HistoryStep = {
        thought,
        action: skillName,
        userMessage: messageState.message,
        isQuestion,
      };

      // If this is the final break here
      if (isFinalAnswer) {
        executionState.completed = true;
        executionState.history.push(stepRecord);

        break;
      }

      // If it is question break the while loop here
      if (isQuestion) {
        executionState.history.push(stepRecord);
        break;
      }

      const skillLlmResponse = this.makeActionInputCall(
        executionState,
        thought,
        skillName,
      );

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

        yield* this.processTag(
          skillState,
          totalSkillResponse,
          chunk,
          '<action_input>',
          '</action_input>',
          {
            start: AgentMessageType.ACTION_START,
            chunk: AgentMessageType.ACTION_CHUNK,
            end: AgentMessageType.ACTION_END,
          },
        );
      }

      const parsedInput = JSON.parse(skillState.message);

      const result = await this.runSkill(
        skillName ?? '',
        parsedInput,
        authConfig,
      );

      const skillObservationResponse = this.makeActionObservationCall({
        actionInput: skillState.message,
        skillName,
        actionResponse: result,
        thought,
        executionState,
      });

      let observationText = '';
      for await (const chunk of skillObservationResponse) {
        observationText += chunk;
      }

      // Extract observation content from tags
      const observationMatch = observationText.match(
        /<observation>(.*?)<\/observation>/s,
      );
      const observation = observationMatch
        ? observationMatch[1].trim()
        : observationText;

      // Record the observation
      stepRecord.observation = observation;
      stepRecord.success = true;

      executionState.history.push(stepRecord);

      guardLoop++;
    }

    yield Message('Stream ended', AgentMessageType.STREAM_END);

    try {
      // Create a context object suitable for saving
      const contextToSave = {
        context: executionState.context,
        previousHistory: executionState.previousHistory,
        history: executionState.history,
      };

      // Write to context.json in the current directory
      fs.writeFileSync('context.json', JSON.stringify(contextToSave, null, 2));
      // eslint-disable-next-line no-empty
    } catch (error) {}
  }

  /**
   * Abstract method to run the skill
   * @param skillName Which skill to run
   * @param parameters The data to the skill
   * @param intergrationConfig headers for the API to run
   */
  abstract runSkill(
    skillName: string,
    parameters: any,
    intergrationConfig: Record<string, string>,
  ): Promise<string>;
}
