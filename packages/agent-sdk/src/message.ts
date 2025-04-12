export enum AgentMessageType {
  STREAM_START = 'STREAM_START',
  STREAM_END = 'STREAM_END',
  MESSAGE = 'MESSAGE',
  ERROR = 'ERROR',
  QUESTION = 'QUESTION',
}

export interface AgentMessage {
  isFinal?: boolean;
  message: string;
  type: AgentMessageType;
}

export const Message = (
  isFinal: boolean,
  message: string,
  type: AgentMessageType,
): AgentMessage => {
  return { isFinal, message, type };
};
