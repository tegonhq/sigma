import { AgentMessageType, Message } from './types';

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
            yield Message(
              messageToSend,
              states.chunk as AgentMessageType,
              extraParams,
            );
          }
          // Send MESSAGE_END when we reach the end tag
          yield Message('', states.end as AgentMessageType, extraParams);
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
      } else {
        state.message += chunk;
      }
    }
  }
}
