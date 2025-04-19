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
  SKILL_START = 'SKILL_START',
  SKILL_CHUNK = 'SKILL_CHUNK',
  SKILL_END = 'SKILL_END',

  STEP = 'STEP',
  ERROR = 'ERROR',
}

export interface AgentMessage {
  message?: string;
  type: AgentMessageType;
  metadata: Record<string, any>;
}

export const Message = (
  message: string,
  type: AgentMessageType,
  extraParams: Record<string, string> = {},
): AgentMessage => {
  // For all message types, we use the message field
  // The type field differentiates how the message should be interpreted
  // For STEP and SKILL types, the message can contain JSON data as a string
  return { message, type, metadata: extraParams };
};
