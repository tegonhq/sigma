import Anthropic from '@anthropic-ai/sdk';
import { MessageParam } from '@anthropic-ai/sdk/resources';

import { AgentMessageType, Message } from './types';
import { TokenCount } from './types';
interface State {
  inTag: boolean;
  messageEnded: boolean;
  message: string;
  lastSent: string;
}

export interface ExecutionState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agentFlow: any;
  userMessage: string;
  message: string;
}

export async function* processTag(
  state: State,
  totalMessage: string,
  chunk: string,
  startTag: string,
  endTag: string,
  states: { start: string; chunk: string; end: string },
  extraParams: Record<string, string> = {},
) {
  let comingFromStart = false;

  if (!state.messageEnded) {
    if (!state.inTag) {
      const startIndex = totalMessage.indexOf(startTag);
      if (startIndex !== -1) {
        state.inTag = true;
        // Send MESSAGE_START when we first enter the tag
        yield Message('', states.start as AgentMessageType, extraParams);
        const chunkToSend = totalMessage.slice(startIndex + startTag.length);
        state.message += chunkToSend;
        comingFromStart = true;
      }
    }

    if (state.inTag) {
      if (
        chunk.includes('</') && !chunk.includes(startTag)
          ? chunk.includes(endTag)
          : true
      ) {
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
            yield Message(
              messageToSend,
              states.chunk as AgentMessageType,
              extraParams,
            );
          }
          // Send MESSAGE_END when we reach the end tag
          yield Message('', states.end as AgentMessageType, extraParams);

          state.message = currentMessage;
          state.messageEnded = true;
        } else {
          // For chunks in between start and end
          const messageToSend = comingFromStart ? state.message : chunk;
          if (messageToSend) {
            state.lastSent = messageToSend;
            yield Message(
              messageToSend,
              states.chunk as AgentMessageType,
              extraParams,
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

export async function* generate(
  messages: MessageParam[],
  tokenCountState?: TokenCount,
): AsyncGenerator<string> {
  // Check for API keys

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.MODEL;

  if (!anthropicKey || !model) {
    throw new Error('No LLM API key found. Set either ANTHROPIC_API_KEY');
  }

  // Try Anthropic next if key exists
  if (anthropicKey) {
    const anthropic = new Anthropic({
      apiKey: anthropicKey,
    });

    const stream = anthropic.messages.stream({
      messages,
      model,
      max_tokens: 5000,
    });

    tokenCountState.inputTokens = Math.ceil(
      messages.reduce((acc, msg) => acc + (msg.content?.length || 0) / 4, 0),
    );

    let outputTokenCount = 0;

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        const content = chunk.delta?.text || '';
        if (content) {
          if (tokenCountState) {
            // Increment output token count for each chunk
            outputTokenCount += 1; // This is an approximation
            tokenCountState.outputToken = outputTokenCount;
          }
          yield content;
        }
      } else if (
        chunk.type === 'content_block_start' &&
        chunk.content_block?.text
      ) {
        yield chunk.content_block.text;
      }
    }
    return;
  }

  throw new Error('No valid LLM configuration found');
}
