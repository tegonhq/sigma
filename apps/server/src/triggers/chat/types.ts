export interface AgentStep {
  agent: string;
  goal: string;
  reasoning: string;
}

export interface ExecutionState {
  query: string;
  context?: string;
  previousHistory?: Array<{ agent: string; history: string }>;
  history: HistoryStep[];
  completed: boolean;
  autoMode: boolean;
}

export interface TokenCount {
  inputTokens: number;
  outputToken: number;
}

export interface HistoryStep {
  // The agent's reasoning process for this step
  thought?: string;

  // Indicates if this step contains a question for the user
  isQuestion?: boolean;
  // Indicates if this is the final response in the conversation
  isFinal?: boolean;

  // The name of the skill/tool being used in this step
  skill?: string;
  skillId?: string;
  skillInput?: string;

  // This is when the action has run and the output will be put here
  observation?: string;

  // This is what the user will read
  userMessage?: string;

  // If the agent has run completely
  completed?: boolean;

  // Token count
  tokenCount: TokenCount;
}

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
