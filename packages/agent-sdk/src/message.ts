export enum AgentMessageType {
  STREAM_START = 'STREAM_START',
  STREAM_END = 'STREAM_END',

  // Used in ReACT based prompting
  THOUGHT_START = 'THOUGHT_START',
  THOUGHT_CHUNK = 'THOUGHT_CHUNK',
  THOUGHT_END = 'THOUGHT_END',

  // Message types
  MESSAGE_START = 'MESSAGE_START',
  MESSAGE_CHUNK = 'MESSAGE_CHUNK',
  MESSAGE_END = 'MESSAGE_END',

  // This is used to return action input
  ACTION_START = 'ACTION_START',
  ACTION_CHUNK = 'ACTION_CHUNK',
  ACTION_END = 'ACTION_END',

  ERROR = 'ERROR',
}

export interface AgentMessage {
  message: string;
  type: AgentMessageType;
}

export const Message = (
  message: string,
  type: AgentMessageType,
): AgentMessage => {
  return { message, type };
};
